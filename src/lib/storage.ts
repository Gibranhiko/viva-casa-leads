import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

const MAX_SIZE_MB = 8
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

// Sube la imagen y devuelve el path en Storage (no la URL)
// La URL se genera en el admin con getImageUrl()
export async function uploadNssImage(file: File, leadId: string): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}.${ext}`
  const path = `nss-images/${leadId}/${filename}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  return path
}

// Solo para uso en el panel admin (requiere auth)
export async function getImageUrl(path: string): Promise<string> {
  return getDownloadURL(ref(storage, path))
}
