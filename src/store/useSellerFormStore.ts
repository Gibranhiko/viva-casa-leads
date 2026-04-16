import { create } from 'zustand'
import { collection, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { RedFlag } from '@/types/sellerLead'

export type SellerStepId =
  | 'seller_nombre' | 'seller_whatsapp' | 'seller_email'
  | 'seller_direccion'
  | 'seller_tipo_propiedad'
  | 'seller_recamaras' | 'seller_banos' | 'seller_m2' | 'seller_antiguedad'
  | 'seller_condicion'
  | 'seller_fotos'
  | 'seller_ocupacion'
  | 'seller_servicios'
  | 'seller_predial'
  | 'seller_estado_civil'
  | 'seller_escrituras'
  | 'seller_num_duenos'
  | 'seller_duenos_disponibles'
  | 'seller_credito'
  | 'seller_cesion_infonavit'
  | 'seller_cancelacion_infonavit'
  | 'seller_cuotas_condominio'
  | 'seller_precio'
  | 'seller_urgencia'
  | 'seller_comentarios'

interface SellerFormData {
  sellerId: string

  // Contacto
  nombre: string
  whatsapp: string
  email: string | null

  // Propiedad
  municipio: string
  fraccionamiento: string
  calle: string
  cp: string
  tipoPropiedad: 'fracc_privado' | 'fracc_abierto' | 'departamento' | 'terreno' | null
  recamaras: '1' | '2' | '3' | '4+' | null
  banos: '1' | '2' | '3+' | null
  m2Construccion: 'menos_60' | '60_90' | '90_120' | 'mas_120' | 'no_se' | null
  antiguedad: 'menos_5' | '5_15' | '15_30' | 'mas_30' | 'no_se' | null
  condicionFisica: 'buena' | 'reparaciones_menores' | 'reparaciones_mayores' | 'deteriorada' | null

  // Fotos
  fotoPaths: string[]

  // Ocupación
  ocupacion: 'habitada' | 'rentada' | 'desocupada' | 'invadida' | null

  // Servicios y adeudos
  luzEstado: 'activo' | 'adeudo' | 'inactivo' | null
  aguaEstado: 'activo' | 'adeudo' | 'inactivo' | null
  gasEstado: 'activo' | 'adeudo' | 'inactivo' | null
  predialAlCorriente: 'si' | 'no' | 'no_se' | null

  // Propietario
  estadoCivil: 'soltero' | 'casado' | 'divorciado' | 'viudo' | null

  // Titulación
  tieneEscrituras: 'propias' | 'otro_nombre' | 'no_tiene' | null
  numeroDuenos: 'solo_yo' | 'pareja' | 'varios' | 'no_se' | null
  duenosDisponibles: 'todos' | 'alguno_no' | 'fallecido' | null

  // Crédito
  situacionCredito: 'libre' | 'infonavit_activo' | 'banco' | 'infonavit_pagado' | 'no_se' | null
  cesionInfonvitInteres: boolean | null
  cancelacionInfonvitRegistrada: 'si' | 'no' | null

  // Condominio
  cuotasCondominio: 'al_corriente' | 'con_adeudo' | 'no_aplica' | null

  // Precio y expectativas
  tienePrecio: boolean | null
  precioPedido: number | null
  urgencia: 'urgente' | '3_meses' | 'sin_prisa' | null
  comentarios: string | null
}

export interface SellerFormStore extends SellerFormData {
  currentStepIndex: number
  getSteps: () => SellerStepId[]
  currentStepId: () => SellerStepId
  nextStep: () => void
  prevStep: () => void
  setField: <K extends keyof SellerFormData>(field: K, value: SellerFormData[K]) => void
  reset: () => void
}

function buildSellerSteps(data: SellerFormData): SellerStepId[] {
  const steps: SellerStepId[] = [
    'seller_nombre', 'seller_whatsapp', 'seller_email',
    'seller_direccion',
    'seller_tipo_propiedad',
  ]

  // Cuotas solo si fracc privado o departamento
  if (data.tipoPropiedad === 'fracc_privado' || data.tipoPropiedad === 'departamento') {
    steps.push('seller_cuotas_condominio')
  }

  steps.push(
    'seller_recamaras', 'seller_banos', 'seller_m2', 'seller_antiguedad',
    'seller_condicion',
    'seller_fotos',
    'seller_ocupacion',
    'seller_servicios',
    'seller_predial',
    'seller_estado_civil',
    'seller_escrituras',
    'seller_num_duenos',
  )

  // Condicional: disponibilidad de dueños solo si hay más de uno
  if (data.numeroDuenos === 'pareja' || data.numeroDuenos === 'varios') {
    steps.push('seller_duenos_disponibles')
  }

  steps.push('seller_credito')

  // Condicional: ramas de crédito INFONAVIT
  if (data.situacionCredito === 'infonavit_activo') {
    steps.push('seller_cesion_infonavit')
  } else if (data.situacionCredito === 'infonavit_pagado') {
    steps.push('seller_cancelacion_infonavit')
  }

  steps.push('seller_precio', 'seller_urgencia', 'seller_comentarios')

  return steps
}

export function calcularRedFlags(data: SellerFormData): RedFlag[] {
  const flags: RedFlag[] = []

  if (data.condicionFisica === 'deteriorada')          flags.push('propiedad_deteriorada')

  if (data.ocupacion === 'invadida')                   flags.push('propiedad_invadida')
  if (data.ocupacion === 'rentada')                    flags.push('inquilinos_presentes')

  if (data.luzEstado === 'inactivo')                    flags.push('cfe_inactivo')
  if (
    data.luzEstado   === 'adeudo' ||
    data.aguaEstado  === 'adeudo' ||
    data.gasEstado   === 'adeudo' ||
    data.aguaEstado  === 'inactivo'  // agua cortada = probable adeudo SADM/SAPASA
  )                                                    flags.push('servicios_con_adeudo')
  if (data.predialAlCorriente !== 'si')                flags.push('predial_insoluto')

  if (data.estadoCivil === 'divorciado')               flags.push('estado_civil_divorciado')

  if (data.tieneEscrituras === 'otro_nombre')          flags.push('escrituras_otro_nombre')
  if (data.tieneEscrituras === 'no_tiene')             flags.push('sin_escrituras')
  if (
    data.numeroDuenos === 'pareja' ||
    data.numeroDuenos === 'varios' ||
    data.numeroDuenos === 'no_se'
  )                                                    flags.push('multiple_duenos')
  if (data.duenosDisponibles === 'alguno_no')          flags.push('duenos_no_disponibles')
  if (data.duenosDisponibles === 'fallecido')          flags.push('intestado')

  if (data.situacionCredito === 'banco' || data.situacionCredito === 'no_se')
                                                       flags.push('hipoteca_activa')
  if (data.cesionInfonvitInteres === true)             flags.push('cesion_infonavit_interes')
  if (data.cancelacionInfonvitRegistrada === 'no')     flags.push('cancelacion_infonavit_pendiente')

  if (data.cuotasCondominio === 'con_adeudo')          flags.push('cuotas_condominio_adeudo')

  return flags
}

const SESSION_KEY = 'viva-casa-seller-form'

function generateSellerId(): string {
  return doc(collection(db, 'seller-leads')).id
}

function getInitialState(): SellerFormData {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return {
    sellerId: generateSellerId(),
    nombre: '', whatsapp: '', email: null,
    municipio: '', fraccionamiento: '', calle: '', cp: '',
    tipoPropiedad: null,
    recamaras: null, banos: null, m2Construccion: null, antiguedad: null,
    condicionFisica: null,
    fotoPaths: [],
    ocupacion: null,
    luzEstado: null,
    aguaEstado: null,
    gasEstado: null,
    predialAlCorriente: null,
    estadoCivil: null,
    tieneEscrituras: null,
    numeroDuenos: null,
    duenosDisponibles: null,
    situacionCredito: null,
    cesionInfonvitInteres: null,
    cancelacionInfonvitRegistrada: null,
    cuotasCondominio: null,
    tienePrecio: null,
    precioPedido: null,
    urgencia: null,
    comentarios: null,
  }
}

function getInitialStep(): number {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY + '-step')
    if (saved) return parseInt(saved, 10)
  } catch {
    // ignore
  }
  return 0
}

