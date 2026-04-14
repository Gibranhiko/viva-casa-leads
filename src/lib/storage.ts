import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadNssImage(file: File, leadId: string): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${Date.now()}.${ext}`
  const storageRef = ref(storage, `nss-images/${leadId}/${filename}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
