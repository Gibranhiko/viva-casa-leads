import { useFormStore } from '@/store/useFormStore'
import { StepLayout } from '@/components/form/StepLayout'

export function StepEmpresa() {
  const { empresa, setField, nextStep } = useFormStore()

  return (
    <StepLayout title="¿En qué empresa o giro trabajas?" onNext={nextStep}>
      <input
        type="text"
        value={empresa ?? ''}
        onChange={(e) => setField('empresa', e.target.value || null)}
        onKeyDown={(e) => e.key === 'Enter' && nextStep()}
        placeholder="Nombre de la empresa o giro"
        autoFocus
        className="w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5 text-lg outline-none transition-colors"
      />
    </StepLayout>
  )
}
