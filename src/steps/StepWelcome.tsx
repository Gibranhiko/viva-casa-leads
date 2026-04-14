import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useFormStore } from '@/store/useFormStore'
import { useNavigate } from 'react-router'
import logo from '@/assets/viva-casa-logo.png'

export function StepWelcome() {
  const nextStep = useFormStore((s) => s.nextStep)
  const navigate = useNavigate()
  const [showUnderConstruction, setShowUnderConstruction] = useState(false)

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-16"
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
            className="w-full bg-white text-orange-600 font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
          >
            🏠 Quiero comprar casa
          </button>

          <button
            onClick={() => setShowUnderConstruction(true)}
            className="w-full bg-white/20 border-2 border-white/40 text-white font-bold text-lg py-4 rounded-2xl active:scale-95 transition-transform"
          >
            🏷️ Quiero vender casa
          </button>

          <button
            onClick={() => navigate('/admin/login')}
            className="w-full text-white/40 text-xs py-2 transition-colors hover:text-white/60"
          >
            Admin Leads
          </button>
        </motion.div>
      </motion.div>

      {/* Under construction modal */}
      <AnimatePresence>
        {showUnderConstruction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center px-6 z-50"
            onClick={() => setShowUnderConstruction(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-5xl">🚧</span>
              <h2 className="text-xl font-bold text-gray-900 mt-4 mb-2">En construcción</h2>
              <p className="text-gray-500 text-sm mb-6">
                Pronto podrás publicar tu propiedad con nosotros. ¡Vuelve pronto!
              </p>
              <button
                onClick={() => setShowUnderConstruction(false)}
                className="w-full bg-orange-500 text-white font-semibold py-3 rounded-xl"
              >
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
