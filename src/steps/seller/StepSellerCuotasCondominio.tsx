import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'al_corriente', label: 'Sí, estoy al corriente' },
  { value: 'con_adeudo',   label: 'Tengo adeudo', description: 'Puede afectar el proceso de escrituración' },
  { value: 'no_aplica',    label: 'No hay cuotas en mi condominio / No sé' },
]

export function StepSellerCuotasCondominio() {
  const { cuotasCondominio, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('cuotasCondominio', value as typeof cuotasCondominio)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout
      title="¿Estás al corriente con las cuotas de mantenimiento?"
      subtitle="Aplica para condominios y fraccionamientos con cuota"
      hideNext
    >
      <StepCard options={OPTIONS} selected={cuotasCondominio} onSelect={handleSelect} />
    </StepLayout>
  )
}
