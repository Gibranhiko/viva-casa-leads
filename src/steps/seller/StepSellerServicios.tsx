import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'

type EstadoServicio = 'activo' | 'adeudo' | 'inactivo'

const ESTADOS: { value: EstadoServicio; label: string; color: string }[] = [
  { value: 'activo',   label: 'Al corriente', color: 'border-green-400 bg-green-50 text-green-700' },
  { value: 'adeudo',   label: 'Con adeudo',   color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
  { value: 'inactivo', label: 'No activo',    color: 'border-red-400 bg-red-50 text-red-700' },
]

const SERVICIOS = [
  { field: 'luzEstado',  icon: '⚡', label: 'Luz (CFE)' },
  { field: 'aguaEstado', icon: '💧', label: 'Agua' },
  { field: 'gasEstado',  icon: '🔥', label: 'Gas' },
] as const

export function StepSellerServicios() {
  const store = useSellerFormStore()
  const { setField, nextStep } = store

  const allSelected = SERVICIOS.every(({ field }) => store[field] !== null)

  return (
    <StepLayout
      title="¿Cómo están los servicios de tu propiedad?"
      onNext={nextStep}
      nextDisabled={!allSelected}
    >
      <div className="flex flex-col gap-3">
        {SERVICIOS.map(({ field, icon, label }) => (
          <div key={field} className="flex flex-col gap-1.5">
            <p className="text-sm font-medium text-gray-700">{icon} {label}</p>
            <div className="grid grid-cols-3 gap-2">
              {ESTADOS.map(({ value, label: estadoLabel, color }) => {
                const selected = store[field] === value
                return (
                  <button
                    key={value}
                    onClick={() => setField(field, value)}
                    className={`py-2 px-1 rounded-xl border-2 text-xs font-medium transition-all text-center
                      ${selected ? color : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}
                  >
                    {estadoLabel}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </StepLayout>
  )
}
