import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'liquidar', label: 'Liquidarlo con el producto de la venta', description: 'Proceso normal' },
  { value: 'ceder',    label: 'Ya no quiero seguir pagando — me ayudan', description: 'Existen opciones para transferir el crédito a otra persona' },
]

export function StepSellerCesionInfonavit() {
  const { cesionInfonvitInteres, setField, nextStep } = useSellerFormStore()

  const selected = cesionInfonvitInteres === null ? null
    : cesionInfonvitInteres ? 'ceder' : 'liquidar'

  const handleSelect = (value: string) => {
    setField('cesionInfonvitInteres', value === 'ceder')
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout
      title="¿Qué preferirías hacer con tu crédito INFONAVIT?"
      hideNext
    >
      <StepCard options={OPTIONS} selected={selected} onSelect={handleSelect} />
    </StepLayout>
  )
}
