import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'fraccionamiento', label: 'Casa en fraccionamiento' },
  { value: 'colonia',         label: 'Casa en colonia' },
  { value: 'departamento',    label: 'Departamento' },
  { value: 'terreno',         label: 'Terreno' },
]

export function StepSellerTipoPropiedad() {
  const { tipoPropiedad, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('tipoPropiedad', value as typeof tipoPropiedad)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Qué tipo de propiedad es?" hideNext>
      <StepCard
        options={OPTIONS}
        selected={tipoPropiedad}
        onSelect={handleSelect}
      />
    </StepLayout>
  )
}
