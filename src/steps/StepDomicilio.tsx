import { useState } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { MUNICIPIOS_MTY } from '@/lib/municipios'

export function StepDomicilio() {
  const { domicilioMunicipio, domicilioFraccionamiento, domicilioCalle, domicilioCP, setField, nextStep } = useFormStore()
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!domicilioMunicipio || !domicilioFraccionamiento.trim() || !domicilioCalle.trim() || !domicilioCP.trim()) {
      setError('Por favor completa todos los campos')
      return
    }
    setError('')
    nextStep()
  }

  const inputClass = "w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5 text-base outline-none transition-colors bg-white"

  return (
    <StepLayout title="¿Dónde vives actualmente?" onNext={handleNext}>
      <div className="flex flex-col gap-3">
        <select
          value={domicilioMunicipio}
          onChange={(e) => setField('domicilioMunicipio', e.target.value)}
          autoFocus
          className={inputClass}
        >
          <option value="">Municipio</option>
          {MUNICIPIOS_MTY.map(({ value, label }) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input
          type="text"
          value={domicilioFraccionamiento}
          onChange={(e) => setField('domicilioFraccionamiento', e.target.value)}
          placeholder="Fraccionamiento o colonia"
          className={inputClass}
        />
        <input
          type="text"
          value={domicilioCalle}
          onChange={(e) => setField('domicilioCalle', e.target.value)}
          placeholder="Calle y número"
          className={inputClass}
        />
        <input
          type="text"
          value={domicilioCP}
          onChange={(e) => setField('domicilioCP', e.target.value.replace(/\D/g, '').slice(0, 5))}
          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
          placeholder="Código postal"
          maxLength={5}
          inputMode="numeric"
          className={inputClass}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    </StepLayout>
  )
}
