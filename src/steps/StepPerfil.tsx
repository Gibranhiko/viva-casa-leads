import { useState } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { EstadoCivil, Dependientes } from '@/types/lead'

const ESTADO_CIVIL_OPTIONS = [
  { value: 'soltero', label: 'Soltero/a' },
  { value: 'casado', label: 'Casado/a' },
  { value: 'union_libre', label: 'Unión libre' },
  { value: 'divorciado', label: 'Divorciado/a' },
  { value: 'viudo', label: 'Viudo/a' },
]

const DEPENDIENTES_OPTIONS = [
  { value: 'ninguno', label: 'Ninguno' },
  { value: '1_2', label: '1 o 2' },
  { value: '3_mas', label: '3 o más' },
]

export function StepPerfil() {
  const { edad, estadoCivil, dependientes, setField, nextStep } = useFormStore()
  const [errors, setErrors] = useState({ edad: '', estadoCivil: '', dependientes: '' })

  const handleNext = () => {
    const next = { edad: '', estadoCivil: '', dependientes: '' }
    if (!edad || edad < 18 || edad > 80) next.edad = 'Ingresa una edad válida entre 18 y 80 años'
    if (!estadoCivil) next.estadoCivil = 'Selecciona tu estado civil'
    if (!dependientes) next.dependientes = 'Selecciona una opción'
    if (next.edad || next.estadoCivil || next.dependientes) { setErrors(next); return }
    nextStep()
  }

  return (
    <StepLayout title="Tu perfil" onNext={handleNext}>
      <div className="flex flex-col gap-6">
        <div>
          <label htmlFor="edad" className="block text-sm font-medium text-gray-700 mb-1">
            ¿Cuántos años tienes?
          </label>
          <input
            id="edad"
            type="number"
            value={edad ?? ''}
            onChange={(e) => { setField('edad', parseInt(e.target.value) || null); setErrors((p) => ({ ...p, edad: '' })) }}
            placeholder="Edad"
            min={18}
            max={80}
            className={`w-full border-2 rounded-xl px-4 py-3 text-lg outline-none transition-colors ${errors.edad ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'}`}
          />
          {errors.edad && <p className="text-red-500 text-sm mt-1">{errors.edad}</p>}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Estado civil</p>
          <StepCard
            options={ESTADO_CIVIL_OPTIONS}
            selected={estadoCivil}
            onSelect={(v) => { setField('estadoCivil', v as EstadoCivil); setErrors((p) => ({ ...p, estadoCivil: '' })) }}
          />
          {errors.estadoCivil && <p className="text-red-500 text-sm mt-1">{errors.estadoCivil}</p>}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">¿Tienes dependientes económicos?</p>
          <StepCard
            options={DEPENDIENTES_OPTIONS}
            selected={dependientes}
            onSelect={(v) => { setField('dependientes', v as Dependientes); setErrors((p) => ({ ...p, dependientes: '' })) }}
          />
          {errors.dependientes && <p className="text-red-500 text-sm mt-1">{errors.dependientes}</p>}
        </div>
      </div>
    </StepLayout>
  )
}
