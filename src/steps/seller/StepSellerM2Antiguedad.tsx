import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const M2_OPTIONS = [
  { value: 'menos_60', label: 'Menos de 60 m²' },
  { value: '60_90',    label: '60 – 90 m²' },
  { value: '90_120',   label: '90 – 120 m²' },
  { value: 'mas_120',  label: 'Más de 120 m²' },
  { value: 'no_se',    label: 'No sé' },
]

const ANTIGUEDAD_OPTIONS = [
  { value: 'menos_5', label: 'Menos de 5 años' },
  { value: '5_15',    label: '5 – 15 años' },
  { value: '15_30',   label: '15 – 30 años' },
  { value: 'mas_30',  label: 'Más de 30 años' },
  { value: 'no_se',   label: 'No sé' },
]

export function StepSellerM2Antiguedad() {
  const { m2Construccion, antiguedad, setField, nextStep } = useSellerFormStore()

  const handleM2 = (value: string) => {
    setField('m2Construccion', value as typeof m2Construccion)
  }

  const handleAntiguedad = (value: string) => {
    setField('antiguedad', value as typeof antiguedad)
    if (m2Construccion) setTimeout(nextStep, 200)
  }

  const showNext = !!(m2Construccion && antiguedad)

  return (
    <StepLayout title="Tamaño y antigüedad" onNext={showNext ? nextStep : undefined} hideNext={!showNext}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">¿Cuántos m² de construcción tiene?</p>
          <StepCard columns={2} options={M2_OPTIONS} selected={m2Construccion} onSelect={handleM2} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">¿Qué antigüedad tiene?</p>
          <StepCard columns={2} options={ANTIGUEDAD_OPTIONS} selected={antiguedad} onSelect={handleAntiguedad} />
        </div>
      </div>
    </StepLayout>
  )
}
