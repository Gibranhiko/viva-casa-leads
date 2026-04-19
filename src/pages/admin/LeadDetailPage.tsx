import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getImageUrl, deleteStorageFile } from '@/lib/storage'
import { MessageCircle, Mail } from 'lucide-react'
import { DetailSkeleton } from '@/components/admin/DetailSkeleton'
import { updateLeadStatus, updateLead, deleteLead } from '@/lib/firestore'
import type { LeadRow } from '@/hooks/useLeads'
import { MUNICIPIOS_MTY } from '@/lib/municipios'
import { ConfirmDeleteModal } from '@/components/admin/ConfirmDeleteModal'

const STATUS_OPTIONS = ['nuevo', 'contactado', 'calificado', 'descartado']
const STATUS_COLORS: Record<string, string> = {
  nuevo: 'bg-blue-100 text-blue-700',
  contactado: 'bg-yellow-100 text-yellow-700',
  calificado: 'bg-green-100 text-green-700',
  descartado: 'bg-gray-100 text-gray-500',
}

const INFONAVIT_TYPES = ['infonavit_tradicional', 'infonavit_total', 'cofinavit', 'unamos_creditos', 'segundo_credito']

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-500 text-xs uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: unknown }) {
  if (value === null || value === undefined || value === '') return null
  const display = Array.isArray(value) ? value.join(', ') : String(value)
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-900 font-medium capitalize">{display.replace(/_/g, ' ')}</p>
    </div>
  )
}

