import { useFormStore } from '@/store/useFormStore'
import { MultiChip } from '@/components/form/MultiChip'
import { StepLayout } from '@/components/form/StepLayout'

const ZONAS = [
  { value: 'monterrey', label: 'Monterrey' },
  { value: 'san_pedro', label: 'San Pedro Garza García' },
  { value: 'santa_catarina', label: 'Santa Catarina' },
  { value: 'guadalupe', label: 'Guadalupe' },
  { value: 'apodaca', label: 'Apodaca' },
  { value: 'escobedo', label: 'General Escobedo' },
  { value: 'garcia', label: 'García' },
  { value: 'juarez', label: 'Juárez' },
  { value: 'san_nicolas', label: 'San Nicolás de los Garza' },
  { value: 'cadereyta', label: 'Cadereyta' },
  { value: 'indiferente', label: 'Me da igual' },
]

export function StepZonas() {
  const { zonasInteres, setField, nextStep } = useFormStore()

  const handleToggle = (value: string) => {
    if (value === 'indiferente') {
      setField('zonasInteres', ['indiferente'])
      return
    }
    const without = zonasInteres.filter((z) => z !== 'indiferente')
    if (without.includes(value)) {
      setField('zonasInteres', without.filter((z) => z !== value))
    } else {
      setField('zonasInteres', [...without, value])
    }
  }

  const handleNext = () => {
    if (zonasInteres.length === 0) return
    nextStep()
  }

  return (
    <StepLayout
      title="¿En qué zonas te interesa buscar?"
      subtitle="Puedes elegir varias"
      onNext={handleNext}
      nextDisabled={zonasInteres.length === 0}
    >
      <MultiChip options={ZONAS} selected={zonasInteres} onToggle={handleToggle} />
    </StepLayout>
  )
}
