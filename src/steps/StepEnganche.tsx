import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { TieneEnganche } from '@/types/lead'

const OPTIONS = [
  { value: 'listo', label: 'Sí, ya lo tengo listo' },
  { value: 'juntando', label: 'Lo estoy juntando' },
  { value: 'no_sabe', label: 'No sé cuánto necesito' },
]

export function StepEnganche() {
  const { tieneEnganche, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('tieneEnganche', value as TieneEnganche)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Tienes enganche disponible?" hideNext>
      <StepCard options={OPTIONS} selected={tieneEnganche} onSelect={handleSelect} />
    </StepLayout>
  )
}
