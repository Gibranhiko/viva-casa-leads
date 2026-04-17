import { useSellerFormStore } from '@/store/useSellerFormStore'
import { ProgressBar } from '@/components/form/ProgressBar'
import { AnimatePresence, motion } from 'framer-motion'
import { useNavigate } from 'react-router'
import type { SellerStepId } from '@/store/useSellerFormStore'

// Steps — Bloque A
import { StepSellerNombre } from '@/steps/seller/StepSellerNombre'
import { StepSellerWhatsapp } from '@/steps/seller/StepSellerWhatsapp'
import { StepSellerEmail } from '@/steps/seller/StepSellerEmail'

// Steps — Bloque B
import { StepSellerDireccion } from '@/steps/seller/StepSellerDireccion'
import { StepSellerTipoPropiedad } from '@/steps/seller/StepSellerTipoPropiedad'
import { StepSellerRecamaras } from '@/steps/seller/StepSellerRecamaras'
import { StepSellerBanos } from '@/steps/seller/StepSellerBanos'
import { StepSellerM2 } from '@/steps/seller/StepSellerM2'
import { StepSellerAntiguedad } from '@/steps/seller/StepSellerAntiguedad'
import { StepSellerCondicion } from '@/steps/seller/StepSellerCondicion'

// Steps — Bloque C
import { StepSellerFotos } from '@/steps/seller/StepSellerFotos'

// Steps — Bloque D
import { StepSellerOcupacion } from '@/steps/seller/StepSellerOcupacion'
import { StepSellerServicios } from '@/steps/seller/StepSellerServicios'
import { StepSellerPredial } from '@/steps/seller/StepSellerPredial'
import { StepSellerEstadoCivil } from '@/steps/seller/StepSellerEstadoCivil'
import { StepSellerEscrituras } from '@/steps/seller/StepSellerEscrituras'
import { StepSellerNumeroDuenos } from '@/steps/seller/StepSellerNumeroDuenos'
import { StepSellerDuenosDisponibles } from '@/steps/seller/StepSellerDuenosDisponibles'
import { StepSellerCredito } from '@/steps/seller/StepSellerCredito'
import { StepSellerCesionInfonavit } from '@/steps/seller/StepSellerCesionInfonavit'
import { StepSellerCancelacionInfonavit } from '@/steps/seller/StepSellerCancelacionInfonavit'
import { StepSellerCuotasCondominio } from '@/steps/seller/StepSellerCuotasCondominio'

// Steps — Bloque E
import { StepSellerPrecio } from '@/steps/seller/StepSellerPrecio'
import { StepSellerUrgencia } from '@/steps/seller/StepSellerUrgencia'
import { StepSellerComentarios } from '@/steps/seller/StepSellerComentarios'

const STEP_COMPONENTS: Record<SellerStepId, React.ComponentType> = {
  seller_nombre: StepSellerNombre,
  seller_whatsapp: StepSellerWhatsapp,
  seller_email: StepSellerEmail,
  seller_direccion: StepSellerDireccion,
  seller_tipo_propiedad: StepSellerTipoPropiedad,
  seller_recamaras: StepSellerRecamaras,
  seller_banos: StepSellerBanos,
  seller_m2: StepSellerM2,
  seller_antiguedad: StepSellerAntiguedad,
  seller_condicion: StepSellerCondicion,
  seller_fotos: StepSellerFotos,
  seller_ocupacion: StepSellerOcupacion,
  seller_servicios: StepSellerServicios,
  seller_predial: StepSellerPredial,
  seller_estado_civil: StepSellerEstadoCivil,
  seller_escrituras: StepSellerEscrituras,
  seller_num_duenos: StepSellerNumeroDuenos,
  seller_duenos_disponibles: StepSellerDuenosDisponibles,
  seller_credito: StepSellerCredito,
  seller_cesion_infonavit: StepSellerCesionInfonavit,
  seller_cancelacion_infonavit: StepSellerCancelacionInfonavit,
  seller_cuotas_condominio: StepSellerCuotasCondominio,
  seller_precio: StepSellerPrecio,
  seller_urgencia: StepSellerUrgencia,
  seller_comentarios: StepSellerComentarios,
}

export function SellerFormShell() {
  const { currentStepIndex, getSteps, currentStepId, prevStep } = useSellerFormStore()
  const navigate = useNavigate()

  const steps = getSteps()
  const stepId = currentStepId()
  const StepComponent = STEP_COMPONENTS[stepId]

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
            <ProgressBar current={currentStepIndex} total={steps.length - 1} />
          </div>
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
