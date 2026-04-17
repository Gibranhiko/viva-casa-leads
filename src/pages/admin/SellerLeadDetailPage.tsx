import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getImageUrl, uploadSellerPhoto, deleteStorageFile } from '@/lib/storage'
import { updateSellerLeadStatus, updateSellerLead, deleteSellerLead } from '@/lib/firestore'
import type { SellerLeadEditable } from '@/lib/firestore'
import type { RedFlag } from '@/types/sellerLead'
import { MUNICIPIOS_MTY } from '@/lib/municipios'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { MultiPhotoPicker } from '@/components/form/MultiPhotoPicker'

const MAX_PHOTOS = 5

const STATUS_OPTIONS = ['nuevo', 'contactado', 'en_proceso', 'cerrado', 'descartado']

const URGENCIA_OPTIONS = [
  { value: 'urgente',    label: 'Urgente' },
  { value: '3_meses',   label: 'En 3 meses' },
  { value: 'sin_prisa', label: 'Sin prisa' },
]

const RED_FLAG_META: Record<RedFlag, { label: string; description: string; color: 'red' | 'yellow' | 'gold' }> = {
  cfe_inactivo:                    { label: 'CFE inactivo',                 description: 'La luz no está activa. No está dada de alta o fue cortada.',                            color: 'yellow' },
  servicios_con_adeudo:            { label: 'Servicios con adeudo/cortados', description: 'Luz, agua o gas con adeudo, o agua cortada (SADM/SAPASA). Verificar monto antes de cerrar.', color: 'yellow' },
  escrituras_otro_nombre:          { label: 'Escrituras en otro nombre',    description: 'Las escrituras no están a nombre del vendedor. Requiere trámites adicionales.',            color: 'red'    },
  sin_escrituras:                  { label: 'Sin escrituras',               description: 'La propiedad no está escriturada. Requiere regularización antes de vender.',               color: 'red'    },
  multiple_duenos:                 { label: 'Múltiples dueños',             description: 'Todos los propietarios deben estar presentes o representados para firmar.',                 color: 'yellow' },
  duenos_no_disponibles:           { label: 'Dueño no disponible',          description: 'Algún propietario no puede participar en el proceso. Puede retrasar la venta.',            color: 'red'    },
  intestado:                       { label: 'Dueño fallecido',              description: 'Requiere trámite de sucesión (intestado o testamentario) antes de escriturar.',            color: 'red'    },
  hipoteca_activa:                 { label: 'Hipoteca activa',              description: 'Existe una hipoteca bancaria que debe liquidarse con el producto de la venta.',            color: 'yellow' },
  propiedad_invadida:              { label: 'Propiedad invadida',           description: 'La propiedad tiene invasores. Requiere recuperación legal antes de la venta.',             color: 'red'    },
  inquilinos_presentes:            { label: 'Rentada con inquilinos',       description: 'Hay inquilinos. Requiere desalojo o acuerdo para poder entregar la propiedad.',            color: 'yellow' },
  predial_insoluto:                { label: 'Predial con adeudo',           description: 'El predial no está al corriente. Debe regularizarse para poder escriturar.',               color: 'yellow' },
  estado_civil_divorciado:         { label: 'Divorciado/a',                 description: 'Verificar que la sociedad conyugal esté liquidada o que no aplique en esta propiedad.',   color: 'yellow' },
  cancelacion_infonavit_pendiente: { label: 'Cancelación INFONAVIT pend.',  description: 'El crédito INFONAVIT fue pagado pero no cancelado en el Registro Público. Trámite extra.', color: 'yellow' },
  cuotas_condominio_adeudo:        { label: 'Adeudo de mantenimiento',      description: 'Tiene cuotas de condominio sin pagar. Puede bloquear la escrituración.',                  color: 'yellow' },
  propiedad_deteriorada:           { label: 'Propiedad deteriorada',        description: 'El estado físico puede impedir una valuación INFONAVIT o banco. Afecta precio.',          color: 'red'    },
  cesion_infonavit_interes:        { label: 'Interés en cesión INFONAVIT',  description: 'El vendedor quiere ceder su crédito INFONAVIT activo. Oportunidad de negocio.',           color: 'gold'   },
}

