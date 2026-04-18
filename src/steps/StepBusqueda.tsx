import { useState } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { MultiChip } from '@/components/form/MultiChip'
import { StepLayout } from '@/components/form/StepLayout'
import type { TipoInmueble } from '@/types/lead'

const ZONAS = [
  { value: 'monterrey',    label: 'Monterrey' },
  { value: 'san_pedro',    label: 'San Pedro' },
  { value: 'santa_catarina', label: 'Sta. Catarina' },
  { value: 'guadalupe',    label: 'Guadalupe' },
  { value: 'apodaca',      label: 'Apodaca' },
  { value: 'escobedo',     label: 'Escobedo' },
  { value: 'garcia',       label: 'García' },
  { value: 'juarez',       label: 'Juárez' },
  { value: 'san_nicolas',  label: 'San Nicolás' },
  { value: 'cadereyta',    label: 'Cadereyta' },
  { value: 'indiferente',  label: 'Me da igual' },
]

const TIPO_OPTIONS = [
  { value: 'fraccionamiento', label: 'Fracc privado' },
  { value: 'colonia',         label: 'Fracc abierto' },
  { value: 'departamento',    label: 'Departamento' },
  { value: 'indiferente',     label: 'Me da igual' },
]

export function StepBusqueda() {
  const { zonasInteres, tipoInmueble, setField, nextStep } = useFormStore()
  const [errors, setErrors] = useState({ zonas: '', tipo: '' })

  const handleToggleZona = (value: string) => {
    setErrors((p) => ({ ...p, zonas: '' }))
    if (value === 'indiferente') { setField('zonasInteres', ['indiferente']); return }
    const without = zonasInteres.filter((z) => z !== 'indiferente')
    if (without.includes(value)) {
      setField('zonasInteres', without.filter((z) => z !== value))
    } else {
      setField('zonasInteres', [...without, value])
    }
  }

  const handleNext = () => {
    const next = { zonas: '', tipo: '' }
    if (zonasInteres.length === 0) next.zonas = 'Selecciona al menos una zona'
    if (!tipoInmueble) next.tipo = 'Selecciona un tipo'
    if (next.zonas || next.tipo) { setErrors(next); return }
    nextStep()
  }

  return (
    <StepLayout title="¿Qué estás buscando?" subtitle="Puedes elegir varias zonas" onNext={handleNext}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">Zonas de interés</p>
          <MultiChip options={ZONAS} selected={zonasInteres} onToggle={handleToggleZona} />
          {errors.zonas && <p className="text-red-500 text-sm mt-1">{errors.zonas}</p>}
        </div>

        <div>
          <p className="text-sm font-semibold text-orange-500 mb-2">Tipo de propiedad</p>
          <StepCard
            columns={2}
            options={TIPO_OPTIONS}
            selected={tipoInmueble}
            onSelect={(v) => { setField('tipoInmueble', v as TipoInmueble); setErrors((p) => ({ ...p, tipo: '' })) }}
          />
          {errors.tipo && <p className="text-red-500 text-sm mt-1">{errors.tipo}</p>}
        </div>
      </div>
    </StepLayout>
  )
}
