import { useState } from 'react'
import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'

export function StepSellerNombre() {
  const { nombre, setField, nextStep } = useSellerFormStore()
  const [error, setError] = useState('')

  const handleNext = () => {
    if (nombre.trim().length < 3) {
      setError('Por favor ingresa tu nombre completo')
      return
    }
    setError('')
    nextStep()
  }

  return (
    <StepLayout title="¿Cuál es tu nombre?" onNext={handleNext}>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setField('nombre', e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
        placeholder="Nombre completo"
        autoFocus
        className="w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5 text-lg outline-none transition-colors"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </StepLayout>
  )
}
