import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'

const OPTIONS = [
  { value: 'menos_500k', label: 'Menos de $500,000' },
  { value: '500k_1m', label: '$500,000 – $1,000,000' },
  { value: '1m_2m', label: '$1,000,000 – $2,000,000' },
  { value: '2m_4m', label: '$2,000,000 – $4,000,000' },
  { value: 'mas_4m', label: 'Más de $4,000,000' },
]

export function StepPresupuesto() {
  const { presupuesto, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('presupuesto', value)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Cuál es tu presupuesto aproximado?" hideNext>
      <StepCard options={OPTIONS} selected={presupuesto} onSelect={handleSelect} />
    </StepLayout>
  )
}