function RedFlagBadge({ flag }: { flag: RedFlag }) {
  const meta = RED_FLAG_META[flag]
  const colorClass = meta.color === 'red'
    ? 'bg-red-50 border-red-200 text-red-700'
    : meta.color === 'gold'
    ? 'bg-amber-50 border-amber-200 text-amber-700'
    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
  const icon = meta.color === 'gold' ? '★' : '⚠'
  return (
    <div className={`border rounded-xl p-3 ${colorClass}`}>
      <p className="text-sm font-semibold flex items-center gap-1.5"><span>{icon}</span>{meta.label}</p>
      <p className="text-xs mt-1 opacity-75">{meta.description}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) return null
  const display = Array.isArray(value) ? value.join(', ') : String(value)
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-900 font-medium">{display.replace(/_/g, ' ')}</p>
    </div>
  )
}

function EditField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
      />
    </div>
  )
}

interface SellerDetail {
  id: string
  nombre: string
  whatsapp: string
  email: string | null
  municipio: string
  fraccionamiento: string
  calle: string
  cp: string
  tipoPropiedad: string | null
  recamaras: string | null
  banos: string | null
  m2Construccion: string | null
  antiguedad: string | null
  condicionFisica: string | null
  fotoPaths: string[]
  ocupacion: string | null
  luzEstado: string | null
  aguaEstado: string | null
  gasEstado: string | null
  predialAlCorriente: string | null
  estadoCivil: string | null
  tieneEscrituras: string | null
  numeroDuenos: string | null
  duenosDisponibles: string | null
  situacionCredito: string | null
  cesionInfonvitInteres: boolean | null
  cancelacionInfonvitRegistrada: string | null
  cuotasCondominio: string | null
  redFlags: RedFlag[]
  precioPedido: number | null
  urgencia: string | null
  comentarios: string | null
  status: string
  createdAt: Date
}

