import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { UsoInmueble } from '@/types/lead'

const OPTIONS = [
  { value: 'vivir', label: 'Para vivir', icon: '🏡' },
  { value: 'renta_tradicional', label: 'Renta tradicional', description: 'Rentar a largo plazo', icon: '📋' },
  { value: 'renta_vacacional', label: 'Renta vacacional', description: 'Airbnb / temporadas', icon: '🌴' },
]

export function StepUsoInmueble() {
  const { usoInmueble, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('usoInmueble', value as UsoInmueble)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Para qué usarías la propiedad?" hideNext>
      <StepCard options={OPTIONS} selected={usoInmueble} onSelect={handleSelect} />
    </StepLayout>
  )
}
