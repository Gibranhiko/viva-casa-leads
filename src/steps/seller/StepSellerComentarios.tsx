import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { submitSellerLead } from '@/lib/firestore'
import { useState, useRef } from 'react'
import { useNavigate } from 'react-router'

const SPAM_KEY = 'viva-casa-seller-last-submit'
const SPAM_LIMIT_MS = 60_000

export function StepSellerComentarios() {
  const store = useSellerFormStore()
  const { comentarios, setField, reset } = store
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const honeypot = useRef<HTMLInputElement>(null)
  const MAX = 300

  const handleSubmit = async () => {
    if (honeypot.current?.value) return

    const lastSubmit = localStorage.getItem(SPAM_KEY)
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < SPAM_LIMIT_MS) {
      setError('Por favor espera un momento antes de enviar de nuevo.')
      return
    }

    setLoading(true)
    setError('')
    try {
      await submitSellerLead(store)
      localStorage.setItem(SPAM_KEY, String(Date.now()))
      reset()
      navigate('/vender/confirmation')
    } catch {
      setError('Ocurrió un error. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <StepLayout
      title="¿Algo más que quieras decirnos?"
      subtitle="Opcional"
      onNext={handleSubmit}
      nextLabel={loading ? 'Enviando...' : 'Enviar mi información'}
      nextDisabled={loading}
    >
      <input
        ref={honeypot}
        type="text"
        tabIndex={-1}
        aria-hidden="true"
        style={{ display: 'none' }}
        autoComplete="off"
      />

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
      </div>
    </StepLayout>
  )
}
