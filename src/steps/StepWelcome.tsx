import { motion } from 'framer-motion'
import { useFormStore } from '@/store/useFormStore'
import { useNavigate } from 'react-router'
import logo from '@/assets/viva-casa-logo.png'
import { Home, Tag } from 'lucide-react'

export function StepWelcome() {
  const nextStep = useFormStore((s) => s.nextStep)
  const navigate = useNavigate()

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center min-h-dvh px-6 py-16"
      style={{
        background: 'linear-gradient(160deg, #7c2d00 0%, #c2410c 40%, #ea580c 70%, #fb923c 100%)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col items-center gap-8 max-w-sm w-full"
      >
        <img src={logo} alt="Viva Casa" className="w-52 object-contain" />

        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-white">
            Bienvenido a Viva Casa
          </h1>
          <p className="text-orange-100 text-base leading-relaxed">
            ¿Qué te gustaría hacer hoy?
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="w-full flex flex-col gap-3"
        >
          <button
            onClick={nextStep}
            className="w-full bg-white text-orange-600 font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Home size={20} /> Quiero comprar casa
          </button>

          <button
            onClick={() => navigate('/vender')}
            className="w-full bg-white/20 border-2 border-white/40 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Tag size={20} /> Quiero vender casa
          </button>

        </motion.div>

      </motion.div>
    </div>
  )
}
