import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'

const OPTIONS = [
  { value: 'menos_300k', label: 'Menos de $300,000' },
  { value: '300k_500k', label: '$300,000 – $500,000' },
  { value: '500k_800k', label: '$500,000 – $800,000' },
  { value: '800k_1.2m', label: '$800,000 – $1,200,000' },
  { value: 'mas_1.2m', label: 'Más de $1,200,000' },
]

export function StepPrecalificacion() {
  const { precalificacion, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('precalificacion', value)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Cuánto tienes precalificado en INFONAVIT?" hideNext>
      <StepCard options={OPTIONS} selected={precalificacion} onSelect={handleSelect} />
    </StepLayout>
  )
}
