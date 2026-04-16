import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const OPTIONS = [
  { value: 'libre',            label: 'No, está libre de cualquier crédito' },
  { value: 'infonavit_activo', label: 'Sí, tengo crédito INFONAVIT activo', description: 'Aún lo sigo pagando' },
  { value: 'banco',            label: 'Sí, tengo hipoteca con un banco' },
  { value: 'infonavit_pagado', label: 'Ya terminé de pagar mi crédito INFONAVIT' },
  { value: 'no_se',            label: 'No estoy seguro/a' },
]

export function StepSellerCredito() {
  const { situacionCredito, setField, nextStep } = useSellerFormStore()

  const handleSelect = (value: string) => {
    setField('situacionCredito', value as typeof situacionCredito)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout
      title="¿Tu propiedad tiene hipoteca o crédito de vivienda?"
      subtitle="Tener hipoteca no impide la venta, solo lo tomamos en cuenta"
      hideNext
    >
      <StepCard options={OPTIONS} selected={situacionCredito} onSelect={handleSelect} />
    </StepLayout>
  )
}
