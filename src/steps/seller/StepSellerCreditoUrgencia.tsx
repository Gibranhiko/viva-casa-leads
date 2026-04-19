import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const CREDITO_OPTIONS = [
  { value: 'libre',            label: 'No, está libre de cualquier crédito' },
  { value: 'infonavit_activo', label: 'Sí, crédito INFONAVIT activo', description: 'Aún lo sigo pagando' },
  { value: 'banco',            label: 'Sí, hipoteca con un banco' },
  { value: 'infonavit_pagado', label: 'Ya terminé de pagar mi INFONAVIT' },
  { value: 'no_se',            label: 'No estoy seguro/a' },
]

const URGENCIA_OPTIONS = [
  { value: 'urgente',   label: 'Lo antes posible', description: 'Necesito vender rápido' },
  { value: '3_meses',   label: 'En los próximos 3 meses', description: 'Tengo cierta flexibilidad' },
  { value: 'sin_prisa', label: 'Sin prisa', description: 'Estoy explorando opciones' },
]

export function StepSellerCreditoUrgencia() {
  const { situacionCredito, urgencia, setField, nextStep } = useSellerFormStore()

  const handleCredito = (value: string) => {
    setField('situacionCredito', value as typeof situacionCredito)
  }

  const handleUrgencia = (value: string) => {
    setField('urgencia', value as typeof urgencia)
    if (situacionCredito) setTimeout(nextStep, 200)
  }

  const showNext = !!(situacionCredito && urgencia)

  return (
    <StepLayout title="Crédito y urgencia" onNext={showNext ? nextStep : undefined} hideNext={!showNext}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">¿Tu propiedad tiene hipoteca o crédito?</p>
          <StepCard options={CREDITO_OPTIONS} selected={situacionCredito} onSelect={handleCredito} />
        </div>
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">¿Qué tan pronto necesitas vender?</p>
          <StepCard options={URGENCIA_OPTIONS} selected={urgencia} onSelect={handleUrgencia} />
        </div>
      </div>
    </StepLayout>
  )
}
