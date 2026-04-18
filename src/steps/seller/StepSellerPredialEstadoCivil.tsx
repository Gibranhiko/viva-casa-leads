import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const PREDIAL_OPTIONS = [
  { value: 'si',    label: 'Sí, está pagado' },
  { value: 'no',    label: 'Tiene adeudo / vencido' },
  { value: 'no_se', label: 'No sé cómo verificarlo' },
]

const ESTADO_CIVIL_OPTIONS = [
  { value: 'soltero',    label: 'Soltero/a' },
  { value: 'casado',     label: 'Casado/a' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo',      label: 'Viudo/a' },
]

export function StepSellerPredialEstadoCivil() {
  const { predialAlCorriente, estadoCivil, setField, nextStep } = useSellerFormStore()

  const handlePredial = (value: string) => {
    setField('predialAlCorriente', value as typeof predialAlCorriente)
  }

  const handleEstadoCivil = (value: string) => {
    setField('estadoCivil', value as typeof estadoCivil)
    if (predialAlCorriente) setTimeout(nextStep, 200)
  }

  const showNext = !!(predialAlCorriente && estadoCivil)

  return (
    <StepLayout title="Predial y estado civil" onNext={showNext ? nextStep : undefined} hideNext={!showNext}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">¿El predial está al corriente?</p>
          <StepCard columns={2} options={PREDIAL_OPTIONS} selected={predialAlCorriente} onSelect={handlePredial} />
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">¿Cuál es tu estado civil?</p>
          <StepCard columns={2} options={ESTADO_CIVIL_OPTIONS} selected={estadoCivil} onSelect={handleEstadoCivil} />
        </div>
      </div>
    </StepLayout>
  )
}
