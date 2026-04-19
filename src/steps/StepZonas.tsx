import { useState } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { MultiChip } from '@/components/form/MultiChip'
import { StepLayout } from '@/components/form/StepLayout'

const ZONAS = [
  { value: 'monterrey',      label: 'Monterrey' },
  { value: 'san_pedro',      label: 'San Pedro' },
  { value: 'santa_catarina', label: 'Sta. Catarina' },
  { value: 'guadalupe',      label: 'Guadalupe' },
  { value: 'apodaca',        label: 'Apodaca' },
  { value: 'escobedo',       label: 'Escobedo' },
  { value: 'garcia',         label: 'García' },
  { value: 'juarez',         label: 'Juárez' },
  { value: 'san_nicolas',    label: 'San Nicolás' },
  { value: 'cadereyta',      label: 'Cadereyta' },
  { value: 'indiferente',    label: 'Me da igual' },
]

export function StepZonas() {
  const { zonasInteres, setField, nextStep } = useFormStore()
  const [error, setError] = useState('')

  const handleToggle = (value: string) => {
    setError('')
    if (value === 'indiferente') { setField('zonasInteres', ['indiferente']); return }
    const without = zonasInteres.filter((z) => z !== 'indiferente')
    if (without.includes(value)) {
      setField('zonasInteres', without.filter((z) => z !== value))
    } else {
      setField('zonasInteres', [...without, value])
    }
  }

  const handleNext = () => {
    if (zonasInteres.length === 0) { setError('Selecciona al menos una zona'); return }
    nextStep()
  }

  return (
    <StepLayout title="¿En qué zonas te interesa buscar?" subtitle="Puedes elegir varias" onNext={handleNext}>
      <MultiChip options={ZONAS} selected={zonasInteres} onToggle={handleToggle} />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </StepLayout>
  )
}
