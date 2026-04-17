import { useState } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepLayout } from '@/components/form/StepLayout'

export function StepContacto() {
  const { nombre, whatsapp, setField, nextStep } = useFormStore()
  const [errors, setErrors] = useState({ nombre: '', whatsapp: '' })

  const handleNext = () => {
    const next = { nombre: '', whatsapp: '' }
    if (nombre.trim().length < 3) next.nombre = 'Ingresa tu nombre completo'
    const digits = whatsapp.replace(/\D/g, '')
    if (digits.length !== 10) next.whatsapp = 'Ingresa los 10 dígitos de tu WhatsApp'
    if (next.nombre || next.whatsapp) { setErrors(next); return }
    setField('whatsapp', digits)
    nextStep()
  }

  return (
    <StepLayout
      title="¿Cómo te contactamos?"
      subtitle="Solo toma 3 minutos"
      onNext={handleNext}
    >
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => { setField('nombre', e.target.value); setErrors((p) => ({ ...p, nombre: '' })) }}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            placeholder="Tu nombre"
            autoFocus
            className={`w-full border-2 rounded-xl px-4 py-3 text-lg outline-none transition-colors ${errors.nombre ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
          />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp
          </label>
          <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors ${errors.whatsapp ? 'border-red-500' : 'border-gray-200 focus-within:border-orange-500'}`}>
            <span className="px-3 py-3 text-lg text-gray-500 bg-gray-50 border-r-2 border-gray-200 select-none">
              +52
            </span>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => {
                setField('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10))
                setErrors((p) => ({ ...p, whatsapp: '' }))
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              placeholder="10 dígitos"
              maxLength={10}
              className="flex-1 px-4 py-3 text-lg outline-none"
            />
          </div>
          {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
        </div>
      </div>
    </StepLayout>
  )
}
