import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { TipoInmueble } from '@/types/lead'

const OPTIONS = [
  { value: 'fraccionamiento', label: 'Casa en fraccionamiento', icon: '🏘️' },
  { value: 'colonia', label: 'Casa en colonia', icon: '🏠' },
  { value: 'departamento', label: 'Departamento', icon: '🏢' },
  { value: 'indiferente', label: 'Me da igual', icon: '🤷' },
]

export function StepTipoInmueble() {
  const { tipoInmueble, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('tipoInmueble', value as TipoInmueble)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Qué tipo de propiedad buscas?" hideNext>
      <StepCard options={OPTIONS} selected={tipoInmueble} onSelect={handleSelect} />
    </StepLayout>
  )
}