export function SellerLeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<SellerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [photos, setPhotos] = useState<{ path: string; url: string }[]>([])
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  // Edición
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState<SellerLeadEditable>({
    nombre: '',
    whatsapp: '',
    email: null,
    municipio: '',
    fraccionamiento: '',
    calle: '',
    cp: '',
    precioPedido: null,
    urgencia: null,
    comentarios: null,
    fotoPaths: [],
  })
  // Fotos en edición
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)

  // Borrar
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'seller-leads', id)).then(async (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        const detail: SellerDetail = {
          ...data,
          id: snap.id,
          fotoPaths: data.fotoPaths ?? [],
          redFlags: data.redFlags ?? [],
          createdAt: data.createdAt?.toDate() ?? new Date(),
        } as unknown as SellerDetail
        setLead(detail)

        if (detail.fotoPaths.length > 0) {
          const resolved = await Promise.all(
            detail.fotoPaths.map(async (p) => {
              const url = await getImageUrl(p).catch(() => '')
              return url ? { path: p, url } : null
            })
          )
          setPhotos(resolved.filter(Boolean) as { path: string; url: string }[])
        }
      }
      setLoading(false)
    })
  }, [id])

  const handleStatusChange = async (status: string) => {
    if (!id || !lead) return
    setUpdatingStatus(true)
    await updateSellerLeadStatus(id, status)
    setLead({ ...lead, status })
    setUpdatingStatus(false)
  }

  const cancelEdit = useCallback(() => {
    setPendingFiles([])
    setEditing(false)
  }, [])

  const startEdit = () => {
    if (!lead) return
    setEditData({
      nombre: lead.nombre,
      whatsapp: lead.whatsapp,
      email: lead.email,
      municipio: lead.municipio,
      fraccionamiento: lead.fraccionamiento ?? '',
      calle: lead.calle ?? '',
      cp: lead.cp ?? '',
      precioPedido: lead.precioPedido,
      urgencia: lead.urgencia,
      comentarios: lead.comentarios,
      fotoPaths: lead.fotoPaths,
    })
    setPendingFiles([])
    setEditing(true)
  }

  const handleSave = async () => {
    if (!id || !lead) return
    setSaving(true)
    try {
      let newFotoPaths = lead.fotoPaths

      if (pendingFiles.length > 0) {
        setUploadingPhotos(true)
        // Borrar primero los paths viejos, luego subir
        await Promise.allSettled(lead.fotoPaths.map((p) => deleteStorageFile(p)))
        const uploadedPaths = await Promise.all(
          pendingFiles.map((file, i) => uploadSellerPhoto(file, id, i + 1))
        )
        const resolved = await Promise.all(
          uploadedPaths.map(async (p) => {
            const url = await getImageUrl(p).catch(() => '')
            return url ? { path: p, url } : null
          })
        )
        setPhotos(resolved.filter(Boolean) as { path: string; url: string }[])
        newFotoPaths = uploadedPaths
        setPendingFiles([])
        setUploadingPhotos(false)
      }

      const dataToSave = { ...editData, fotoPaths: newFotoPaths }
      await updateSellerLead(id, dataToSave)
      setLead({ ...lead, ...dataToSave })
    } finally {
      setSaving(false)
      setEditing(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !lead) return
    setDeleting(true)
    if (lead.fotoPaths.length > 0) {
      await Promise.allSettled(lead.fotoPaths.map((p) => deleteStorageFile(p)))
    }
    await deleteSellerLead(id)
    navigate('/admin/vendedores')
  }

  if (loading) return <div className="p-12 text-center text-gray-400">Cargando...</div>
  if (!lead) return <div className="p-12 text-center text-gray-400">Lead no encontrado</div>

  const warningFlags = lead.redFlags.filter((f: RedFlag) => f !== 'cesion_infonavit_interes')
  const cesionFlag = lead.redFlags.includes('cesion_infonavit_interes')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {editing ? (
          <>
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
            >
              Cancelar
            </button>
            <h1 className="font-bold text-gray-900 flex-1 truncate">{editData.nombre || 'Sin nombre'}</h1>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {uploadingPhotos ? 'Subiendo fotos...' : saving ? 'Guardando...' : 'Guardar'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/admin/vendedores')} className="text-gray-400 hover:text-gray-600 transition-colors">
              ← Volver
            </button>
            <h1 className="font-bold text-gray-900 flex-1 truncate">{lead.nombre}</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={startEdit}
                className="text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium"
              >
                Editar
              </button>
              <button
                onClick={() => setShowDelete(true)}
                className="text-red-400 hover:text-red-600 transition-colors text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Acciones rápidas */}
        {!editing && (
          <div className="flex gap-2 flex-wrap">
            <a
              href={`https://wa.me/52${lead.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <span>💬</span> Abrir WhatsApp
            </a>
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <span>✉️</span> Enviar email
              </a>
            )}
          </div>
        )}

        {/* Red flags */}
        {!editing && lead.redFlags.length > 0 && (
          <Section title={`Alertas (${warningFlags.length} advertencia${warningFlags.length !== 1 ? 's' : ''}${cesionFlag ? ' · 1 oportunidad' : ''})`}>
            {cesionFlag && <RedFlagBadge flag="cesion_infonavit_interes" />}
            {warningFlags.map((f) => <RedFlagBadge key={f} flag={f} />)}
          </Section>
        )}

        {/* Status */}
        {!editing && (
          <Section title="Status del lead">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={updatingStatus || lead.status === s}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all capitalize
                    ${lead.status === s
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                    }`}
                >
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Contacto */}
        <Section title="Contacto">
          {editing ? (
            <>
              <EditField label="Nombre" value={editData.nombre} onChange={(v) => setEditData({ ...editData, nombre: v })} />
              <EditField label="WhatsApp (10 dígitos)" value={editData.whatsapp} onChange={(v) => setEditData({ ...editData, whatsapp: v })} type="tel" />
              <EditField label="Email" value={editData.email ?? ''} onChange={(v) => setEditData({ ...editData, email: v || null })} type="email" />
            </>
          ) : (
            <>
              <Field label="Nombre" value={lead.nombre} />
              <Field label="WhatsApp" value={lead.whatsapp} />
              <Field label="Email" value={lead.email} />
              <Field label="Fecha de registro" value={lead.createdAt.toLocaleString('es-MX')} />
            </>
          )}
        </Section>

        {/* Propiedad */}
        <Section title="Propiedad">
          {editing ? (
            <>
              <div>
                <p className="text-xs text-gray-400 mb-1">Municipio</p>
                <select
                  value={editData.municipio}
                  onChange={(e) => setEditData({ ...editData, municipio: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
                >
                  <option value="">Seleccionar...</option>
                  {MUNICIPIOS_MTY.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
              <EditField label="Fraccionamiento / Colonia" value={editData.fraccionamiento} onChange={(v) => setEditData({ ...editData, fraccionamiento: v })} />
              <EditField label="Calle" value={editData.calle} onChange={(v) => setEditData({ ...editData, calle: v })} />
              <EditField label="Código postal" value={editData.cp} onChange={(v) => setEditData({ ...editData, cp: v })} />
            </>
          ) : (
            <>
              <Field label="Municipio" value={lead.municipio} />
              <Field label="Fraccionamiento / Colonia" value={lead.fraccionamiento} />
              <Field label="Calle" value={lead.calle} />
              <Field label="Código postal" value={lead.cp} />
              <Field label="Tipo de propiedad" value={lead.tipoPropiedad} />
              <Field label="Recámaras" value={lead.recamaras} />
              <Field label="Baños" value={lead.banos} />
              <Field label="M² de construcción" value={lead.m2Construccion} />
              <Field label="Antigüedad" value={lead.antiguedad} />
              <Field label="Condición física" value={lead.condicionFisica} />
            </>
          )}
        </Section>

        {/* Fotos */}
        {(photos.length > 0 || editing) && (
          <Section title={editing
            ? pendingFiles.length > 0 ? `Fotos nuevas (${pendingFiles.length}/${MAX_PHOTOS})` : photos.length > 0 ? `Fotos actuales (${photos.length})` : 'Fotos'
            : `Fotos (${photos.length})`
          }>
            {editing ? (
              <MultiPhotoPicker
                files={pendingFiles}
                onChange={setPendingFiles}
                existingUrls={photos.map((p) => p.url)}
                max={MAX_PHOTOS}
                disabled={uploadingPhotos}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo, i) => (
                  <button
                    key={photo.path}
                    onClick={() => setLightbox(photo.url)}
                    className="aspect-video overflow-hidden rounded-xl border border-gray-200 hover:opacity-90 transition-opacity"
                  >
                    <img src={photo.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Situación — solo en vista */}
        {!editing && (
          <Section title="Situación de la propiedad">
            <Field label="Ocupación" value={lead.ocupacion} />
            <Field label="Luz (CFE)" value={lead.luzEstado} />
            <Field label="Agua" value={lead.aguaEstado} />
            <Field label="Gas" value={lead.gasEstado} />
            <Field label="Predial" value={lead.predialAlCorriente} />
            <Field label="Cuotas de condominio" value={lead.cuotasCondominio} />
          </Section>
        )}

        {/* Propietario — solo en vista */}
        {!editing && (
          <Section title="Propietario">
            <Field label="Estado civil" value={lead.estadoCivil} />
            <Field label="Escrituras" value={lead.tieneEscrituras} />
            <Field label="Número de dueños" value={lead.numeroDuenos} />
            <Field label="Disponibilidad de dueños" value={lead.duenosDisponibles} />
          </Section>
        )}

        {/* Crédito — solo en vista */}
        {!editing && (
          <Section title="Crédito / Hipoteca">
            <Field label="Situación de crédito" value={lead.situacionCredito} />
            <Field label="Interés en cesión INFONAVIT" value={lead.cesionInfonvitInteres ? 'Sí' : lead.cesionInfonvitInteres === false ? 'No' : null} />
            <Field label="Cancelación INFONAVIT registrada" value={lead.cancelacionInfonvitRegistrada} />
          </Section>
        )}

        {/* Expectativas */}
        <Section title="Expectativas de venta">
          {editing ? (
            <>
              <div>
                <p className="text-xs text-gray-400 mb-1">Precio pedido (MXN)</p>
                <input
                  type="number"
                  value={editData.precioPedido ?? ''}
                  onChange={(e) => setEditData({ ...editData, precioPedido: e.target.value ? Number(e.target.value) : null })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
                  placeholder="Ej. 1500000"
                />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Urgencia</p>
                <select
                  value={editData.urgencia ?? ''}
                  onChange={(e) => setEditData({ ...editData, urgencia: e.target.value || null })}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
                >
                  <option value="">Sin especificar</option>
                  {URGENCIA_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Comentarios</p>
                <textarea
                  value={editData.comentarios ?? ''}
                  onChange={(e) => setEditData({ ...editData, comentarios: e.target.value || null })}
                  rows={3}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400 resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <Field label="Precio pedido (MXN)" value={lead.precioPedido ? `$${lead.precioPedido.toLocaleString('es-MX')}` : null} />
              <Field label="Urgencia" value={lead.urgencia} />
              <Field label="Comentarios" value={lead.comentarios} />
            </>
          )}
        </Section>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img
            src={lightbox}
            alt="Foto ampliada"
            className="max-w-full max-h-full rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 text-white text-2xl hover:opacity-70 transition-opacity"
          >
            ✕
          </button>
        </div>
      )}

      {showDelete && (
        <ConfirmDeleteModal
          name={lead.nombre}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
    </div>
  )
}
