import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const ESCRITURAS_OPTIONS = [
  { value: 'propias',      label: 'Sí, a mi nombre' },
  { value: 'otro_nombre',  label: 'A nombre de un familiar' },
  { value: 'no_tiene',     label: 'No las tengo / No sé' },
]

const DUENOS_OPTIONS = [
  { value: 'solo_yo', label: 'Solo yo' },
  { value: 'pareja',  label: 'Yo y mi pareja' },
  { value: 'varios',  label: 'Yo y otros familiares' },
  { value: 'no_se',   label: 'No estoy seguro/a' },
]

export function StepSellerEscriturasPropiedad() {
  const { tieneEscrituras, numeroDuenos, setField, nextStep } = useSellerFormStore()

  const handleEscrituras = (value: string) => {
    setField('tieneEscrituras', value as typeof tieneEscrituras)
  }

  const handleDuenos = (value: string) => {
    setField('numeroDuenos', value as typeof numeroDuenos)
    if (tieneEscrituras) setTimeout(nextStep, 200)
  }

  const showNext = !!(tieneEscrituras && numeroDuenos)

  return (
    <StepLayout title="Escrituras y propietarios" onNext={showNext ? nextStep : undefined} hideNext={!showNext}>
      <div className="flex flex-col gap-6">
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">¿Tienes las escrituras?</p>
          <StepCard columns={2} options={ESCRITURAS_OPTIONS} selected={tieneEscrituras} onSelect={handleEscrituras} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">¿Cuántos propietarios tiene la casa?</p>
          <StepCard columns={2} options={DUENOS_OPTIONS} selected={numeroDuenos} onSelect={handleDuenos} />
        </div>
      </div>
    </StepLayout>
  )
}
