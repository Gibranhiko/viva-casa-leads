import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'si',    label: 'Sí, está pagado' },
  { value: 'no',    label: 'Tiene adeudo / está vencido' },
  { value: 'no_se', label: 'No sé cómo verificarlo' },
]

export function StepSellerPredial() {
  const { predialAlCorriente, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('predialAlCorriente', value as typeof predialAlCorriente)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout
      title="¿El predial de tu propiedad está al corriente?"
      subtitle="El notario necesita predial al corriente para escriturar"
      hideNext
    >
      <StepCard options={OPTIONS} selected={predialAlCorriente} onSelect={handleSelect} />
    </StepLayout>
  )
}
