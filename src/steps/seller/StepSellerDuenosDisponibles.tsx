import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'todos',     label: 'Sí, todos estamos disponibles' },
  { value: 'alguno_no', label: 'Alguno no está disponible por el momento' },
  { value: 'fallecido', label: 'Uno de los propietarios ha fallecido' },
]

export function StepSellerDuenosDisponibles() {
  const { duenosDisponibles, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('duenosDisponibles', value as typeof duenosDisponibles)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Todos los propietarios pueden participar en el proceso?" hideNext>
      <StepCard options={OPTIONS} selected={duenosDisponibles} onSelect={handleSelect} />
    </StepLayout>
  )
}
