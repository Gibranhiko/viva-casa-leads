import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

const MAX_SIZE_MB = 8
const MAX_DIMENSION = 1280   // px en el lado más largo
const JPEG_QUALITY = 0.82
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Solo se permiten imágenes (JPG, PNG, WEBP, HEIC)'
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `La imagen no puede pesar más de ${MAX_SIZE_MB} MB`
  }
  return null
}

// Redimensiona y comprime la imagen con Canvas antes de subir
function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      const { width, height } = img
      const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Error al comprimir imagen')),
        'image/jpeg',
        JPEG_QUALITY
      )
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Error al leer imagen')) }
    img.src = url
  })
}

// Sube la imagen comprimida y devuelve el path en Storage (no la URL)
// La URL se genera en el admin con getImageUrl()
export async function uploadNssImage(file: File, leadId: string): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  const compressed = await compressImage(file)
  const path = `nss-images/${leadId}/${Date.now()}.jpg`
  await uploadBytes(ref(storage, path), compressed, { contentType: 'image/jpeg' })
  return path
}

// Solo para uso en el panel admin (requiere auth)
export async function getImageUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path))
}
