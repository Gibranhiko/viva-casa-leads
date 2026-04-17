import { useFormStore } from '@/store/useFormStore'
import { useNavigate } from 'react-router'
import logo from '@/assets/viva-casa-logo.png'
import { MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '528110000000'

export function ConfirmationPage() {
  const nombre = useFormStore((s) => s.nombre)
  const navigate = useNavigate()

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center px-6 text-center"
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

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola, acabo de llenar el formulario de Viva Casa y me gustaría saber más')}`}
        target="_blank"
        rel="noreferrer"
        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 px-8 rounded-2xl active:scale-95 transition-all mb-3"
      >
        <MessageCircle size={20} /> Contactar por WhatsApp
      </a>

      <button
        onClick={() => navigate('/')}
        className="bg-white/20 border-2 border-white/40 text-white font-bold py-3 px-8 rounded-2xl active:scale-95 transition-transform"
      >
        Volver al inicio
      </button>
    </div>
  )
}
