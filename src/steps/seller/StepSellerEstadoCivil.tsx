import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'soltero',   label: 'Soltero/a' },
  { value: 'casado',    label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo',     label: 'Viudo/a' },
]

export function StepSellerEstadoCivil() {
  const { estadoCivil, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('estadoCivil', value as typeof estadoCivil)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout
      title="¿Cuál es tu estado civil actualmente?"
      subtitle="Esto nos ayuda a preparar los documentos correctos para la venta"
      hideNext
    >
      <StepCard options={OPTIONS} selected={estadoCivil} onSelect={handleSelect} />
    </StepLayout>
  )
}
