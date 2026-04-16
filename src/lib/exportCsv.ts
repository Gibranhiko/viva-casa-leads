import type { LeadRow } from '@/hooks/useLeads'
import type { SellerLeadRow } from '@/hooks/useSellerLeads'

function val(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (Array.isArray(v)) return v.join(' | ')
  if (v instanceof Date) return v.toLocaleDateString('es-MX')
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

export function exportToCSV(leads: LeadRow[]) {
  const headers = [
    'ID', 'Fecha', 'Status', 'Nombre', 'WhatsApp', 'Email',
    'Edad', 'Estado Civil', 'Dependientes',
    'Municipio', 'Fraccionamiento', 'Calle', 'CP',
    'Situación Laboral', 'Empresa', 'Ingreso Mensual',
    'Tipo de Crédito',
    'NSS', 'Precalificación',
    'Banco', 'Enganche',
    'Presupuesto',
    'Uso Inmueble', 'Zonas', 'Tipo Inmueble', 'Características', 'Comentarios',
    'Fuente',
  ]

  const rows = leads.map((l) => {
    const dom = (l.domicilioActual as Record<string, string>) ?? {}
    const info = (l.infonavit as Record<string, unknown>) ?? {}
    const banco = (l.banco as Record<string, unknown>) ?? {}
    const propios = (l.recursosPropios as Record<string, unknown>) ?? {}
    return [
      l.id, val(l.createdAt), l.status, l.nombre, l.whatsapp, val(l.email),
      val(l.edad), val(l.estadoCivil), val(l.dependientes),
      val(dom.municipio), val(dom.fraccionamiento), val(dom.calle), val(dom.cp),
      val(l.situacionLaboral), val(l.empresa), val(l.ingresoMensual),
      val(l.tipoCredito),
      val(info.nss), val(info.precalificacion),
      val(banco.bancoPreferencia), val(banco.tieneEnganche),
      val(propios.presupuesto),
      val(l.usoInmueble), val(l.zonasInteres), val(l.tipoInmueble), val(l.caracteristicas), val(l.comentarios),
      val(l.fuente),
    ].map((c) => `"${String(c).replace(/"/g, '""')}"`)
  })

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadCsv(csv, `viva-casa-compradores-${new Date().toISOString().slice(0, 10)}.csv`)
}

export function exportSellerToCSV(leads: SellerLeadRow[]) {
  const headers = [
    'ID', 'Fecha', 'Status', 'Nombre', 'WhatsApp', 'Email',
    'Municipio', 'Fraccionamiento', 'Calle', 'CP',
    'Tipo Propiedad', 'Recámaras', 'Baños', 'M2', 'Antigüedad', 'Condición',
    'Ocupación', 'Servicios', 'Predial', 'Cuotas Condominio',
    'Estado Civil', 'Escrituras', 'Num. Dueños', 'Dueños Disponibles',
    'Crédito', 'Cesión INFONAVIT', 'Cancelación INFONAVIT',
    'Red Flags', 'Precio Pedido', 'Urgencia', 'Comentarios', 'Fuente',
  ]

  const rows = leads.map((l) => [
    l.id, val(l.createdAt), l.status, l.nombre, l.whatsapp, val(l.email),
    val(l.municipio), val(l.fraccionamiento), val(l.calle), val(l.cp),
    val(l.tipoPropiedad), val(l.recamaras), val(l.banos), val(l.m2Construccion), val(l.antiguedad), val(l.condicionFisica),
    val(l.ocupacion), val(l.serviciosActivos), val(l.predialAlCorriente), val(l.cuotasCondominio),
    val(l.estadoCivil), val(l.tieneEscrituras), val(l.numeroDuenos), val(l.duenosDisponibles),
    val(l.situacionCredito), val(l.cesionInfonvitInteres), val(l.cancelacionInfonvitRegistrada),
    val(l.redFlags), val(l.precioPedido), val(l.urgencia), val(l.comentarios), val(l.fuente),
  ].map((c) => `"${String(c).replace(/"/g, '""')}"`))

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  downloadCsv(csv, `viva-casa-vendedores-${new Date().toISOString().slice(0, 10)}.csv`)
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
