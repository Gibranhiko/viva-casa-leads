import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { Dependientes } from '@/types/lead'

const OPTIONS = [
  { value: 'ninguno', label: 'Ninguno' },
  { value: '1_2', label: '1 o 2' },
  { value: '3_mas', label: '3 o más' },
]

export function StepDependientes() {
  const { dependientes, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('dependientes', value as Dependientes)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Tienes dependientes económicos?" hideNext>
      <StepCard options={OPTIONS} selected={dependientes} onSelect={handleSelect} />
    </StepLayout>
  )
}
