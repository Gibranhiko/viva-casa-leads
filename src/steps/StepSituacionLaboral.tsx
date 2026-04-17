import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { SituacionLaboral } from '@/types/lead'

const OPTIONS = [
  { value: 'empleado_formal',   label: 'Empleado formal' },
  { value: 'empleado_informal', label: 'Empleado informal' },
  { value: 'independiente',     label: 'Negocio propio' },
  { value: 'pensionado',        label: 'Pensionado' },
  { value: 'sin_empleo',        label: 'Sin empleo' },
]

export function StepSituacionLaboral() {
  const { situacionLaboral, empresa, setField, nextStep } = useFormStore()

  const showEmpresa = situacionLaboral && situacionLaboral !== 'sin_empleo'

  const handleNext = () => nextStep()

  return (
    <StepLayout
      title="Situación laboral"
      onNext={showEmpresa ? handleNext : undefined}
      hideNext={!showEmpresa}
    >
      <div className="flex flex-col gap-4">
        <StepCard
          columns={2}
          options={OPTIONS}
          selected={situacionLaboral}
          onSelect={(v) => {
            setField('situacionLaboral', v as SituacionLaboral)
            if (v === 'sin_empleo') setTimeout(nextStep, 200)
          }}
        />

        {showEmpresa && (
          <div>
            <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
              ¿En qué empresa o giro?
            </label>
            <input
              id="empresa"
              type="text"
              value={empresa ?? ''}
              onChange={(e) => setField('empresa', e.target.value || null)}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              placeholder="Nombre de la empresa o giro"
              autoFocus
              className="w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3 text-base outline-none transition-colors"
            />
          </div>
        )}
      </div>
    </StepLayout>
  )
}
