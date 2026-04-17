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
      {/* Grid de previews o drop zone vacío */}
      {displayUrls.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {displayUrls.map((url, i) => (
            <div key={i} className="aspect-video rounded-xl overflow-hidden border border-gray-200">
              <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full py-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 flex flex-col items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors disabled:opacity-50"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          <span className="text-sm font-medium">Seleccionar fotos</span>
          <span className="text-xs">Hasta {max} imágenes</span>
        </button>
      )}

      {/* Botón selector (cuando ya hay fotos) */}
      {displayUrls.length > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
          className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 hover:border-orange-400 text-sm text-gray-500 hover:text-orange-500 transition-colors disabled:opacity-50"
        >
          {buttonLabel}
        </button>
      )}

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
