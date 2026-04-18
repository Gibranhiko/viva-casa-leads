import { useState } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import { Home, Building2, Handshake, Users, RefreshCw, Landmark, Wallet, HelpCircle } from 'lucide-react'
import type { TipoCredito } from '@/types/lead'

const OPTIONS = [
  { value: 'infonavit_tradicional', label: 'INFONAVIT Tradicional',     description: 'Solo tú usas tu crédito INFONAVIT',    icon: <Home size={20} /> },
  { value: 'infonavit_total',       label: 'INFONAVIT Total',           description: 'INFONAVIT + crédito bancario',         icon: <Building2 size={20} /> },
  { value: 'cofinavit',             label: 'COFINAVIT',                 description: 'INFONAVIT + banco cofinanciamiento',   icon: <Handshake size={20} /> },
  { value: 'unamos_creditos',       label: 'Unamos Créditos',           description: 'Dos créditos INFONAVIT juntos',        icon: <Users size={20} /> },
  { value: 'segundo_credito',       label: 'Segundo Crédito INFONAVIT', description: 'Ya usaste INFONAVIT antes',            icon: <RefreshCw size={20} /> },
  { value: 'banco',                 label: 'Crédito Bancario',          description: 'Hipoteca con banco privado',           icon: <Landmark size={20} /> },
  { value: 'recursos_propios',      label: 'Recursos Propios',          description: 'Compra directa sin crédito',           icon: <Wallet size={20} /> },
  { value: 'otro',                  label: 'Otro',                      description: 'FOVISSSTE, ISSFAM, etc.',              icon: <HelpCircle size={20} /> },
]

export function StepTipoCredito() {
  const { tipoCredito, tipoCreditoDetalle, setField, nextStep } = useFormStore()
  const [detalle, setDetalle] = useState(tipoCreditoDetalle ?? '')
  const [error, setError] = useState('')

  const handleSelect = (value: string) => {
    setField('tipoCredito', value as TipoCredito)
    setError('')
    if (value !== 'otro') {
      setField('tipoCreditoDetalle', null)
      setTimeout(nextStep, 200)
    }
  }

  const handleNext = () => {
    if (!detalle.trim()) { setError('Por favor describe tu tipo de crédito'); return }
    setField('tipoCreditoDetalle', detalle.trim())
    nextStep()
  }

  return (
    <StepLayout
      title="¿Qué tipo de crédito te interesa?"
      onNext={tipoCredito === 'otro' ? handleNext : undefined}
      hideNext={tipoCredito !== 'otro'}
    >
      <div className="flex flex-col gap-4">
        <StepCard options={OPTIONS} selected={tipoCredito} onSelect={handleSelect} />

        {tipoCredito === 'otro' && (
          <div>
            <label htmlFor="credito-detalle" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Cuál es tu tipo de crédito?
            </label>
            <input
              id="credito-detalle"
              type="text"
              value={detalle}
              onChange={(e) => { setDetalle(e.target.value); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              placeholder="Ej. FOVISSSTE, ISSFAM..."
              autoFocus
              className={`w-full border-2 rounded-xl px-4 py-3 text-base outline-none transition-colors ${error ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        )}
      </div>
    </StepLayout>
  )
}
