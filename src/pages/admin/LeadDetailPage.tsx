import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getImageUrl } from '@/lib/storage'
import { updateLeadStatus } from '@/lib/firestore'
import type { LeadRow } from '@/hooks/useLeads'

const STATUS_OPTIONS = ['nuevo', 'contactado', 'calificado', 'descartado']
const STATUS_COLORS: Record<string, string> = {
  nuevo: 'bg-blue-100 text-blue-700',
  contactado: 'bg-yellow-100 text-yellow-700',
  calificado: 'bg-green-100 text-green-700',
  descartado: 'bg-gray-100 text-gray-500',
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
  if (value === null || value === undefined || value === '') return null
  const display = Array.isArray(value) ? value.join(', ') : String(value)
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-gray-900 font-medium capitalize">{display.replace(/_/g, ' ')}</p>
    </div>
  )
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [lead, setLead] = useState<LeadRow | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'leads', id)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data()
        const leadData = { ...data, id: snap.id, createdAt: data.createdAt?.toDate() ?? new Date() } as LeadRow
        setLead(leadData)
        // Cargar imagen si existe
        const infonavit = data.infonavit as Record<string, string> | undefined
        if (infonavit?.nssImageUrl) {
          getImageUrl(infonavit.nssImageUrl).then(setImageUrl).catch(() => null)
        }
      }
      setLoading(false)
    })
  }, [id])

  const handleStatusChange = async (status: string) => {
    if (!id || !lead) return
    setUpdatingStatus(true)
    await updateLeadStatus(id, status)
    setLead({ ...lead, status })
    setUpdatingStatus(false)
  }

  if (loading) return <div className="p-12 text-center text-gray-400">Cargando...</div>
  if (!lead) return <div className="p-12 text-center text-gray-400">Lead no encontrado</div>

  const dom = (lead.domicilioActual as Record<string, string>) ?? {}
  const infonavit = (lead.infonavit as Record<string, unknown>) ?? null
  const banco = (lead.banco as Record<string, unknown>) ?? null
  const propios = (lead.recursosPropios as Record<string, unknown>) ?? null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/admin')} className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Volver
        </button>
        <h1 className="font-bold text-gray-900 flex-1">{lead.nombre}</h1>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status]}`}>
          {lead.status}
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col gap-4">

        {/* Acciones rápidas */}
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

        {/* Cambiar status */}
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

        {/* Contacto */}
        <Section title="Contacto">
          <Field label="Nombre" value={lead.nombre} />
          <Field label="WhatsApp" value={lead.whatsapp} />
          <Field label="Email" value={lead.email} />
          <Field label="Fecha de registro" value={lead.createdAt.toLocaleString('es-MX')} />
        </Section>

        {/* Perfil */}
        <Section title="Perfil personal">
          <Field label="Edad" value={lead.edad as string} />
          <Field label="Estado civil" value={lead.estadoCivil as string} />
          <Field label="Dependientes" value={lead.dependientes as string} />
          <Field label="Municipio" value={dom.municipio} />
          <Field label="Fraccionamiento / Colonia" value={dom.fraccionamiento} />
          <Field label="Calle y número" value={dom.calle} />
          <Field label="Código postal" value={dom.cp} />
        </Section>

        {/* Laboral */}
        <Section title="Situación laboral">
          <Field label="Situación" value={lead.situacionLaboral as string} />
          <Field label="Empresa / Giro" value={lead.empresa as string} />
          <Field label="Ingreso mensual" value={lead.ingresoMensual as string} />
        </Section>

        {/* Crédito */}
        <Section title="Tipo de crédito">
          <Field label="Modalidad" value={lead.tipoCredito as string} />
          {infonavit && <>
            <Field label="NSS" value={infonavit.nss as string} />
            <Field label="Precalificación" value={infonavit.precalificacion as string} />
            {imageUrl && (
              <div>
                <p className="text-xs text-gray-400 mb-2">Screenshot precalificación</p>
                <img src={imageUrl} alt="Precalificación" className="max-w-xs rounded-xl border border-gray-200" />
              </div>
            )}
          </>}
          {banco && <>
            <Field label="Banco preferencia" value={banco.bancoPreferencia as string} />
            <Field label="Enganche" value={banco.tieneEnganche as string} />
          </>}
          {propios && <Field label="Presupuesto" value={propios.presupuesto as string} />}
        </Section>

        {/* Preferencias */}
        <Section title="Preferencias de propiedad">
          <Field label="Uso del inmueble" value={lead.usoInmueble} />
          <Field label="Zonas de interés" value={lead.zonasInteres} />
          <Field label="Tipo de inmueble" value={lead.tipoInmueble as string} />
          <Field label="Características" value={lead.caracteristicas} />
          <Field label="Comentarios" value={lead.comentarios as string} />
        </Section>
      </div>
    </div>
  )
}
