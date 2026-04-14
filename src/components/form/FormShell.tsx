import { useFormStore } from '@/store/useFormStore'
import { ProgressBar } from './ProgressBar'
import { AnimatePresence, motion } from 'framer-motion'

// Steps
import { StepWelcome } from '@/steps/StepWelcome'
import { StepNombre } from '@/steps/StepNombre'
import { StepWhatsapp } from '@/steps/StepWhatsapp'
import { StepEmail } from '@/steps/StepEmail'
import { StepEdad } from '@/steps/StepEdad'
import { StepEstadoCivil } from '@/steps/StepEstadoCivil'
import { StepDependientes } from '@/steps/StepDependientes'
import { StepDomicilio } from '@/steps/StepDomicilio'
import { StepSituacionLaboral } from '@/steps/StepSituacionLaboral'
import { StepEmpresa } from '@/steps/StepEmpresa'
import { StepIngreso } from '@/steps/StepIngreso'
import { StepTipoCredito } from '@/steps/StepTipoCredito'
import { StepNSS } from '@/steps/StepNSS'
import { StepPrecalificacion } from '@/steps/StepPrecalificacion'
import { StepParticipantes } from '@/steps/StepParticipantes'
import { StepBanco } from '@/steps/StepBanco'
import { StepEnganche } from '@/steps/StepEnganche'
import { StepPresupuesto } from '@/steps/StepPresupuesto'
import { StepUsoInmueble } from '@/steps/StepUsoInmueble'
import { StepZonas } from '@/steps/StepZonas'
import { StepTipoInmueble } from '@/steps/StepTipoInmueble'
import { StepCaracteristicas } from '@/steps/StepCaracteristicas'
import { StepComentarios } from '@/steps/StepComentarios'
import type { StepId } from '@/store/useFormStore'

const STEP_COMPONENTS: Record<StepId, React.ComponentType> = {
  welcome: StepWelcome,
  nombre: StepNombre,
  whatsapp: StepWhatsapp,
  email: StepEmail,
  edad: StepEdad,
  estadoCivil: StepEstadoCivil,
  dependientes: StepDependientes,
  domicilio: StepDomicilio,
  situacionLaboral: StepSituacionLaboral,
  empresa: StepEmpresa,
  ingreso: StepIngreso,
  tipoCredito: StepTipoCredito,
  nss: StepNSS,
  precalificacion: StepPrecalificacion,
  participantes: StepParticipantes,
  banco: StepBanco,
  enganche: StepEnganche,
  presupuesto: StepPresupuesto,
  usoInmueble: StepUsoInmueble,
  zonas: StepZonas,
  tipoInmueble: StepTipoInmueble,
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
    <div className="min-h-screen bg-white flex flex-col">
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
          <span className="text-xs text-gray-400 tabular-nums w-10 text-right">
            {progressCurrent}/{progressTotal}
          </span>
        </div>
      )}

      {/* Step content */}
      <div className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={stepId}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
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