function EF({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
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

function ES({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400"
      >
        <option value="">Sin especificar</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}

type EditState = {
  nombre: string; whatsapp: string; email: string
  edad: string; estadoCivil: string; dependientes: string
  domMunicipio: string; domFracc: string; domCalle: string; domCP: string
  situacionLaboral: string; empresa: string; ingresoMensual: string
  nss: string; precalificacion: string
  bancoPreferencia: string; montoCredito: string; tieneEnganche: string
  presupuesto: string
  usoInmueble: string; zonasInteres: string; tipoInmueble: string; caracteristicas: string; comentarios: string
}

const EMPTY_EDIT: EditState = {
  nombre: '', whatsapp: '', email: '',
  edad: '', estadoCivil: '', dependientes: '',
  domMunicipio: '', domFracc: '', domCalle: '', domCP: '',
  situacionLaboral: '', empresa: '', ingresoMensual: '',
  nss: '', precalificacion: '',
  bancoPreferencia: '', montoCredito: '', tieneEnganche: '',
  presupuesto: '',
  usoInmueble: '', zonasInteres: '', tipoInmueble: '', caracteristicas: '', comentarios: '',
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<LeadRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [edit, setEdit] = useState<EditState>(EMPTY_EDIT)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'leads', id)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data()
        const leadData = { ...data, id: snap.id, createdAt: data.createdAt?.toDate() ?? new Date() } as LeadRow
        setLead(leadData)
        const inf = data.infonavit as Record<string, string> | undefined
        if (inf?.nssImageUrl) getImageUrl(inf.nssImageUrl).then(setImageUrl).catch(() => null)
      }
      setLoading(false)
    })
  }, [id])

  const set = (field: keyof EditState) => (v: string) => setEdit((prev) => ({ ...prev, [field]: v }))

  const handleStatusChange = async (status: string) => {
    if (!id || !lead) return
    setUpdatingStatus(true)
    await updateLeadStatus(id, status)
    setLead({ ...lead, status })
    setUpdatingStatus(false)
  }

  const startEdit = () => {
    if (!lead) return
    const dom = (lead.domicilioActual as Record<string, string>) ?? {}
    const inf = (lead.infonavit as Record<string, string>) ?? {}
    const ban = (lead.banco as Record<string, string>) ?? {}
    const pro = (lead.recursosPropios as Record<string, string>) ?? {}
    const arr = (v: unknown) => Array.isArray(v) ? (v as string[]).join(', ') : ''
    setEdit({
      nombre: lead.nombre ?? '',
      whatsapp: lead.whatsapp ?? '',
      email: (lead.email as string) ?? '',
      edad: (lead.edad as string) ?? '',
      estadoCivil: (lead.estadoCivil as string) ?? '',
      dependientes: (lead.dependientes as string) ?? '',
      domMunicipio: dom.municipio ?? '',
      domFracc: dom.fraccionamiento ?? '',
      domCalle: dom.calle ?? '',
      domCP: dom.cp ?? '',
      situacionLaboral: (lead.situacionLaboral as string) ?? '',
      empresa: (lead.empresa as string) ?? '',
      ingresoMensual: (lead.ingresoMensual as string) ?? '',
      nss: inf.nss ?? '',
      precalificacion: inf.precalificacion ?? '',
      bancoPreferencia: ban.bancoPreferencia ?? '',
      montoCredito: ban.montoCredito ?? '',
      tieneEnganche: ban.tieneEnganche ?? '',
      presupuesto: pro.presupuesto ?? '',
      usoInmueble: (lead.usoInmueble as string) ?? '',
      zonasInteres: arr(lead.zonasInteres),
      tipoInmueble: (lead.tipoInmueble as string) ?? '',
      caracteristicas: arr(lead.caracteristicas),
      comentarios: (lead.comentarios as string) ?? '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    if (!id || !lead) return
    setSaving(true)
    const tipoCredito = lead.tipoCredito as string | null

    const updates: Record<string, unknown> = {
      nombre: edit.nombre,
      whatsapp: edit.whatsapp,
      email: edit.email || null,
      edad: edit.edad || null,
      estadoCivil: edit.estadoCivil || null,
      dependientes: edit.dependientes || null,
      domicilioActual: {
        municipio: edit.domMunicipio || null,
        fraccionamiento: edit.domFracc || null,
        calle: edit.domCalle || null,
        cp: edit.domCP || null,
      },
      situacionLaboral: edit.situacionLaboral || null,
      empresa: edit.empresa || null,
      ingresoMensual: edit.ingresoMensual || null,
      usoInmueble: edit.usoInmueble || null,
      tipoInmueble: edit.tipoInmueble || null,
      zonasInteres: edit.zonasInteres ? edit.zonasInteres.split(',').map((s) => s.trim()).filter(Boolean) : [],
      caracteristicas: edit.caracteristicas ? edit.caracteristicas.split(',').map((s) => s.trim()).filter(Boolean) : [],
      comentarios: edit.comentarios || null,
    }

    if (tipoCredito && INFONAVIT_TYPES.includes(tipoCredito)) {
      updates['infonavit.nss'] = edit.nss || null
      updates['infonavit.precalificacion'] = edit.precalificacion || null
    } else if (tipoCredito === 'banco') {
      updates['banco.bancoPreferencia'] = edit.bancoPreferencia || null
      updates['banco.montoCredito'] = edit.montoCredito || null
      updates['banco.tieneEnganche'] = edit.tieneEnganche || null
    } else if (tipoCredito === 'recursos_propios') {
      updates['recursosPropios.presupuesto'] = edit.presupuesto || null
    }

    await updateLead(id, updates)
    setLead({ ...lead, ...updates })
    setSaving(false)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!id || !lead) return
    setDeleting(true)
    const inf = lead.infonavit as Record<string, string> | undefined
    if (inf?.nssImageUrl) await deleteStorageFile(inf.nssImageUrl).catch(() => null)
    await deleteLead(id)
    navigate('/admin')
  }

  if (loading) return <DetailSkeleton />
  if (!lead) return <div className="p-12 text-center text-gray-400">Lead no encontrado</div>

  const dom = (lead.domicilioActual as Record<string, string>) ?? {}
  const infonavit = (lead.infonavit as Record<string, unknown>) ?? null
  const banco = (lead.banco as Record<string, unknown>) ?? null
  const propios = (lead.recursosPropios as Record<string, unknown>) ?? null
  const tipoCredito = lead.tipoCredito as string | null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        {editing ? (
          <>
            <button onClick={() => setEditing(false)} disabled={saving} className="text-gray-400 hover:text-gray-600 transition-colors text-sm">Cancelar</button>
            <h1 className="font-bold text-gray-900 flex-1 truncate">{edit.nombre || 'Sin nombre'}</h1>
            <button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-1.5 rounded-xl transition-colors disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </>
        ) : (
          <>
            <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600 transition-colors">← Volver</button>
            <h1 className="font-bold text-gray-900 flex-1 truncate">{lead.nombre}</h1>
            <div className="flex items-center gap-2">
              <button onClick={startEdit} className="text-gray-400 hover:text-gray-700 transition-colors text-sm font-medium">Editar</button>
              <button onClick={() => setShowDelete(true)} className="text-red-400 hover:text-red-600 transition-colors text-sm font-medium">Eliminar</button>
            </div>
          </>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Acciones rápidas */}
        {!editing && (
          <div className="flex gap-2 flex-wrap">
            <a href={`https://wa.me/52${lead.whatsapp}`} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
              <MessageCircle size={16} /> Abrir WhatsApp
            </a>
            {lead.email && (
              <a href={`mailto:${lead.email}`}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-4 py-2.5 rounded-xl text-sm transition-colors">
                <Mail size={16} /> Enviar email
              </a>
            )}
          </div>
        )}

        {/* Status */}
        {!editing && (
          <Section title="Status del lead">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button key={s} onClick={() => handleStatusChange(s)} disabled={updatingStatus || lead.status === s}
                  className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-medium border-2 transition-all ${lead.status === s ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
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
              <EF label="Nombre" value={edit.nombre} onChange={set('nombre')} />
              <EF label="WhatsApp (10 dígitos)" value={edit.whatsapp} onChange={set('whatsapp')} type="tel" />
              <EF label="Email" value={edit.email} onChange={set('email')} type="email" />
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

        {/* Perfil */}
        <Section title="Perfil personal">
          {editing ? (
            <>
              <EF label="Edad" value={edit.edad} onChange={set('edad')} />
              <ES label="Estado civil" value={edit.estadoCivil} onChange={set('estadoCivil')} options={[
                { value: 'soltero', label: 'Soltero/a' },
                { value: 'casado', label: 'Casado/a' },
                { value: 'divorciado', label: 'Divorciado/a' },
                { value: 'viudo', label: 'Viudo/a' },
                { value: 'union_libre', label: 'Unión libre' },
              ]} />
              <EF label="Dependientes" value={edit.dependientes} onChange={set('dependientes')} />
              <ES label="Municipio" value={edit.domMunicipio} onChange={set('domMunicipio')} options={MUNICIPIOS_MTY.map((m) => ({ value: m.value, label: m.label }))} />
              <EF label="Fraccionamiento / Colonia" value={edit.domFracc} onChange={set('domFracc')} />
              <EF label="Calle y número" value={edit.domCalle} onChange={set('domCalle')} />
              <EF label="Código postal" value={edit.domCP} onChange={set('domCP')} />
            </>
          ) : (
            <>
              <Field label="Edad" value={lead.edad as string} />
              <Field label="Estado civil" value={lead.estadoCivil as string} />
              <Field label="Dependientes" value={lead.dependientes as string} />
              <Field label="Municipio" value={dom.municipio} />
              <Field label="Fraccionamiento / Colonia" value={dom.fraccionamiento} />
              <Field label="Calle y número" value={dom.calle} />
              <Field label="Código postal" value={dom.cp} />
            </>
          )}
        </Section>

        {/* Laboral */}
        <Section title="Situación laboral">
          {editing ? (
            <>
              <ES label="Situación" value={edit.situacionLaboral} onChange={set('situacionLaboral')} options={[
                { value: 'empleado', label: 'Empleado' },
                { value: 'independiente', label: 'Independiente / Negocio propio' },
                { value: 'desempleado', label: 'Sin empleo actualmente' },
              ]} />
              <EF label="Empresa / Giro" value={edit.empresa} onChange={set('empresa')} />
              <EF label="Ingreso mensual" value={edit.ingresoMensual} onChange={set('ingresoMensual')} />
            </>
          ) : (
            <>
              <Field label="Situación" value={lead.situacionLaboral as string} />
              <Field label="Empresa / Giro" value={lead.empresa as string} />
              <Field label="Ingreso mensual" value={lead.ingresoMensual as string} />
            </>
          )}
        </Section>

        {/* Crédito */}
        <Section title="Tipo de crédito">
          <Field label="Modalidad" value={tipoCredito} />
          {infonavit && (
            <>
              {editing ? (
                <>
                  <EF label="NSS" value={edit.nss} onChange={set('nss')} />
                  <ES label="Precalificación" value={edit.precalificacion} onChange={set('precalificacion')} options={[
                    { value: 'menos_300k', label: 'Menos de $300,000' },
                    { value: '300k_500k', label: '$300,000 – $500,000' },
                    { value: '500k_800k', label: '$500,000 – $800,000' },
                    { value: '800k_1.2m', label: '$800,000 – $1,200,000' },
                    { value: 'mas_1.2m', label: 'Más de $1,200,000' },
                  ]} />
                </>
              ) : (
                <>
                  <Field label="NSS" value={infonavit.nss as string} />
                  <Field label="Precalificación" value={infonavit.precalificacion as string} />
                </>
              )}
              {imageUrl && (
                <div>
                  <p className="text-xs text-gray-400 mb-2">Screenshot precalificación</p>
                  <img src={imageUrl} alt="Precalificación" className="max-w-xs rounded-xl border border-gray-200" />
                </div>
              )}
            </>
          )}
          {banco && (
            editing ? (
              <>
                <EF label="Banco preferencia" value={edit.bancoPreferencia} onChange={set('bancoPreferencia')} />
                <ES label="Monto del crédito" value={edit.montoCredito} onChange={set('montoCredito')} options={[
                  { value: 'menos_500k', label: 'Menos de $500,000' },
                  { value: '500k_1m', label: '$500,000 – $1,000,000' },
                  { value: '1m_2m', label: '$1,000,000 – $2,000,000' },
                  { value: '2m_4m', label: '$2,000,000 – $4,000,000' },
                  { value: 'mas_4m', label: 'Más de $4,000,000' },
                ]} />
                <ES label="Tiene enganche" value={edit.tieneEnganche} onChange={set('tieneEnganche')} options={[
                  { value: 'si', label: 'Sí' },
                  { value: 'no', label: 'No' },
                ]} />
              </>
            ) : (
              <>
                <Field label="Banco preferencia" value={banco.bancoPreferencia as string} />
                <Field label="Monto del crédito" value={banco.montoCredito as string} />
                <Field label="Enganche" value={banco.tieneEnganche as string} />
              </>
            )
          )}
          {propios && (
            editing ? (
              <EF label="Presupuesto" value={edit.presupuesto} onChange={set('presupuesto')} />
            ) : (
              <Field label="Presupuesto" value={propios.presupuesto as string} />
            )
          )}
        </Section>

        {/* Preferencias */}
        <Section title="Preferencias de propiedad">
          {editing ? (
            <>
              <ES label="Uso del inmueble" value={edit.usoInmueble} onChange={set('usoInmueble')} options={[
                { value: 'vivir', label: 'Para vivir' },
                { value: 'invertir', label: 'Para invertir' },
              ]} />
              <EF label="Zonas de interés (separadas por coma)" value={edit.zonasInteres} onChange={set('zonasInteres')} />
              <EF label="Tipo de inmueble" value={edit.tipoInmueble} onChange={set('tipoInmueble')} />
              <EF label="Características (separadas por coma)" value={edit.caracteristicas} onChange={set('caracteristicas')} />
              <div>
                <p className="text-xs text-gray-400 mb-1">Comentarios</p>
                <textarea value={edit.comentarios} onChange={(e) => set('comentarios')(e.target.value)} rows={3}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-400 resize-none" />
              </div>
            </>
          ) : (
            <>
              <Field label="Uso del inmueble" value={lead.usoInmueble} />
              <Field label="Zonas de interés" value={lead.zonasInteres} />
              <Field label="Tipo de inmueble" value={lead.tipoInmueble as string} />
              <Field label="Características" value={lead.caracteristicas} />
              <Field label="Comentarios" value={lead.comentarios as string} />
            </>
          )}
        </Section>

        {editing && (
          <div className="flex justify-center">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-500'}`}>
              {lead.status}
            </span>
          </div>
        )}
      </div>

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
