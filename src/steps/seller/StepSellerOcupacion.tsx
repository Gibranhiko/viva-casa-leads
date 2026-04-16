import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'habitada',   label: 'Sí, yo la habito' },
  { value: 'rentada',    label: 'Está rentada', description: 'Hay inquilinos actualmente' },
  { value: 'desocupada', label: 'Está desocupada' },
  { value: 'invadida',   label: 'Hay personas ahí sin mi autorización' },
]

export function StepSellerOcupacion() {
  const { ocupacion, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('ocupacion', value as typeof ocupacion)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿La propiedad está ocupada actualmente?" hideNext>
      <StepCard options={OPTIONS} selected={ocupacion} onSelect={handleSelect} />
    </StepLayout>
  )
}
