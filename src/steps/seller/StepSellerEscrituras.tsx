import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'propias',      label: 'Sí, están a mi nombre' },
  { value: 'otro_nombre',  label: 'Sí, pero están a nombre de un familiar' },
  { value: 'no_tiene',     label: 'No las tengo / No sé dónde están' },
]

export function StepSellerEscrituras() {
  const { tieneEscrituras, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('tieneEscrituras', value as typeof tieneEscrituras)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Tienes las escrituras de tu propiedad?" hideNext>
      <StepCard options={OPTIONS} selected={tieneEscrituras} onSelect={handleSelect} />
    </StepLayout>
  )
}
