import { useFormStore } from '@/store/useFormStore'
import { StepLayout } from '@/components/form/StepLayout'

export function StepNSS() {
  const { nss, setField, nextStep } = useFormStore()

  return (
    <StepLayout
      title="¿Cuál es tu NSS?"
      subtitle="Número de Seguridad Social — lo encuentras en tu IMSS o AFORE"
      onNext={nextStep}
    >
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={nss ?? ''}
          onChange={(e) => setField('nss', e.target.value.replace(/\D/g, '').slice(0, 11) || null)}
          placeholder="11 dígitos"
          autoFocus
          maxLength={11}
          className="w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5 text-lg outline-none transition-colors tracking-widest"
        />
        <button
          onClick={() => { setField('nss', null); nextStep() }}
          className="text-gray-400 text-sm underline underline-offset-2"
        >
          No tengo mi NSS a la mano
        </button>
      </div>
    </StepLayout>
  )
}
