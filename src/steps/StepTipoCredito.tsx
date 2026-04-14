import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import type { TipoCredito } from '@/types/lead'

const OPTIONS = [
  { value: 'infonavit_tradicional', label: 'INFONAVIT Tradicional', description: 'Solo tú usas tu crédito INFONAVIT', icon: '🏠' },
  { value: 'infonavit_total', label: 'INFONAVIT Total', description: 'INFONAVIT + crédito bancario', icon: '🏦' },
  { value: 'cofinavit', label: 'COFINAVIT', description: 'INFONAVIT + banco con cofinanciamiento', icon: '🤝' },
  { value: 'unamos_creditos', label: 'Unamos Créditos', description: 'Dos créditos INFONAVIT juntos', icon: '👫' },
  { value: 'segundo_credito', label: 'Segundo Crédito INFONAVIT', description: 'Ya usaste INFONAVIT antes', icon: '🔄' },
  { value: 'banco', label: 'Crédito Bancario', description: 'Hipoteca con banco privado', icon: '🏛️' },
  { value: 'recursos_propios', label: 'Recursos Propios', description: 'Compra directa sin crédito', icon: '💰' },
]

export function StepTipoCredito() {
  const { tipoCredito, setField, nextStep } = useFormStore()

  const handleSelect = (value: string) => {
    setField('tipoCredito', value as TipoCredito)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Qué tipo de crédito te interesa?" hideNext>
      <StepCard options={OPTIONS} selected={tipoCredito} onSelect={handleSelect} />
    </StepLayout>
  )
}
