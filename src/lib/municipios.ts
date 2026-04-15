export const MUNICIPIOS_MTY = [
  'Monterrey',
  'San Pedro Garza García',
  'San Nicolás de los Garza',
  'Guadalupe',
  'Apodaca',
  'General Escobedo',
  'García',
  'Santa Catarina',
  'Juárez',
  'Cadereyta Jiménez',
] as const

export type MunicipioMTY = typeof MUNICIPIOS_MTY[number]
