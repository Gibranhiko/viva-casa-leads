import { useState, useRef } from 'react'
import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { uploadSellerPhoto, validateImageFile } from '@/lib/storage'

const MAX_PHOTOS = 5

export function StepSellerFotos() {
  const { sellerId, setField, nextStep } = useSellerFormStore()
  const [files, setFiles] = useState<(File | null)[]>(Array(MAX_PHOTOS).fill(null))
  const [previews, setPreviews] = useState<(string | null)[]>(Array(MAX_PHOTOS).fill(null))
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleFileChange = (index: number, file: File | null) => {
    if (!file) return
    const validationError = validateImageFile(file)
    if (validationError) { setError(validationError); return }
    setError('')
    const newFiles = [...files]
    const newPreviews = [...previews]
    newFiles[index] = file
    newPreviews[index] = URL.createObjectURL(file)
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleRemove = (index: number) => {
    const newFiles = [...files]
    const newPreviews = [...previews]
    if (newPreviews[index]) URL.revokeObjectURL(newPreviews[index]!)
    newFiles[index] = null
    newPreviews[index] = null
    setFiles(newFiles)
    setPreviews(newPreviews)
  }

  const handleNext = async () => {
    const selectedFiles = files.filter(Boolean)
    if (selectedFiles.length === 0) {
      nextStep()
      return
    }
    setUploading(true)
    setError('')
    try {
      const entries = files
        .map((file, i) => ({ file, i }))
        .filter(({ file }) => file !== null)

      const paths = await Promise.all(
        entries.map(({ file }, idx) => uploadSellerPhoto(file!, sellerId, idx + 1))
      )
      setField('fotoPaths', paths)
      nextStep()
    } catch {
      setError('Error al subir las fotos. Intenta de nuevo.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <StepLayout
      title="Sube fotos de tu propiedad"
      subtitle="Fachada, sala, cocina, recámaras y baño son lo más útil"
      onNext={handleNext}
      nextLabel={uploading ? 'Subiendo fotos...' : 'Continuar'}
      nextDisabled={uploading}
    >
      <div className="grid grid-cols-2 gap-3 mb-2">
        {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
          <div key={i} className={i === 4 ? 'col-span-2' : ''}>
            {previews[i] ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100">
                <img
                  src={previews[i]!}
                  alt={`Foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemove(i)}
                  className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs leading-none"
                  aria-label="Quitar foto"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => inputRefs.current[i]?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <span className="text-2xl">📷</span>
                <span className="text-xs text-gray-400">Agregar foto</span>
              </button>
            )}
            <input
              ref={(el) => { inputRefs.current[i] = el }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
            />
          </div>
        ))}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="text-xs text-gray-400 text-center">
        Opcional — puedes continuar sin fotos
      </p>
    </StepLayout>
  )
}
