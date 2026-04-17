import { useState } from 'react'
import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { uploadSellerPhoto } from '@/lib/storage'
import { MultiPhotoPicker } from '@/components/form/MultiPhotoPicker'

export function StepSellerFotos() {
  const { sellerId, setField, nextStep } = useSellerFormStore()
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleNext = async () => {
    if (files.length === 0) { nextStep(); return }
    setUploading(true)
    setError('')
    try {
      const paths = await Promise.all(
        files.map((file, i) => uploadSellerPhoto(file, sellerId, i + 1))
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
      <MultiPhotoPicker
        files={files}
        onChange={setFiles}
        max={5}
        disabled={uploading}
        error={error}
      />
      <p className="text-xs text-gray-400 text-center">
        Opcional — puedes continuar sin fotos
      </p>
    </StepLayout>
  )
}
