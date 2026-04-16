import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getImageUrl } from '@/lib/storage'
import { updateSellerLeadStatus } from '@/lib/firestore'
import type { RedFlag } from '@/types/sellerLead'

const STATUS_OPTIONS = ['nuevo', 'contactado', 'en_proceso', 'cerrado', 'descartado']
const STATUS_COLORS: Record<string, string> = {
  nuevo:       'bg-blue-100 text-blue-700',
  contactado:  'bg-yellow-100 text-yellow-700',
  en_proceso:  'bg-purple-100 text-purple-700',
  cerrado:     'bg-green-100 text-green-700',
  descartado:  'bg-gray-100 text-gray-500',
}

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
      <p className="text-sm font-semibold flex items-center gap-1.5">
        <span>{icon}</span>
        {meta.label}
      </p>
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
  const [photoUrls, setPhotoUrls] = useState<string[]>([])
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'seller-leads', id)).then(async (snap) => {
      if (snap.exists()) {
        const data = snap.data()
        const detail: SellerDetail = {
          ...data,
          id: snap.id,
          fotoPaths: data.fotoPaths ?? [],
          serviciosActivos: data.serviciosActivos ?? [],
          redFlags: data.redFlags ?? [],
          createdAt: data.createdAt?.toDate() ?? new Date(),
        } as SellerDetail
        setLead(detail)

        // Cargar URLs de fotos
        if (detail.fotoPaths.length > 0) {
          const urls = await Promise.all(
            detail.fotoPaths.map((p) => getImageUrl(p).catch(() => ''))
          )
          setPhotoUrls(urls.filter(Boolean))
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

  if (loading) return <div className="p-12 text-center text-gray-400">Cargando...</div>
  if (!lead) return <div className="p-12 text-center text-gray-400">Lead no encontrado</div>

  const warningFlags = lead.redFlags.filter((f) => f !== 'cesion_infonavit_interes')
  const cesionFlag = lead.redFlags.includes('cesion_infonavit_interes')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/admin/vendedores')} className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Volver
        </button>
        <h1 className="font-bold text-gray-900 flex-1">{lead.nombre}</h1>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[lead.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {lead.status.replace(/_/g, ' ')}
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

        {/* Red flags */}
        {lead.redFlags.length > 0 && (
          <Section title={`Alertas (${warningFlags.length} advertencia${warningFlags.length !== 1 ? 's' : ''}${cesionFlag ? ' · 1 oportunidad' : ''})`}>
            {/* Oportunidad primero */}
            {cesionFlag && <RedFlagBadge flag="cesion_infonavit_interes" />}
            {warningFlags.map((f) => <RedFlagBadge key={f} flag={f} />)}
          </Section>
        )}

        {/* Status */}
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

        {/* Propiedad */}
        <Section title="Propiedad">
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
        </Section>

        {/* Fotos */}
        {photoUrls.length > 0 && (
          <Section title={`Fotos (${photoUrls.length})`}>
            <div className="grid grid-cols-2 gap-2">
              {photoUrls.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setLightbox(url)}
                  className="aspect-video overflow-hidden rounded-xl border border-gray-200 hover:opacity-90 transition-opacity"
                >
                  <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Situación */}
        <Section title="Situación de la propiedad">
          <Field label="Ocupación" value={lead.ocupacion} />
          <Field label="Luz (CFE)" value={lead.luzEstado} />
          <Field label="Agua" value={lead.aguaEstado} />
          <Field label="Gas" value={lead.gasEstado} />
          <Field label="Predial" value={lead.predialAlCorriente} />
          <Field label="Cuotas de condominio" value={lead.cuotasCondominio} />
        </Section>

        {/* Propietario */}
        <Section title="Propietario">
          <Field label="Estado civil" value={lead.estadoCivil} />
          <Field label="Escrituras" value={lead.tieneEscrituras} />
          <Field label="Número de dueños" value={lead.numeroDuenos} />
          <Field label="Disponibilidad de dueños" value={lead.duenosDisponibles} />
        </Section>

        {/* Crédito */}
        <Section title="Crédito / Hipoteca">
          <Field label="Situación de crédito" value={lead.situacionCredito} />
          <Field label="Interés en cesión INFONAVIT" value={lead.cesionInfonvitInteres ? 'Sí' : lead.cesionInfonvitInteres === false ? 'No' : null} />
          <Field label="Cancelación INFONAVIT registrada" value={lead.cancelacionInfonvitRegistrada} />
        </Section>

        {/* Expectativas */}
        <Section title="Expectativas de venta">
          <Field label="Precio pedido (MXN)" value={lead.precioPedido ? `$${lead.precioPedido.toLocaleString('es-MX')}` : null} />
          <Field label="Urgencia" value={lead.urgencia} />
          <Field label="Comentarios" value={lead.comentarios} />
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
    </div>
  )
}
