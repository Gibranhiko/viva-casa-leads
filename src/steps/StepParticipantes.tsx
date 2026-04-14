import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { Participantes } from '@/types/lead'

const OPTIONS = [
  { value: 'pareja', label: 'Mi pareja' },
  { value: 'familiar', label: 'Un familiar' },
  { value: 'amigo', label: 'Un amigo' },
  { value: 'entidad_bancaria', label: 'Una entidad bancaria' },
]

export function StepParticipantes() {
  const { participantes, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('participantes', value as Participantes)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Quién más participa en el crédito?" hideNext>
      <StepCard options={OPTIONS} selected={participantes} onSelect={handleSelect} />
    </StepLayout>
  )
}
