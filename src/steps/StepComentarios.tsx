import { useFormStore } from '@/store/useFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { submitLead } from '@/lib/firestore'
import { useState } from 'react'
import { useNavigate } from 'react-router'

export function StepComentarios() {
  const store = useFormStore()
  const { comentarios, setField, reset } = store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const MAX = 300

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await submitLead(store)
      reset()
      navigate('/confirmation')
    } catch {
      setError('Ocurrió un error. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    setField('comentarios', null)
    handleSubmit()
  }

  return (
    <StepLayout
      title="¿Algo más que quieras decirnos?"
      subtitle="Opcional"
      onNext={handleSubmit}
      nextLabel={loading ? 'Enviando...' : 'Enviar mi información'}
      nextDisabled={loading}
    >
      <div className="flex flex-col gap-3">
        <div className="relative">
          <textarea
            value={comentarios ?? ''}
            onChange={(e) => setField('comentarios', e.target.value.slice(0, MAX) || null)}
            placeholder="Escribe aquí cualquier detalle adicional..."
            rows={5}
            className="w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5 text-base outline-none transition-colors resize-none"
          />
          <span className="absolute bottom-3 right-3 text-xs text-gray-400">
            {(comentarios ?? '').length}/{MAX}
          </span>
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          onClick={handleSkip}
          disabled={loading}
          className="text-gray-400 text-sm underline underline-offset-2"
        >
          No, ya está todo
        </button>
      </div>
    </StepLayout>
  )
}
