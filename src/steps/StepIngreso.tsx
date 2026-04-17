import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'

const OPTIONS = [
  { value: 'menos_5k', label: 'Menos de $5,000' },
  { value: '5k_10k', label: '$5,000 – $10,000' },
  { value: '10k_20k', label: '$10,000 – $20,000' },
  { value: '20k_40k', label: '$20,000 – $40,000' },
  { value: 'mas_40k', label: 'Más de $40,000' },
  { value: 'no_decir', label: 'Prefiero no decirlo' },
]

export function StepIngreso() {
  const { ingresoMensual, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('ingresoMensual', value)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Cuánto ganas al mes aproximadamente?" hideNext>
      <StepCard columns={2} options={OPTIONS} selected={ingresoMensual} onSelect={handleSelect} />
    </StepLayout>
  )
}
