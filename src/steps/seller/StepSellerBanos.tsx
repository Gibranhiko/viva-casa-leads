import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: '1',  label: '1 baño completo' },
  { value: '2',  label: '2 baños completos' },
  { value: '3+', label: '3 o más' },
]

export function StepSellerBanos() {
  const { banos, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('banos', value as typeof banos)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout
      title="¿Cuántos baños completos tiene?"
      subtitle="Cuenta solo los que tienen regadera, WC y lavabo"
      hideNext
    >
      <StepCard options={OPTIONS} selected={banos} onSelect={handleSelect} />
    </StepLayout>
  )
}