const initialData = getInitialState()

export const useSellerFormStore = create<SellerFormStore>((set, get) => ({
  ...initialData,
  currentStepIndex: getInitialStep(),

  getSteps: () => buildSellerSteps(get()),

  currentStepId: () => {
    const steps = buildSellerSteps(get())
    const idx = Math.min(get().currentStepIndex, steps.length - 1)
    return steps[idx]
  },

  setField: (field, value) => {
    set((state) => {
      const next = { ...state, [field]: value }
      const { currentStepIndex, ...data } = next
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
      } catch { /* ignore */ }
      return next
    })
  },

  nextStep: () => {
    set((state) => {
      const steps = buildSellerSteps(state)
      const next = Math.min(state.currentStepIndex + 1, steps.length - 1)
      try {
        sessionStorage.setItem(SESSION_KEY + '-step', String(next))
      } catch { /* ignore */ }
      return { currentStepIndex: next }
    })
  },

  prevStep: () => {
    set((state) => {
      const prev = Math.max(state.currentStepIndex - 1, 0)
      try {
        sessionStorage.setItem(SESSION_KEY + '-step', String(prev))
      } catch { /* ignore */ }
      return { currentStepIndex: prev }
    })
  },

  reset: () => {
    try {
      sessionStorage.removeItem(SESSION_KEY)
      sessionStorage.removeItem(SESSION_KEY + '-step')
    } catch { /* ignore */ }
    set({ ...getInitialState(), currentStepIndex: 0 })
  },
}))
