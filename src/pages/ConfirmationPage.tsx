import { useFormStore } from '@/store/useFormStore'

export function ConfirmationPage() {
  const nombre = useFormStore((s) => s.nombre)

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M6 16L13 23L26 9" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        ¡Gracias, {nombre}!
      </h1>
      <p className="text-gray-500 max-w-xs">
        Recibimos tu información. Un asesor de Viva Casa te contactará muy pronto.
      </p>
    </div>
  )
}
