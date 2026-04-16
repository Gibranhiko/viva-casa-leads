import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: '1',  label: '1 recámara' },
  { value: '2',  label: '2 recámaras' },
  { value: '3',  label: '3 recámaras' },
  { value: '4+', label: '4 o más' },
]

export function StepSellerRecamaras() {
  const { recamaras, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('recamaras', value as typeof recamaras)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Cuántas recámaras tiene?" hideNext>
      <StepCard options={OPTIONS} selected={recamaras} onSelect={handleSelect} />
    </StepLayout>
  )
}
