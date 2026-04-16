export interface Municipio {
  value: string
  label: string
}

export const MUNICIPIOS_MTY: Municipio[] = [
  { value: 'monterrey',      label: 'Monterrey' },
  { value: 'san_pedro',      label: 'San Pedro Garza García' },
  { value: 'san_nicolas',    label: 'San Nicolás de los Garza' },
  { value: 'guadalupe',      label: 'Guadalupe' },
  { value: 'apodaca',        label: 'Apodaca' },
  { value: 'escobedo',       label: 'General Escobedo' },
  { value: 'garcia',         label: 'García' },
  { value: 'santa_catarina', label: 'Santa Catarina' },
  { value: 'juarez',         label: 'Juárez' },
  { value: 'cadereyta',      label: 'Cadereyta Jiménez' },
]

export const MUNICIPIO_LABELS: Record<string, string> = Object.fromEntries(
  MUNICIPIOS_MTY.map(({ value, label }) => [value, label])
)
