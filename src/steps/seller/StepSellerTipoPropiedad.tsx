import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { StepCard } from '@/components/form/StepCard'

const TIPO_OPTIONS = [
  { value: 'fracc_privado', label: 'Fracc privado', description: 'Con caseta y acceso controlado' },
  { value: 'fracc_abierto', label: 'Fracc abierto' },
  { value: 'departamento',  label: 'Departamento' },
  { value: 'terreno',       label: 'Terreno' },
]

const CUOTAS_OPTIONS = [
  { value: 'al_corriente', label: 'Al corriente' },
  { value: 'con_adeudo',   label: 'Tengo adeudo' },
  { value: 'no_aplica',    label: 'No hay / No sé' },
]

export function StepSellerTipoPropiedad() {
  const { tipoPropiedad, cuotasCondominio, setField, nextStep } = useSellerFormStore()

  const showCuotas = tipoPropiedad === 'fracc_privado' || tipoPropiedad === 'departamento'

  const handleTipo = (value: string) => {
    const tipo = value as typeof tipoPropiedad
    setField('tipoPropiedad', tipo)
    const needsCuotas = tipo === 'fracc_privado' || tipo === 'departamento'
    if (!needsCuotas) {
      setField('cuotasCondominio', 'no_aplica')
      setTimeout(nextStep, 200)
    }
  }

  const handleCuotas = (value: string) => {
    setField('cuotasCondominio', value as typeof cuotasCondominio)
    setTimeout(nextStep, 200)
  }

  return (
    <StepLayout title="¿Qué tipo de propiedad es?" hideNext>
      <div className="flex flex-col gap-6">
        <StepCard columns={2} options={TIPO_OPTIONS} selected={tipoPropiedad} onSelect={handleTipo} />
        {showCuotas && (
          <div>
            <p className="text-sm font-semibold text-orange-500 mb-2">¿Estás al corriente con las cuotas de mantenimiento?</p>
            <StepCard options={CUOTAS_OPTIONS} selected={cuotasCondominio} onSelect={handleCuotas} />
          </div>
        )}
      </div>
    </StepLayout>
  )
}
