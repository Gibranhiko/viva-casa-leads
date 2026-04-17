import { useFormStore } from '@/store/useFormStore'
import { ProgressBar } from './ProgressBar'
import { AnimatePresence, motion } from 'framer-motion'

// Steps
import { StepWelcome } from '@/steps/StepWelcome'
import { StepContacto } from '@/steps/StepContacto'
import { StepPerfil } from '@/steps/StepPerfil'
import { StepDomicilio } from '@/steps/StepDomicilio'
import { StepSituacionLaboral } from '@/steps/StepSituacionLaboral'
import { StepIngreso } from '@/steps/StepIngreso'
import { StepTipoCredito } from '@/steps/StepTipoCredito'
import { StepNSS } from '@/steps/StepNSS'
import { StepPrecalificacion } from '@/steps/StepPrecalificacion'
import { StepBanco } from '@/steps/StepBanco'
import { StepEnganche } from '@/steps/StepEnganche'
import { StepPresupuesto } from '@/steps/StepPresupuesto'
import { StepUsoInmueble } from '@/steps/StepUsoInmueble'
import { StepBusqueda } from '@/steps/StepBusqueda'
import { StepCaracteristicas } from '@/steps/StepCaracteristicas'
import { StepComentarios } from '@/steps/StepComentarios'
import type { StepId } from '@/store/useFormStore'

const STEP_COMPONENTS: Record<StepId, React.ComponentType> = {
  welcome: StepWelcome,
  contacto: StepContacto,
  perfil: StepPerfil,
  domicilio: StepDomicilio,
  situacionLaboral: StepSituacionLaboral,
  ingreso: StepIngreso,
  tipoCredito: StepTipoCredito,
  nss: StepNSS,
  precalificacion: StepPrecalificacion,
  banco: StepBanco,
  enganche: StepEnganche,
  presupuesto: StepPresupuesto,
  usoInmueble: StepUsoInmueble,
  busqueda: StepBusqueda,
  caracteristicas: StepCaracteristicas,
  comentarios: StepComentarios,
}

// Steps that don't show the back button or progress bar
const HIDDEN_NAV_STEPS: StepId[] = ['welcome']

export function FormShell() {
  const { currentStepIndex, getSteps, currentStepId, prevStep } = useFormStore()

  const steps = getSteps()
  const stepId = currentStepId()
  const StepComponent = STEP_COMPONENTS[stepId]

  const showNav = !HIDDEN_NAV_STEPS.includes(stepId)
  // Progress excludes welcome step (index 0)
  const progressCurrent = Math.max(currentStepIndex, 1)
  const progressTotal = steps.length - 1

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      {/* Header */}
      {showNav && (
        <div className="px-4 pt-4 pb-2 flex items-center gap-3">
          <button
            onClick={prevStep}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Atrás"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="flex-1">
            <ProgressBar current={progressCurrent} total={progressTotal} />
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepId}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className="flex-1 flex flex-col"
          >
            <StepComponent />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
