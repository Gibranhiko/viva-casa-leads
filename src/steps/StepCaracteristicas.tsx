import { useFormStore } from '@/store/useFormStore'
import { MultiChip } from '@/components/form/MultiChip'
import { StepLayout } from '@/components/form/StepLayout'

const CARACTERISTICAS = [
  { value: 'jardin', label: 'Jardín' },
  { value: 'estacionamiento', label: 'Estacionamiento' },
  { value: 'cuarto_servicio', label: 'Cuarto de servicio' },
  { value: 'alberca', label: 'Alberca' },
  { value: 'roof_garden', label: 'Roof garden' },
  { value: 'gym', label: 'Gimnasio' },
  { value: 'seguridad_24h', label: 'Seguridad 24h' },
  { value: 'areas_verdes', label: 'Áreas verdes' },
  { value: 'cerca_escuelas', label: 'Cerca de escuelas' },
  { value: 'cerca_comercios', label: 'Cerca de comercios' },
  { value: 'sin_preferencia', label: 'Sin preferencia' },
]

export function StepCaracteristicas() {
  const { caracteristicas, setField, nextStep } = useFormStore()

  const handleToggle = (value: string) => {
    if (value === 'sin_preferencia') {
      setField('caracteristicas', ['sin_preferencia'])
      return
    }
    const without = caracteristicas.filter((c) => c !== 'sin_preferencia')
    if (without.includes(value)) {
      setField('caracteristicas', without.filter((c) => c !== value))
    } else {
      setField('caracteristicas', [...without, value])
    }
  }

  return (
    <StepLayout
      title="¿Qué características buscas?"
      subtitle="Opcional — elige las que quieras"
      onNext={nextStep}
    >
      <MultiChip options={CARACTERISTICAS} selected={caracteristicas} onToggle={handleToggle} />
    </StepLayout>
  )
}
