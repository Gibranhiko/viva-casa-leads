import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

const MAX_SIZE_MB = 15       // validación pre-compresión — el canvas lo comprime a << 1 MB
const MAX_DIMENSION = 800    // px en el lado más largo — suficiente para revisión en admin
const JPEG_QUALITY = 0.70    // calidad JPEG — ~110 KB por foto promedio
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Solo se permiten imágenes (JPG, PNG, WEBP, HEIC)'
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `La imagen no puede pesar más de ${MAX_SIZE_MB} MB antes de compresión`
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

export async function uploadSellerPhoto(file: File, sellerId: string, index: number): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)
  const compressed = await compressImage(file)
  const path = `seller-photos/${sellerId}/${index}.jpg`
  await uploadBytes(ref(storage, path), compressed, { contentType: 'image/jpeg' })
  return path
}


// Cache en memoria para URLs de Storage (válidas por horas)
const urlCache = new Map<string, string>()

// Elimina un archivo de Storage (solo admin)
export async function deleteStorageFile(path: string): Promise<void> {
  urlCache.delete(path)
  await deleteObject(ref(storage, path))
}

// Solo para uso en el panel admin (requiere auth)
export async function getImageUrl(path: string): Promise<string> {
  if (urlCache.has(path)) return urlCache.get(path)!
  const url = await getDownloadURL(ref(storage, path))
  urlCache.set(path, url)
  return url
}
