import { useEffect, useRef, useState } from 'react'
import { validateImageFile } from '@/lib/storage'

interface MultiPhotoPickerProps {
  files: File[]
  onChange: (files: File[]) => void
  existingUrls?: string[]  // fotos ya subidas (admin): se muestran cuando files está vacío
  max?: number
  disabled?: boolean
  error?: string
}

export function MultiPhotoPicker({
  files,
  onChange,
  existingUrls = [],
  max = 5,
  disabled = false,
  error,
}: MultiPhotoPickerProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [validationError, setValidationError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Generar/revocar object URLs cuando cambian los files
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f))
    setPreviews(urls)
    return () => urls.forEach((u) => URL.revokeObjectURL(u))
  }, [files])

  const handleSelect = (fileList: FileList) => {
    const selected = Array.from(fileList).slice(0, max)
    const invalid = selected.find((f) => validateImageFile(f))
    if (invalid) {
      setValidationError(validateImageFile(invalid)!)
      return
    }
    setValidationError('')
    onChange(selected)
  }

  const displayUrls = previews.length > 0 ? previews : existingUrls
  const hasSelection = files.length > 0
  const hasExisting = existingUrls.length > 0

  const buttonLabel = disabled
    ? 'Subiendo fotos...'
    : hasSelection
    ? 'Cambiar selección'
    : hasExisting
    ? 'Reemplazar fotos'
    : 'Seleccionar fotos'

  return (
    <div className="flex flex-col gap-3">
      {/* Grid de previews */}
      {displayUrls.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {displayUrls.map((url, i) => (
            <div key={i} className="aspect-video rounded-xl overflow-hidden border border-gray-200">
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-400 text-center py-2">
          Sin fotos — selecciona hasta {max}
        </p>
      )}

      {/* Botón selector */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 text-sm text-gray-500 hover:text-orange-500 transition-colors disabled:opacity-50"
      >
        {buttonLabel}
      </button>

      {/* Nota contextual */}
      {hasSelection && hasExisting && (
        <p className="text-xs text-gray-400 text-center">
          Al guardar se reemplazarán las fotos anteriores
        </p>
      )}

      {(error || validationError) && (
        <p className="text-red-500 text-sm">{error || validationError}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) handleSelect(e.target.files)
          e.target.value = ''
        }}
      />
    </div>
  )
}
