import { motion } from 'framer-motion'
import { useFormStore } from '@/store/useFormStore'
import logo from '@/assets/viva-casa-logo.png'

export function StepWelcome() {
  const nextStep = useFormStore((s) => s.nextStep)

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center gap-8 max-w-sm"
      >
        <img
          src={logo}
          alt="Viva Casa"
          className="w-48 object-contain"
        />
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">
            ¿Listo para encontrar tu hogar?
          </h1>
          <p className="text-gray-500 text-base leading-relaxed">
            En menos de 5 minutos te ayudamos a encontrar el crédito y la propiedad ideal para ti.
          </p>
        </div>
        <button
          onClick={nextStep}
          className="w-full bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-lg py-4 rounded-2xl transition-colors"
        >
          Sí, empecemos →
        </button>
      </motion.div>
    </div>
  )
}
