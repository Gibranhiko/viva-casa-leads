import { useState } from 'react'
import { useSellerFormStore } from '@/store/useSellerFormStore'
import { StepLayout } from '@/components/form/StepLayout'
import { MultiPhotoPicker } from '@/components/form/MultiPhotoPicker'
import { sellerPhotoCache } from '@/lib/sellerPhotoCache'

export function StepSellerFotos() {
  const { nextStep } = useSellerFormStore()
  const [files, setFiles] = useState<File[]>(sellerPhotoCache.get())

  const handleChange = (newFiles: File[]) => {
    setFiles(newFiles)
    sellerPhotoCache.set(newFiles)
  }

  return (
    <StepLayout
      title="Sube fotos de tu propiedad"
      subtitle="Fachada, sala, cocina, recámaras y baño son lo más útil"
      onNext={nextStep}
      nextLabel="Continuar"
    >
      <MultiPhotoPicker
        files={files}
        onChange={handleChange}
        max={5}
      />
      <p className="text-xs text-gray-400 text-center">
        Opcional — puedes continuar sin fotos
      </p>
    </StepLayout>
  )
}
