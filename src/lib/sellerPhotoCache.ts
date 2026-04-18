// Module-level cache for seller photos — survives step navigation but not page reloads.
// Files are uploaded only on final submit to avoid wasting Storage on incomplete forms.
let pendingFiles: File[] = []

export const sellerPhotoCache = {
  set: (files: File[]) => { pendingFiles = files },
  get: () => pendingFiles,
  clear: () => { pendingFiles = [] },
}
