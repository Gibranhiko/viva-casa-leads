import { useState } from 'react'
import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'

export function StepSellerContacto() {
  const { nombre, whatsapp, email, edad, setField, nextStep } = useSellerFormStore()
  const [localEmail, setLocalEmail] = useState(email ?? '')
  const [errors, setErrors] = useState({ nombre: '', whatsapp: '', email: '', edad: '' })

  const handleNext = () => {
    const next = { nombre: '', whatsapp: '', email: '', edad: '' }
    if (nombre.trim().length < 3) next.nombre = 'Ingresa tu nombre completo'
    const digits = whatsapp.replace(/\D/g, '')
    if (digits.length !== 10) next.whatsapp = 'Ingresa los 10 dígitos'
    if (localEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(localEmail)) next.email = 'Email inválido'
    if (!edad || edad < 18 || edad > 80) next.edad = 'Edad entre 18 y 80'
    if (next.nombre || next.whatsapp || next.email || next.edad) { setErrors(next); return }
    setField('whatsapp', digits)
    setField('email', localEmail || null)
    nextStep()
  }

  return (
    <StepLayout title="¿Cómo te contactamos?" onNext={handleNext}>
      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="seller-nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            id="seller-nombre"
            type="text"
            value={nombre}
            onChange={(e) => { setField('nombre', e.target.value); setErrors((p) => ({ ...p, nombre: '' })) }}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            placeholder="Tu nombre"
            autoFocus
            className={`w-full border-2 rounded-xl px-4 py-3 text-base outline-none transition-colors ${errors.nombre ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
          />
          {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
        </div>

        <div>
          <label htmlFor="seller-whatsapp" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
          <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors ${errors.whatsapp ? 'border-red-500' : 'border-gray-200 focus-within:border-orange-500'}`}>
            <span className="px-3 py-3 text-base text-gray-500 bg-gray-50 border-r-2 border-gray-200 select-none">+52</span>
            <input
              id="seller-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => { setField('whatsapp', e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors((p) => ({ ...p, whatsapp: '' })) }}
              placeholder="10 dígitos"
              maxLength={10}
              className="flex-1 px-4 py-3 text-base outline-none"
            />
          </div>
          {errors.whatsapp && <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>}
        </div>

        <div>
          <label htmlFor="seller-email" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(opcional)</span></label>
          <input
            id="seller-email"
            type="email"
            value={localEmail}
            onChange={(e) => { setLocalEmail(e.target.value); setErrors((p) => ({ ...p, email: '' })) }}
            placeholder="correo@ejemplo.com"
            className={`w-full border-2 rounded-xl px-4 py-3 text-base outline-none transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="seller-edad" className="block text-sm font-medium text-gray-700 mb-1">Edad</label>
          <input
            id="seller-edad"
            type="number"
            value={edad ?? ''}
            onChange={(e) => { setField('edad', parseInt(e.target.value) || null); setErrors((p) => ({ ...p, edad: '' })) }}
            onKeyDown={(e) => e.key === 'Enter' && handleNext()}
            placeholder="Tu edad"
            min={18}
            max={80}
            className={`w-full border-2 rounded-xl px-4 py-3 text-base outline-none transition-colors ${errors.edad ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
          />
          {errors.edad && <p className="text-red-500 text-sm mt-1">{errors.edad}</p>}
        </div>
      </div>
    </StepLayout>
  )
}
