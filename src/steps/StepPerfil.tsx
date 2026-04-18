import { useState } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { EstadoCivil, Dependientes } from '@/types/lead'

const ESTADO_CIVIL_OPTIONS = [
  { value: 'soltero',     label: 'Soltero/a' },
  { value: 'casado',      label: 'Casado/a' },
  { value: 'union_libre', label: 'Unión libre' },
  { value: 'divorciado',  label: 'Divorciado/a' },
  { value: 'viudo',       label: 'Viudo/a' },
]

const DEPENDIENTES_OPTIONS = [
  { value: 'ninguno', label: 'Ninguno' },
  { value: '1_2',     label: '1 o 2' },
  { value: '3_mas',   label: '3 o más' },
]

export function StepPerfil() {
  const { estadoCivil, dependientes, setField, nextStep } = useFormStore()
  const [errors, setErrors] = useState({ estadoCivil: '', dependientes: '' })

  const handleNext = () => {
    const next = { estadoCivil: '', dependientes: '' }
    if (!estadoCivil) next.estadoCivil = 'Selecciona una opción'
    if (!dependientes) next.dependientes = 'Selecciona una opción'
    if (next.estadoCivil || next.dependientes) { setErrors(next); return }
    nextStep()
  }

  return (
    <StepLayout title="Tu perfil" onNext={handleNext}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">Estado civil</p>
          <StepCard
            columns={2}
            options={ESTADO_CIVIL_OPTIONS}
            selected={estadoCivil}
            onSelect={(v) => { setField('estadoCivil', v as EstadoCivil); setErrors((p) => ({ ...p, estadoCivil: '' })) }}
          />
          {errors.estadoCivil && <p className="text-red-500 text-sm mt-1">{errors.estadoCivil}</p>}
        </div>

        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">Dependientes económicos</p>
          <StepCard
            columns={2}
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
