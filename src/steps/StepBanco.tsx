import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'

const OPTIONS = [
  { value: 'bbva', label: 'BBVA' },
  { value: 'banamex', label: 'Citibanamex' },
  { value: 'santander', label: 'Santander' },
  { value: 'hsbc', label: 'HSBC' },
  { value: 'banorte', label: 'Banorte' },
  { value: 'scotiabank', label: 'Scotiabank' },
  { value: 'indiferente', label: 'Me da igual' },
]

export function StepBanco() {
  const { bancoPreferencia, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('bancoPreferencia', value)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Tienes preferencia de banco?" hideNext>
      <StepCard options={OPTIONS} selected={bancoPreferencia} onSelect={handleSelect} />
    </StepLayout>
  )
}
