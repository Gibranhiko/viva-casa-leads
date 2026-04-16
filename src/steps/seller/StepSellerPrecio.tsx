import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'
import { useState } from 'react'

const OPTIONS = [
  { value: 'si', label: 'Sí, tengo un precio en mente' },
  { value: 'no', label: 'No, me gustaría saber cuánto vale', description: 'Te ayudamos a estimarlo' },
]

export function StepSellerPrecio() {
  const { tienePrecio, precioPedido, setField, nextStep } = useSellerFormStore()
  const [showInput, setShowInput] = useState(tienePrecio === true)
  const [raw, setRaw] = useState(precioPedido ? String(precioPedido) : '')

  const handleSelect = (value: string) => {
    const tiene = value === 'si'
    setField('tienePrecio', tiene)
    if (!tiene) {
      setField('precioPedido', null)
      setTimeout(nextStep, 200)
    } else {
      setShowInput(true)
    }
  }

  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    setRaw(digits)
    setField('precioPedido', digits ? parseInt(digits, 10) : null)
  }

  const selected = tienePrecio === null ? null : tienePrecio ? 'si' : 'no'

  return (
    <StepLayout
      title="¿Tienes un precio en mente para tu propiedad?"
      onNext={showInput ? nextStep : undefined}
      nextDisabled={showInput && !precioPedido}
      hideNext={!showInput}
    >
      <div className="flex flex-col gap-4">
        <StepCard options={OPTIONS} selected={selected} onSelect={handleSelect} />

        {showInput && (
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600 font-medium">Precio aproximado (MXN)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={raw ? parseInt(raw).toLocaleString('es-MX') : ''}
                onChange={handlePrecioChange}
                placeholder="Ej. 1,500,000"
                className="w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl pl-8 pr-4 py-3.5 text-base outline-none transition-colors"
              />
            </div>
            <p className="text-xs text-gray-400">No te compromete a nada, es solo referencia</p>
          </div>
        )}
      </div>
    </StepLayout>
  )
}
