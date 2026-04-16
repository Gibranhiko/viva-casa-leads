import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'solo_yo', label: 'Solo yo' },
  { value: 'pareja',  label: 'Yo y mi pareja o cónyuge' },
  { value: 'varios',  label: 'Yo y otros familiares', description: '2 o más dueños' },
  { value: 'no_se',   label: 'No estoy seguro/a' },
]

export function StepSellerNumeroDuenos() {
  const { numeroDuenos, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('numeroDuenos', value as typeof numeroDuenos)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Cuántos propietarios tiene la casa?" hideNext>
      <StepCard options={OPTIONS} selected={numeroDuenos} onSelect={handleSelect} />
    </StepLayout>
  )
}
