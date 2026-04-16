import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'urgente',   label: 'Lo antes posible', description: 'Necesito vender rápido' },
  { value: '3_meses',   label: 'En los próximos 3 meses', description: 'Tengo cierta flexibilidad' },
  { value: 'sin_prisa', label: 'Sin prisa', description: 'Estoy explorando opciones' },
]

export function StepSellerUrgencia() {
  const { urgencia, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('urgencia', value as typeof urgencia)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Qué tan pronto necesitas vender?" hideNext>
      <StepCard options={OPTIONS} selected={urgencia} onSelect={handleSelect} />
    </StepLayout>
  )
}
