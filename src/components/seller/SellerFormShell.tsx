import { useSellerFormStore } from '@/store/useSellerFormStore'
import { ProgressBar } from '@/components/form/ProgressBar'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import type { SellerStepId } from '@/store/useSellerFormStore'

import { StepSellerContacto } from '@/steps/seller/StepSellerContacto'
import { StepSellerDireccion } from '@/steps/seller/StepSellerDireccion'
import { StepSellerCondicion } from '@/steps/seller/StepSellerCondicion'
import { StepSellerFotos } from '@/steps/seller/StepSellerFotos'
import { StepSellerCreditoUrgencia } from '@/steps/seller/StepSellerCreditoUrgencia'
import { StepSellerPrecio } from '@/steps/seller/StepSellerPrecio'
import { StepSellerComentarios } from '@/steps/seller/StepSellerComentarios'

const STEP_COMPONENTS: Record<SellerStepId, React.ComponentType> = {
  seller_contacto: StepSellerContacto,
  seller_direccion: StepSellerDireccion,
  seller_condicion: StepSellerCondicion,
  seller_fotos: StepSellerFotos,
  seller_credito_urgencia: StepSellerCreditoUrgencia,
  seller_precio: StepSellerPrecio,
  seller_comentarios: StepSellerComentarios,
}

export function SellerFormShell() {
  const { currentStepIndex, getSteps, currentStepId, prevStep } = useSellerFormStore()
  const navigate = useNavigate()

  const steps = getSteps()
  const stepId = currentStepId()
  const StepComponent = STEP_COMPONENTS[stepId]
  const stepNumber = currentStepIndex + 1
  const stepTotal = steps.length

  const handleBack = () => {
    if (currentStepIndex === 0) {
      navigate('/')
    } else {
      prevStep()
    }
  }

  return (
    <div className="min-h-dvh bg-white flex flex-col">
      <div className="px-4 pt-4 pb-2 flex items-center gap-3">
        <button
          onClick={handleBack}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          aria-label="Atrás"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className="flex-1">
          <ProgressBar current={stepNumber} total={stepTotal} />
        </div>
        <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
          {stepNumber} de {stepTotal}
        </span>
      </div>

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
