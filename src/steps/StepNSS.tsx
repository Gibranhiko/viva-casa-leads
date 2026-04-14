import { useState, useRef } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { uploadNssImage } from '@/lib/storage'

export function StepNSS() {
  const { leadId, nss, nssImageUrl, setField, nextStep } = useFormStore()
  const [preview, setPreview] = useState<string | null>(nssImageUrl)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    setError('')
    try {
      const url = await uploadNssImage(file, leadId)
      setField('nssImageUrl', url)
      setPreview(url)
    } catch {
      setError('Error al subir la imagen. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  const handleSkip = () => {
    setField('nss', null)
    setField('nssImageUrl', null)
    nextStep()
  }

  return (
    <StepLayout
      title="¿Cuál es tu NSS?"
      subtitle="Número de Seguridad Social — lo encuentras en tu IMSS o AFORE"
      onNext={nextStep}
      nextDisabled={uploading}
    >
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={nss ?? ''}
          onChange={(e) => setField('nss', e.target.value.replace(/\D/g, '').slice(0, 11) || null)}
          placeholder="11 dígitos"
          autoFocus
          maxLength={11}
          className="w-full border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5 text-lg outline-none transition-colors tracking-widest"
        />

        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
          {preview ? (
            <div className="flex flex-col items-center gap-2">
              <img src={preview} alt="NSS" className="max-h-32 rounded-lg object-contain" />
              <button onClick={() => fileRef.current?.click()} className="text-sm text-orange-500 underline">
                Cambiar foto
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex flex-col items-center gap-2 w-full text-gray-500"
            >
              <span className="text-3xl">{uploading ? '⏳' : '📷'}</span>
              <span className="text-sm">{uploading ? 'Subiendo...' : 'Subir foto de mi NSS'}</span>
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button onClick={handleSkip} className="text-gray-400 text-sm underline underline-offset-2">
          No tengo mi NSS a la mano
        </button>
      </div>
    </StepLayout>
  )
}
