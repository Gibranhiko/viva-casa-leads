import { useState } from 'react'
import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { MUNICIPIOS_MTY } from '@/lib/municipios'

export function StepSellerDireccion() {
  const { municipio, fraccionamiento, calle, cp, setField, nextStep } = useSellerFormStore()
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!municipio || !fraccionamiento.trim() || !calle.trim() || cp.length !== 5) {
      setError('Por favor completa todos los campos')
      return
    }
    setError('')
    nextStep()
  }

  const inputClass = "w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5 text-base outline-none transition-colors bg-white"

  return (
    <StepLayout
      title="¿Dónde está la propiedad?"
      onNext={handleNext}
    >
      <div className="flex flex-col gap-3">
        <select
          value={municipio}
          onChange={(e) => setField('municipio', e.target.value)}
          autoFocus
          className={inputClass}
        >
          <option value="">Municipio</option>
          {MUNICIPIOS_MTY.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 -mt-1 px-1">
          Solo para ubicarnos — no necesitamos la dirección exacta
        </p>
        <input
          type="text"
          value={fraccionamiento}
          onChange={(e) => setField('fraccionamiento', e.target.value)}
          placeholder="Fraccionamiento o colonia"
          className={inputClass}
        />
        <input
          type="text"
          value={calle}
          onChange={(e) => setField('calle', e.target.value)}
          placeholder="Calle y número"
          className={inputClass}
        />
        <input
          type="text"
          value={cp}
          onChange={(e) => setField('cp', e.target.value.replace(/\D/g, '').slice(0, 5))}
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
