import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getImageUrl, uploadSellerPhoto, deleteStorageFile } from '@/lib/storage'
import { updateSellerLeadStatus, updateSellerLead, deleteSellerLead } from '@/lib/firestore'
import type { SellerLeadEditable } from '@/lib/firestore'
import type { RedFlag } from '@/types/sellerLead'
import { calcularRedFlags } from '@/store/useSellerFormStore'
import { MUNICIPIOS_MTY } from '@/lib/municipios'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'
import { MultiPhotoPicker } from '@/components/form/MultiPhotoPicker'
import { MessageCircle, Mail } from 'lucide-react'
import { DetailSkeleton } from '@/components/admin/DetailSkeleton'

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
  const icon = meta.color === 'gold'
    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  return (
    <div className={`border rounded-xl p-3 ${colorClass}`}>
      <p className="text-sm font-semibold flex items-center gap-1.5">{icon}{meta.label}</p>
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

function EditSelect({
  label,
  value,
  onChange,
  options,
  nullable = true,
}: {
  label: string
  value: string | null
  onChange: (v: string | null) => void
  options: { value: string; label: string }[]
  nullable?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
      >
        {nullable && <option value="">Sin especificar</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
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
    tipoPropiedad: null,
    recamaras: null,
    banos: null,
    m2Construccion: null,
    antiguedad: null,
    ocupacion: null,
    luzEstado: null,
    aguaEstado: null,
    gasEstado: null,
    predialAlCorriente: null,
    cuotasCondominio: null,
    estadoCivil: null,
    tieneEscrituras: null,
    numeroDuenos: null,
    duenosDisponibles: null,
    situacionCredito: null,
    cesionInfonvitInteres: null,
    cancelacionInfonvitRegistrada: null,
    precioPedido: null,
    urgencia: null,
    comentarios: null,
    fotoPaths: [],
    redFlags: [],
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
      tipoPropiedad: lead.tipoPropiedad,
      recamaras: lead.recamaras,
      banos: lead.banos,
      m2Construccion: lead.m2Construccion,
      antiguedad: lead.antiguedad,
      ocupacion: lead.ocupacion,
      luzEstado: lead.luzEstado,
      aguaEstado: lead.aguaEstado,
      gasEstado: lead.gasEstado,
      predialAlCorriente: lead.predialAlCorriente,
      cuotasCondominio: lead.cuotasCondominio,
      estadoCivil: lead.estadoCivil,
      tieneEscrituras: lead.tieneEscrituras,
      numeroDuenos: lead.numeroDuenos,
      duenosDisponibles: lead.duenosDisponibles,
      situacionCredito: lead.situacionCredito,
      cesionInfonvitInteres: lead.cesionInfonvitInteres,
      cancelacionInfonvitRegistrada: lead.cancelacionInfonvitRegistrada,
      precioPedido: lead.precioPedido,
      urgencia: lead.urgencia,
      comentarios: lead.comentarios,
      fotoPaths: lead.fotoPaths,
      redFlags: lead.redFlags,
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

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newRedFlags = calcularRedFlags({ ...lead, ...editData } as any)
      const dataToSave = { ...editData, fotoPaths: newFotoPaths, redFlags: newRedFlags }
      await updateSellerLead(id, dataToSave)
      setLead({ ...lead, ...dataToSave, redFlags: newRedFlags })
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

  if (loading) return <DetailSkeleton />
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
              <MessageCircle size={16} /> Abrir WhatsApp
            </a>
            {lead.email && (
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Mail size={16} /> Enviar email
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
                  className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium border-2 transition-all
                    ${lead.status === s
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                    }`}
                >
                  {s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
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
              <EditSelect label="Tipo de propiedad" value={editData.tipoPropiedad} onChange={(v) => setEditData({ ...editData, tipoPropiedad: v })}
                options={[
                  { value: 'fracc_privado', label: 'Fracc. privado' },
                  { value: 'fracc_abierto', label: 'Fracc. abierto' },
                  { value: 'departamento', label: 'Departamento' },
                  { value: 'terreno', label: 'Terreno' },
                ]}
              />
              <EditSelect label="Recámaras" value={editData.recamaras} onChange={(v) => setEditData({ ...editData, recamaras: v })}
                options={[
                  { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4+', label: '4+' },
                ]}
              />
              <EditSelect label="Baños" value={editData.banos} onChange={(v) => setEditData({ ...editData, banos: v })}
                options={[
                  { value: '1', label: '1' }, { value: '2', label: '2' }, { value: '3+', label: '3+' },
                ]}
              />
              <EditSelect label="M² de construcción" value={editData.m2Construccion} onChange={(v) => setEditData({ ...editData, m2Construccion: v })}
                options={[
                  { value: 'menos_60', label: 'Menos de 60 m²' },
                  { value: '60_90', label: '60–90 m²' },
                  { value: '90_120', label: '90–120 m²' },
                  { value: 'mas_120', label: 'Más de 120 m²' },
                  { value: 'no_se', label: 'No sé' },
                ]}
              />
              <EditSelect label="Antigüedad" value={editData.antiguedad} onChange={(v) => setEditData({ ...editData, antiguedad: v })}
                options={[
                  { value: 'menos_5', label: 'Menos de 5 años' },
                  { value: '5_15', label: '5–15 años' },
                  { value: '15_30', label: '15–30 años' },
                  { value: 'mas_30', label: 'Más de 30 años' },
                  { value: 'no_se', label: 'No sé' },
                ]}
              />
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

        {/* Situación */}
        <Section title="Situación de la propiedad">
          {editing ? (
            <>
              <EditSelect label="Ocupación" value={editData.ocupacion} onChange={(v) => setEditData({ ...editData, ocupacion: v })}
                options={[
                  { value: 'habitada', label: 'Habitada (por el dueño)' },
                  { value: 'rentada', label: 'Rentada' },
                  { value: 'desocupada', label: 'Desocupada' },
                  { value: 'invadida', label: 'Invadida' },
                ]}
              />
              <EditSelect label="Luz (CFE)" value={editData.luzEstado} onChange={(v) => setEditData({ ...editData, luzEstado: v })}
                options={[
                  { value: 'activo', label: 'Activo' },
                  { value: 'adeudo', label: 'Con adeudo' },
                  { value: 'inactivo', label: 'Inactivo / Cortado' },
                ]}
              />
              <EditSelect label="Agua" value={editData.aguaEstado} onChange={(v) => setEditData({ ...editData, aguaEstado: v })}
                options={[
                  { value: 'activo', label: 'Activo' },
                  { value: 'adeudo', label: 'Con adeudo' },
                  { value: 'inactivo', label: 'Inactivo / Cortado' },
                ]}
              />
              <EditSelect label="Gas" value={editData.gasEstado} onChange={(v) => setEditData({ ...editData, gasEstado: v })}
                options={[
                  { value: 'activo', label: 'Activo' },
                  { value: 'adeudo', label: 'Con adeudo' },
                  { value: 'inactivo', label: 'Inactivo / Cortado' },
                ]}
              />
              <EditSelect label="Predial" value={editData.predialAlCorriente} onChange={(v) => setEditData({ ...editData, predialAlCorriente: v })}
                options={[
                  { value: 'si', label: 'Al corriente' },
                  { value: 'no', label: 'Con adeudo' },
                  { value: 'no_se', label: 'No sé' },
                ]}
              />
              <EditSelect label="Cuotas de condominio" value={editData.cuotasCondominio} onChange={(v) => setEditData({ ...editData, cuotasCondominio: v })}
                options={[
                  { value: 'al_corriente', label: 'Al corriente' },
                  { value: 'con_adeudo', label: 'Con adeudo' },
                  { value: 'no_aplica', label: 'No aplica' },
                ]}
              />
            </>
          ) : (
            <>
              <Field label="Ocupación" value={lead.ocupacion} />
              <Field label="Luz (CFE)" value={lead.luzEstado} />
              <Field label="Agua" value={lead.aguaEstado} />
              <Field label="Gas" value={lead.gasEstado} />
              <Field label="Predial" value={lead.predialAlCorriente} />
              <Field label="Cuotas de condominio" value={lead.cuotasCondominio} />
            </>
          )}
        </Section>

        {/* Propietario */}
        <Section title="Propietario">
          {editing ? (
            <>
              <EditSelect label="Estado civil" value={editData.estadoCivil} onChange={(v) => setEditData({ ...editData, estadoCivil: v })}
                options={[
                  { value: 'soltero', label: 'Soltero/a' },
                  { value: 'casado', label: 'Casado/a' },
                  { value: 'divorciado', label: 'Divorciado/a' },
                  { value: 'viudo', label: 'Viudo/a' },
                ]}
              />
              <EditSelect label="Escrituras" value={editData.tieneEscrituras} onChange={(v) => setEditData({ ...editData, tieneEscrituras: v })}
                options={[
                  { value: 'propias', label: 'Sí, a mi nombre' },
                  { value: 'otro_nombre', label: 'Sí, en otro nombre' },
                  { value: 'no_tiene', label: 'No tiene escrituras' },
                ]}
              />
              <EditSelect label="Número de dueños" value={editData.numeroDuenos} onChange={(v) => setEditData({ ...editData, numeroDuenos: v })}
                options={[
                  { value: 'solo_yo', label: 'Solo yo' },
                  { value: 'pareja', label: 'Mi pareja y yo' },
                  { value: 'varios', label: 'Varios propietarios' },
                  { value: 'no_se', label: 'No sé' },
                ]}
              />
              <EditSelect label="Disponibilidad de dueños" value={editData.duenosDisponibles} onChange={(v) => setEditData({ ...editData, duenosDisponibles: v })}
                options={[
                  { value: 'todos', label: 'Todos disponibles' },
                  { value: 'alguno_no', label: 'Alguno no puede' },
                  { value: 'fallecido', label: 'Uno ha fallecido' },
                ]}
              />
            </>
          ) : (
            <>
              <Field label="Estado civil" value={lead.estadoCivil} />
              <Field label="Escrituras" value={lead.tieneEscrituras} />
              <Field label="Número de dueños" value={lead.numeroDuenos} />
              <Field label="Disponibilidad de dueños" value={lead.duenosDisponibles} />
            </>
          )}
        </Section>

        {/* Crédito */}
        <Section title="Crédito / Hipoteca">
          {editing ? (
            <>
              <EditSelect label="Situación de crédito" value={editData.situacionCredito} onChange={(v) => setEditData({ ...editData, situacionCredito: v })}
                options={[
                  { value: 'libre', label: 'Libre de crédito' },
                  { value: 'infonavit_activo', label: 'INFONAVIT activo' },
                  { value: 'banco', label: 'Hipoteca bancaria' },
                  { value: 'infonavit_pagado', label: 'INFONAVIT pagado' },
                  { value: 'no_se', label: 'No sé' },
                ]}
              />
              <EditSelect label="Interés en cesión INFONAVIT" value={editData.cesionInfonvitInteres === true ? 'si' : editData.cesionInfonvitInteres === false ? 'no' : null}
                onChange={(v) => setEditData({ ...editData, cesionInfonvitInteres: v === 'si' ? true : v === 'no' ? false : null })}
                options={[
                  { value: 'si', label: 'Sí' },
                  { value: 'no', label: 'No' },
                ]}
              />
              <EditSelect label="Cancelación INFONAVIT registrada" value={editData.cancelacionInfonvitRegistrada} onChange={(v) => setEditData({ ...editData, cancelacionInfonvitRegistrada: v })}
                options={[
                  { value: 'si', label: 'Sí' },
                  { value: 'no', label: 'No' },
                ]}
              />
            </>
          ) : (
            <>
              <Field label="Situación de crédito" value={lead.situacionCredito} />
              <Field label="Interés en cesión INFONAVIT" value={lead.cesionInfonvitInteres ? 'Sí' : lead.cesionInfonvitInteres === false ? 'No' : null} />
              <Field label="Cancelación INFONAVIT registrada" value={lead.cancelacionInfonvitRegistrada} />
            </>
          )}
        </Section>

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
            className="absolute top-4 right-4 text-white hover:opacity-70 transition-opacity"
          aria-label="Cerrar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
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
