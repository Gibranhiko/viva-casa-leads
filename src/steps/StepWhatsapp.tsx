import { useState } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepLayout } from '@/components/form/StepLayout'

export function StepWhatsapp() {
  const { whatsapp, setField, nextStep } = useFormStore()
  const [error, setError] = useState('')

  const handleNext = () => {
    const digits = whatsapp.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Ingresa los 10 dígitos de tu WhatsApp')
      return
    }
    setError('')
    setField('whatsapp', digits)
    nextStep()
  }

  return (
    <StepLayout title="¿Cuál es tu WhatsApp?" onNext={handleNext}>
      <div className="flex items-center border-2 border-gray-200 focus-within:border-orange-500 rounded-xl overflow-hidden transition-colors">
        <span className="px-3 py-3.5 text-lg text-gray-500 bg-gray-50 border-r-2 border-gray-200 select-none">
          +52
        </span>
        <input
          type="tel"
          value={whatsapp}
          onChange={(e) => setField('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))}
          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          placeholder="10 dígitos"
          autoFocus
          maxLength={10}
          className="flex-1 px-4 py-3.5 text-lg outline-none"
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </StepLayout>
  )
}
