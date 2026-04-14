import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { SituacionLaboral } from '@/types/lead'

const OPTIONS = [
  { value: 'empleado_formal', label: 'Empleado formal', description: 'Con contrato y prestaciones' },
  { value: 'empleado_informal', label: 'Empleado informal', description: 'Sin contrato formal' },
  { value: 'independiente', label: 'Independiente / Negocio propio' },
  { value: 'pensionado', label: 'Pensionado / Jubilado' },
  { value: 'sin_empleo', label: 'Sin empleo actualmente' },
]

export function StepSituacionLaboral() {
  const { situacionLaboral, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('situacionLaboral', value as SituacionLaboral)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Cuál es tu situación laboral?" hideNext>
      <StepCard options={OPTIONS} selected={situacionLaboral} onSelect={handleSelect} />
    </StepLayout>
  )
}
