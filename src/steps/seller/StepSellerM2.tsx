import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'menos_60', label: 'Menos de 60 m²' },
  { value: '60_90',    label: '60 – 90 m²' },
  { value: '90_120',   label: '90 – 120 m²' },
  { value: 'mas_120',  label: 'Más de 120 m²' },
  { value: 'no_se',    label: 'No sé' },
]

export function StepSellerM2() {
  const { m2Construccion, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('m2Construccion', value as typeof m2Construccion)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Cuántos m² de construcción tiene?" hideNext>
      <StepCard options={OPTIONS} selected={m2Construccion} onSelect={handleSelect} />
    </StepLayout>
  )
}
