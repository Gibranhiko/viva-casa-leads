export type RedFlag =
  | 'cfe_inactivo'
  | 'escrituras_otro_nombre'
  | 'sin_escrituras'
  | 'multiple_duenos'
  | 'duenos_no_disponibles'
  | 'intestado'
  | 'hipoteca_activa'
  | 'propiedad_invadida'
  | 'inquilinos_presentes'
  | 'predial_insoluto'
  | 'estado_civil_divorciado'
  | 'cancelacion_infonavit_pendiente'
  | 'cuotas_condominio_adeudo'
  | 'propiedad_deteriorada'
  | 'cesion_infonavit_interes'

export interface SellerLead {
  id: string
  createdAt: any
  updatedAt: any
  status: 'nuevo' | 'contactado' | 'en_proceso' | 'cerrado' | 'descartado'

  // Contacto
  nombre: string
  whatsapp: string
  email: string | null

  // Propiedad
  municipio: string
  fraccionamiento: string
  calle: string
  cp: string
  tipoPropiedad: 'fraccionamiento' | 'colonia' | 'departamento' | 'terreno'
  recamaras: '1' | '2' | '3' | '4+'
  banos: '1' | '2' | '3+'
  m2Construccion: 'menos_60' | '60_90' | '90_120' | 'mas_120' | 'no_se'
  antiguedad: 'menos_5' | '5_15' | '15_30' | 'mas_30' | 'no_se'
  condicionFisica: 'buena' | 'reparaciones_menores' | 'reparaciones_mayores' | 'deteriorada'

  // Fotos
  fotoPaths: string[]

  // Ocupación
  ocupacion: 'habitada' | 'rentada' | 'desocupada' | 'invadida'

  // Servicios y adeudos
  serviciosActivos: ('luz' | 'agua' | 'gas')[]
  predialAlCorriente: 'si' | 'no' | 'no_se'

  // Propietario
  estadoCivil: 'soltero' | 'casado' | 'divorciado' | 'viudo'

  // Titulación
  tieneEscrituras: 'propias' | 'otro_nombre' | 'no_tiene'
  numeroDuenos: 'solo_yo' | 'pareja' | 'varios' | 'no_se'
  duenosDisponibles: 'todos' | 'alguno_no' | 'fallecido' | null

  // Crédito
  situacionCredito: 'libre' | 'infonavit_activo' | 'banco' | 'infonavit_pagado' | 'no_se'
  cesionInfonvitInteres: boolean | null
  cancelacionInfonvitRegistrada: 'si' | 'no' | null

  // Condominio
  cuotasCondominio: 'al_corriente' | 'con_adeudo' | 'no_aplica' | null

  // Red flags
  redFlags: RedFlag[]

  // Precio y expectativas
  precioPedido: number | null
  urgencia: 'urgente' | '3_meses' | 'sin_prisa'
  comentarios: string | null

  fuente: 'formulario_web'
}
