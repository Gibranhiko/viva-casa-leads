import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'ceder',    label: 'Necesito que me quiten este crédito cuanto antes', description: 'No quiero o no puedo seguir pagando — quiero una salida ya' },
  { value: 'liquidar', label: 'Puedo esperar el proceso de venta sin problema',    description: 'No me urge, puedo esperar el proceso de venta' },
]

export function StepSellerCesionInfonavit() {
  const { cesionInfonvitInteres, setField, nextStep } = useSellerFormStore()

  const selected = cesionInfonvitInteres === null ? null
    : cesionInfonvitInteres ? 'ceder' : 'liquidar'

  const handleSelect = (value: string) => {
    setField('cesionInfonvitInteres', value === 'ceder')
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout
      title="¿Qué tan urgente es tu situación con el crédito INFONAVIT?"
      hideNext
    >
      <StepCard options={OPTIONS} selected={selected} onSelect={handleSelect} />
    </StepLayout>
  )
}
