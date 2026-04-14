import { motion } from 'framer-motion'
import { useFormStore } from '@/store/useFormStore'
import logo from '@/assets/viva-casa-logo.png'

export function StepWelcome() {
  const nextStep = useFormStore((s) => s.nextStep)

  return (
    <div
      className="flex-1 flex flex-col items-center justify-center min-h-screen px-6 py-16 gap-10"
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
            ¿Listo para encontrar tu hogar?
          </h1>
          <p className="text-orange-100 text-base leading-relaxed">
            En menos de 5 minutos te ayudamos a encontrar el crédito y la propiedad ideal para ti.
          </p>
        </div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          onClick={nextStep}
          className="w-full bg-white text-orange-600 font-bold text-lg py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          Sí, empecemos →
        </motion.button>
      </motion.div>
    </div>
  )
}
