import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'menos_5', label: 'Menos de 5 años' },
  { value: '5_15',    label: '5 – 15 años' },
  { value: '15_30',   label: '15 – 30 años' },
  { value: 'mas_30',  label: 'Más de 30 años' },
  { value: 'no_se',   label: 'No sé' },
]

export function StepSellerAntiguedad() {
  const { antiguedad, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('antiguedad', value as typeof antiguedad)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Cuántos años tiene la propiedad?" hideNext>
      <StepCard options={OPTIONS} selected={antiguedad} onSelect={handleSelect} />
    </StepLayout>
  )
}
