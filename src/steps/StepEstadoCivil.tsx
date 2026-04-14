import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { EstadoCivil } from '@/types/lead'

const OPTIONS = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'union_libre', label: 'Unión libre' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
]

export function StepEstadoCivil() {
  const { estadoCivil, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('estadoCivil', value as EstadoCivil)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Cuál es tu estado civil?" hideNext>
      <StepCard options={OPTIONS} selected={estadoCivil} onSelect={handleSelect} />
    </StepLayout>
  )
}
