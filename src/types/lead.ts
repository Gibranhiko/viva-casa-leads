export type EstadoCivil = 'soltero' | 'casado' | 'union_libre' | 'divorciado' | 'viudo'
export type Dependientes = 'ninguno' | '1_2' | '3_mas'
export type SituacionLaboral = 'empleado_formal' | 'empleado_informal' | 'independiente' | 'pensionado' | 'sin_empleo'
export type TipoCredito = 'infonavit_tradicional' | 'infonavit_total' | 'cofinavit' | 'unamos_creditos' | 'segundo_credito' | 'banco' | 'recursos_propios'
export type UsoInmueble = 'vivir' | 'renta_tradicional' | 'renta_vacacional'
export type TipoInmueble = 'fraccionamiento' | 'colonia' | 'departamento' | 'indiferente'
export type LeadStatus = 'nuevo' | 'contactado' | 'calificado' | 'descartado'
export type Participantes = 'pareja' | 'familiar' | 'amigo' | 'entidad_bancaria'
export type TieneEnganche = 'listo' | 'juntando' | 'no_sabe'

export interface Lead {
  id: string
  createdAt: Date
  updatedAt: Date
  status: LeadStatus

  nombre: string
  whatsapp: string
  email: string | null

  edad: number
  estadoCivil: EstadoCivil
  dependientes: Dependientes
  domicilioActual: {
    municipio: string
    fraccionamiento: string
    calle: string
  }

  situacionLaboral: SituacionLaboral
  empresa: string | null
  ingresoMensual: string | null

  tipoCredito: TipoCredito

  infonavit?: {
    nss: string | null
    nssImageUrl: string | null
    precalificacion: string | null
    participantes: Participantes | null
  }

  banco?: {
    bancoPreferencia: string | null
    tieneEnganche: TieneEnganche | null
  }

  recursosPropios?: {
    presupuesto: string | null
  }

  usoInmueble: UsoInmueble
  zonasInteres: string[]
  tipoInmueble: TipoInmueble
  caracteristicas: string[]
  comentarios: string | null

  fuente: 'facebook_marketplace' | 'referido' | 'otro'
}
