import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { MultiChip } from '@/components/form/MultiChip'

const OPTIONS = [
  { value: 'luz',  label: '⚡ Luz (CFE)' },
  { value: 'agua', label: '💧 Agua' },
  { value: 'gas',  label: '🔥 Gas' },
]

export function StepSellerServicios() {
  const { serviciosActivos, setField, nextStep } = useSellerFormStore()

  const handleToggle = (value: string) => {
    const current = serviciosActivos as string[]
    const updated = current.includes(value)
      ? current.filter((s) => s !== value)
      : [...current, value]
    setField('serviciosActivos', updated as typeof serviciosActivos)
  }

  return (
    <StepLayout
      title="¿Tu propiedad tiene estos servicios activos?"
      onNext={nextStep}
    >
      <MultiChip
        options={OPTIONS}
        selected={serviciosActivos}
        onToggle={handleToggle}
      />
      <p className="text-xs text-gray-400 mt-3">
        Puedes continuar aunque no tengas ninguno activo
      </p>
    </StepLayout>
  )
}
