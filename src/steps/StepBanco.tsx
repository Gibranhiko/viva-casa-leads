import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'

const BANCOS = [
  { value: 'bbva',        label: 'BBVA' },
  { value: 'banamex',     label: 'Citibanamex' },
  { value: 'santander',   label: 'Santander' },
  { value: 'hsbc',        label: 'HSBC' },
  { value: 'banorte',     label: 'Banorte' },
  { value: 'scotiabank',  label: 'Scotiabank' },
  { value: 'indiferente', label: 'Me da igual' },
]

const MONTOS = [
  { value: 'menos_500k', label: 'Menos de $500,000' },
  { value: '500k_1m',    label: '$500,000 – $1,000,000' },
  { value: '1m_2m',      label: '$1,000,000 – $2,000,000' },
  { value: '2m_4m',      label: '$2,000,000 – $4,000,000' },
  { value: 'mas_4m',     label: 'Más de $4,000,000' },
]

export function StepBanco() {
  const { bancoPreferencia, montoCredito, setField, nextStep } = useFormStore()

  const handleBanco = (value: string) => {
    setField('bancoPreferencia', value)
  }

  const handleMonto = (value: string) => {
    setField('montoCredito', value)
    if (bancoPreferencia) setTimeout(nextStep, 200)
  }

  const showNext = !!(bancoPreferencia && montoCredito)

  return (
    <StepLayout title="Crédito bancario" onNext={showNext ? nextStep : undefined} hideNext={!showNext}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">¿Tienes preferencia de banco?</p>
          <StepCard columns={2} options={BANCOS} selected={bancoPreferencia} onSelect={handleBanco} />
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">¿Cuánto te prestaría el banco aproximadamente?</p>
          <StepCard columns={2} options={MONTOS} selected={montoCredito} onSelect={handleMonto} />
        </div>
      </div>
    </StepLayout>
  )
}
