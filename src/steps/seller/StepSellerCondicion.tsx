import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'buena',                label: 'En buen estado, lista para habitar' },
  { value: 'reparaciones_menores', label: 'Necesita reparaciones menores', description: 'Pintura, detalles pequeños' },
  { value: 'reparaciones_mayores', label: 'Necesita trabajo importante', description: 'Pisos, baños, cocina' },
  { value: 'deteriorada',          label: 'Le faltan puertas, ventanas o tiene daños severos' },
]

export function StepSellerCondicion() {
  const { condicionFisica, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('condicionFisica', value as typeof condicionFisica)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout
      title="¿En qué estado físico está la propiedad?"
      subtitle="Esto nos ayuda a preparar la visita del valuador"
      hideNext
    >
      <StepCard options={OPTIONS} selected={condicionFisica} onSelect={handleSelect} />
    </StepLayout>
  )
}
