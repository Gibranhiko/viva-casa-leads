import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'fracc_privado', label: 'Casa en fracc privado', description: 'Con caseta y acceso controlado' },
  { value: 'fracc_abierto', label: 'Casa en fracc abierto' },
  { value: 'departamento',  label: 'Departamento' },
  { value: 'terreno',       label: 'Terreno' },
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
