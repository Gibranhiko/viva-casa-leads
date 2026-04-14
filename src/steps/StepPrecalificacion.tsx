import { useState, useRef } from 'react'
import { useFormStore } from '@/store/useFormStore'
import { StepCard } from '@/components/form/StepCard'
import { StepLayout } from '@/components/form/StepLayout'
import { uploadNssImage, validateImageFile } from '@/lib/storage'

const OPTIONS = [
  { value: 'menos_300k', label: 'Menos de $300,000' },
  { value: '300k_500k', label: '$300,000 – $500,000' },
  { value: '500k_800k', label: '$500,000 – $800,000' },
  { value: '800k_1.2m', label: '$800,000 – $1,200,000' },
  { value: 'mas_1.2m', label: 'Más de $1,200,000' },
]

export function StepPrecalificacion() {
  const { leadId, precalificacion, nssImageUrl, setField, nextStep } = useFormStore()
  const [preview, setPreview] = useState<string | null>(nssImageUrl)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleSelect = (value: string) => {
    setField('precalificacion', value)
  }

  const handleFile = async (file: File) => {
    const validationError = validateImageFile(file)
    if (validationError) { setUploadError(validationError); return }
    setUploading(true)
    setUploadError('')
    // Preview local inmediato, sin necesitar URL de Firebase
    setPreview(URL.createObjectURL(file))
    try {
      const path = await uploadNssImage(file, leadId)
      setField('nssImageUrl', path)
    } catch {
      setUploadError('Error al subir la imagen. Intenta de nuevo.')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  return (
    <StepLayout
      title="¿Cuánto tienes precalificado en INFONAVIT?"
      onNext={nextStep}
      nextDisabled={!precalificacion || uploading}
    >
      <div className="flex flex-col gap-5">

        {/* Screenshot — al inicio, llamativo */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className={`w-full rounded-2xl border-2 transition-all duration-150 overflow-hidden
            ${preview
              ? 'border-orange-400 bg-orange-50'
              : 'border-orange-300 bg-orange-50 hover:bg-orange-100 active:scale-[0.98]'
            }`}
        >
          {preview ? (
            <div className="flex flex-col items-center gap-2 p-4">
              <img src={preview} alt="Precalificación" className="max-h-36 rounded-lg object-contain" />
              <span className="text-sm text-orange-500 font-medium">✓ Screenshot adjunto — toca para cambiar</span>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{uploading ? '⏳' : '📸'}</span>
              </div>
              <div className="text-left">
                <p className="font-bold text-orange-700 text-sm">
                  {uploading ? 'Subiendo...' : 'Adjuntar screenshot de precalificación'}
                </p>
                <p className="text-orange-500 text-xs mt-0.5">
                  Opcional — nos ayuda a darte una mejor atención
                </p>
              </div>
            </div>
          )}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {uploadError && <p className="text-red-500 text-sm -mt-2">{uploadError}</p>}

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">¿Cuánto te marca?</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <StepCard options={OPTIONS} selected={precalificacion} onSelect={handleSelect} />
      </div>
    </StepLayout>
  )
}
