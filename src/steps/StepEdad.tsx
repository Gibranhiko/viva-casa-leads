import { useState } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepLayout } from '@/components/form/StepLayout'

export function StepEdad() {
  const { edad, setField, nextStep } = useFormStore()
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!edad || edad < 18 || edad > 80) {
      setError('Ingresa una edad válida entre 18 y 80 años')
      return
    }
    setError('')
    nextStep()
  }

  return (
    <StepLayout title="¿Cuántos años tienes?" onNext={handleNext}>
      <input
        type="number"
        value={edad ?? ''}
        onChange={(e) => setField('edad', parseInt(e.target.value) || null)}
        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
        placeholder="Edad"
        autoFocus
        min={18}
        max={80}
        className="w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5 text-lg outline-none transition-colors"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </StepLayout>
  )
}
