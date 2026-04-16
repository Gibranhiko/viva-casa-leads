import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'si', label: 'Sí, ya está cancelado en el Registro Público' },
  { value: 'no', label: 'No lo he tramitado / No lo sé', description: 'Aunque hayas terminado de pagar, este trámite es por separado' },
]

export function StepSellerCancelacionInfonavit() {
  const { cancelacionInfonvitRegistrada, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('cancelacionInfonvitRegistrada', value as typeof cancelacionInfonvitRegistrada)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout
      title="¿Ya tramitaste la cancelación de la hipoteca en escrituras?"
      hideNext
    >
      <StepCard
        options={OPTIONS}
        selected={cancelacionInfonvitRegistrada}
        onSelect={handleSelect}
      />
    </StepLayout>
  )
}
