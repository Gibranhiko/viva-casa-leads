import { useFormStore } from '@/store/useFormStore'
import { useNavigate } from 'react-router'
import logo from '@/assets/viva-casa-logo.png'

export function ConfirmationPage() {
  const nombre = useFormStore((s) => s.nombre)
  const navigate = useNavigate()

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{
        background: 'linear-gradient(160deg, #7c2d00 0%, #c2410c 40%, #ea580c 70%, #fb923c 100%)',
      }}
    >
      <img src={logo} alt="Viva Casa" className="w-44 object-contain mb-8" />

      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path d="M6 16L13 23L26 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <h1 className="text-2xl font-bold text-white mb-2">
        ¡Gracias{nombre ? `, ${nombre}` : ''}!
      </h1>
      <p className="text-orange-100 max-w-xs mb-8">
        Recibimos tu información. Un asesor de Viva Casa te contactará muy pronto.
      </p>

      <button
        onClick={() => navigate('/')}
        className="bg-white text-orange-600 font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform"
      >
        Volver al inicio
      </button>
    </div>
  )
}
