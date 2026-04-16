import { useState } from 'react'
import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'

export function StepSellerEmail() {
  const { email, setField, nextStep } = useSellerFormStore()
  const [value, setValue] = useState(email ?? '')
  const [error, setError] = useState('')

  const handleNext = () => {
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError('Ingresa un email válido')
      return
    }
    setError('')
    setField('email', value || null)
    nextStep()
  }

  return (
    <StepLayout
      title="¿Cuál es tu email?"
      subtitle="Opcional"
      onNext={handleNext}
    >
      <input
        type="email"
        value={value}
        onChange={(e) => { setValue(e.target.value); setError('') }}
        onKeyDown={(e) => e.key === 'Enter' && handleNext()}
        placeholder="correo@ejemplo.com"
        autoFocus
        className="w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5 text-lg outline-none transition-colors"
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button
        onClick={() => { setField('email', null); nextStep() }}
        className="mt-4 text-gray-400 text-sm underline underline-offset-2"
      >
        Prefiero no dar mi email
      </button>
    </StepLayout>
  )
}
