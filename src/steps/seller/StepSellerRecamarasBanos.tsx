import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const RECAMARAS = [
  { value: '1',  label: '1 recámara' },
  { value: '2',  label: '2 recámaras' },
  { value: '3',  label: '3 recámaras' },
  { value: '4+', label: '4 o más' },
]

const BANOS = [
  { value: '1',  label: '1 baño' },
  { value: '2',  label: '2 baños' },
  { value: '3+', label: '3 o más' },
]

export function StepSellerRecamarasBanos() {
  const { recamaras, banos, setField, nextStep } = useSellerFormStore()

  const handleRecamaras = (value: string) => {
    setField('recamaras', value as typeof recamaras)
  }

  const handleBanos = (value: string) => {
    setField('banos', value as typeof banos)
    if (recamaras) setTimeout(nextStep, 200)
  }

  const handleNext = () => {
    if (recamaras && banos) nextStep()
  }

  const showNext = !!(recamaras && banos)

  return (
    <StepLayout title="Recámaras y baños" onNext={showNext ? handleNext : undefined} hideNext={!showNext}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">¿Cuántas recámaras tiene?</p>
          <StepCard columns={2} options={RECAMARAS} selected={recamaras} onSelect={handleRecamaras} />
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">¿Cuántos baños?</p>
          <StepCard columns={2} options={BANOS} selected={banos} onSelect={handleBanos} />
        </div>
      </div>
    </StepLayout>
  )
}
