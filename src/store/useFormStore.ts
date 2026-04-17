import { create } from 'zustand'
import { collection, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type {
  EstadoCivil, Dependientes, SituacionLaboral, TipoCredito,
  UsoInmueble, TipoInmueble, Participantes, TieneEnganche
} from '@/types/lead'

export type StepId =
  | 'welcome'
  | 'contacto' | 'email'
  | 'perfil' | 'domicilio'
  | 'situacionLaboral' | 'empresa' | 'ingreso'
  | 'tipoCredito'
  | 'nss' | 'precalificacion'
  | 'banco' | 'enganche'
  | 'presupuesto'
  | 'usoInmueble' | 'busqueda' | 'caracteristicas' | 'comentarios'

interface FormData {
  leadId: string

  // Contacto
  nombre: string
  whatsapp: string
  email: string | null

  // Perfil
  edad: number | null
  estadoCivil: EstadoCivil | null
  dependientes: Dependientes | null
  domicilioMunicipio: string
  domicilioFraccionamiento: string
  domicilioCalle: string
  domicilioCP: string

  // Laboral
  situacionLaboral: SituacionLaboral | null
  empresa: string | null
  ingresoMensual: string | null

  // Crédito
  tipoCredito: TipoCredito | null

  // INFONAVIT
  nss: string | null
  nssImageUrl: string | null
  precalificacion: string | null
  participantes: Participantes | null

  // Banco
  bancoPreferencia: string | null
  tieneEnganche: TieneEnganche | null

  // Recursos propios
  presupuesto: string | null

  // Preferencias
  usoInmueble: UsoInmueble | null
  zonasInteres: string[]
  tipoInmueble: TipoInmueble | null
  caracteristicas: string[]
  comentarios: string | null
}

export interface FormStore extends FormData {
  currentStepIndex: number
  getSteps: () => StepId[]
  currentStepId: () => StepId
  nextStep: () => void
  prevStep: () => void
  setField: <K extends keyof FormData>(field: K, value: FormData[K]) => void
  reset: () => void
}

const INFONAVIT_TYPES: TipoCredito[] = [
  'infonavit_tradicional', 'infonavit_total', 'cofinavit', 'unamos_creditos', 'segundo_credito'
]


function buildSteps(data: FormData): StepId[] {
  const steps: StepId[] = [
    'welcome', 'contacto', 'email',
    'perfil', 'domicilio',
    'situacionLaboral',
  ]

  if (data.situacionLaboral !== 'sin_empleo') {
    steps.push('empresa')
  }

  steps.push('ingreso', 'tipoCredito')

  if (data.tipoCredito && INFONAVIT_TYPES.includes(data.tipoCredito)) {
    steps.push('nss', 'precalificacion')
  } else if (data.tipoCredito === 'banco') {
    steps.push('banco', 'enganche')
  } else if (data.tipoCredito === 'recursos_propios') {
    steps.push('presupuesto')
  }

  steps.push('usoInmueble', 'busqueda', 'caracteristicas', 'comentarios')

  return steps
}

const SESSION_KEY = 'viva-casa-form'

function generateLeadId(): string {
  return doc(collection(db, 'leads')).id
}

function getInitialState(): FormData {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    // ignore
  }
  return {
    leadId: generateLeadId(),
    nombre: '', whatsapp: '', email: null,
    edad: null, estadoCivil: null, dependientes: null,
    domicilioMunicipio: '', domicilioFraccionamiento: '', domicilioCalle: '', domicilioCP: '',
    situacionLaboral: null, empresa: null, ingresoMensual: null,
    tipoCredito: null,
    nss: null, nssImageUrl: null, precalificacion: null, participantes: null,
    bancoPreferencia: null, tieneEnganche: null,
    presupuesto: null,
    usoInmueble: null, zonasInteres: [], tipoInmueble: null,
    caracteristicas: [], comentarios: null,
  }
}

function getInitialStep(_data: FormData): number {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY + '-step')
    if (saved) return parseInt(saved, 10)
  } catch {
    // ignore
  }
  return 0
}

const initialData = getInitialState()

export const useFormStore = create<FormStore>((set, get) => ({
  ...initialData,
  currentStepIndex: getInitialStep(initialData),

  getSteps: () => buildSteps(get()),

  currentStepId: () => {
    const steps = buildSteps(get())
    const idx = Math.min(get().currentStepIndex, steps.length - 1)
    return steps[idx]
  },

  setField: (field, value) => {
    set((state) => {
      const next = { ...state, [field]: value }
      // Persist to sessionStorage
      const { currentStepIndex, ...data } = next
      try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
      } catch { /* ignore */ }
      return next
    })
  },

  nextStep: () => {
    set((state) => {
      const steps = buildSteps(state)
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
