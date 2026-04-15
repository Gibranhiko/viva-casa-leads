# Tickets — Módulo: Quiero Vender Casa

**Basado en:** RFP-VENDER.md v1.0  
**Fecha:** 2026-04-14  
**Orden de implementación:** VND-000 → VND-001 → VND-011

---

## VND-000 — Refactor: StepLayout agnóstico de store

**Descripción:** `StepLayout` tiene `useFormStore` hardcodeado como fallback interno. Si un step del vendedor no pasa `onNext`, llamaría al `nextStep` del store del **comprador** — bug silencioso. Este ticket lo elimina antes de empezar el módulo vendedor.

**Assessment completo de componentes compartidos:**

| Componente | Estado | Acción |
|-----------|--------|--------|
| `StepCard` | ✅ Genérico, solo props | Reutilizar sin cambios |
| `MultiChip` | ✅ Genérico, solo props | Reutilizar sin cambios |
| `ProgressBar` | ✅ Genérico, solo props | Reutilizar sin cambios |
| `src/lib/municipios.ts` | ✅ Ya existe | Reutilizar en ambos flujos |
| `src/lib/storage.ts` (compress/validate) | ✅ Funciones puras | Reutilizar sin cambios |
| `StepLayout` | ⚠️ `useFormStore` hardcodeado | **Fix en este ticket** |
| `StepNombre/Whatsapp/Email` | 🟡 Duplicación aceptable | Seller crea sus propias versiones — son 35-50 líneas, texto puede divergir |
| `FormShell` | 🔵 Deliberadamente separado | Seller tendrá `SellerFormShell` propio |
| Stores | 🔵 Deliberadamente separado | `useFormStore` y `useSellerFormStore` independientes |

**Archivo a modificar:**
- `src/components/form/StepLayout.tsx`

**Cambio:**

```tsx
// ANTES — tiene useFormStore como fallback
import { useFormStore } from '@/store/useFormStore'

export function StepLayout({ onNext, ... }) {
  const nextStep = useFormStore((s) => s.nextStep)
  // ...
  <button onClick={onNext ?? nextStep}>
}

// DESPUÉS — completamente agnóstico
export function StepLayout({ onNext, ... }) {
  // Sin import de ningún store
  // ...
  <button onClick={onNext}>
}
```

Verificar que ningún step del comprador depende del fallback (pasa `onNext` undefined y espera que `StepLayout` llame a `nextStep`). Revisando los steps existentes: todos pasan `onNext` explícitamente o usan `hideNext={true}`. El fallback nunca se activa → el cambio es seguro.

**Acceptance:** 
- `StepLayout` no importa ningún store
- El flujo comprador sigue funcionando igual
- TypeScript compila sin errores

---

## VND-001 — Types + Seller Store

**Descripción:** Crear la capa de datos del formulario de vendedor: tipos TypeScript y el store de Zustand dedicado.

**Archivos a crear:**
- `src/types/sellerLead.ts` — interfaces `SellerLead`, `SellerFormData`, `RedFlag`
- `src/store/useSellerFormStore.ts` — Zustand store con los 23 pasos, sessionStorage persistence, `calcularRedFlags()`

**Detalles:**

`src/types/sellerLead.ts`:
```ts
export type RedFlag =
  | 'cfe_inactivo'
  | 'escrituras_otro_nombre'
  | 'sin_escrituras'
  | 'multiple_duenos'
  | 'duenos_no_disponibles'
  | 'intestado'
  | 'hipoteca_activa'
  | 'propiedad_invadida'
  | 'inquilinos_presentes'
  | 'predial_insoluto'
  | 'estado_civil_divorciado'
  | 'cancelacion_infonavit_pendiente'
  | 'cuotas_condominio_adeudo'
  | 'propiedad_deteriorada'
  | 'cesion_infonavit_interes'   // oportunidad de negocio — badge verde/dorado en admin

export interface SellerLead {
  id: string
  createdAt: any
  updatedAt: any
  status: 'nuevo' | 'contactado' | 'en_proceso' | 'cerrado' | 'descartado'

  // Contacto
  nombre: string
  whatsapp: string
  email: string | null

  // Propiedad
  municipio: string
  fraccionamiento: string
  calle: string
  cp: string
  tipoPropiedad: 'fraccionamiento' | 'colonia' | 'departamento' | 'terreno'
  recamaras: '1' | '2' | '3' | '4+'
  banos: '1' | '2' | '3+'
  m2Construccion: 'menos_60' | '60_90' | '90_120' | 'mas_120' | 'no_se'
  antiguedad: 'menos_5' | '5_15' | '15_30' | 'mas_30' | 'no_se'
  condicionFisica: 'buena' | 'reparaciones_menores' | 'reparaciones_mayores' | 'deteriorada'

  // Fotos
  fotoPaths: string[]

  // Ocupación
  ocupacion: 'habitada' | 'rentada' | 'desocupada' | 'invadida'

  // Servicios y adeudos
  serviciosActivos: ('luz' | 'agua' | 'gas')[]
  predialAlCorriente: 'si' | 'no' | 'no_se'

  // Propietario
  estadoCivil: 'soltero' | 'casado' | 'divorciado' | 'viudo'

  // Titulación
  tieneEscrituras: 'propias' | 'otro_nombre' | 'no_tiene'
  numeroDuenos: 'solo_yo' | 'pareja' | 'varios' | 'no_se'
  duenosDisponibles: 'todos' | 'alguno_no' | 'fallecido' | null

  // Crédito
  situacionCredito: 'libre' | 'infonavit_activo' | 'banco' | 'infonavit_pagado' | 'no_se'
  cesionInfonvitInteres: boolean | null
  cancelacionInfonvitRegistrada: 'si' | 'no' | null

  // Condominio
  cuotasCondominio: 'al_corriente' | 'con_adeudo' | 'no_aplica' | null

  // Red flags
  redFlags: RedFlag[]

  // Precio y expectativas
  precioPedido: number | null
  urgencia: 'urgente' | '3_meses' | 'sin_prisa'
  comentarios: string | null

  fuente: 'formulario_web'
}
```

`src/store/useSellerFormStore.ts`:
- Misma estructura que `useFormStore.ts` pero para vendedores
- `SESSION_KEY = 'viva-casa-seller-form'`
- `sellerId` generado en Firestore collection `seller-leads`
- Steps:
  ```
  'seller_nombre' | 'seller_whatsapp' | 'seller_email'
  | 'seller_direccion'               ← municipio select + fracc + calle + CP en un paso
  | 'seller_tipo_propiedad'
  | 'seller_recamaras' | 'seller_banos' | 'seller_m2' | 'seller_antiguedad'
  | 'seller_condicion'               ← nuevo: estado físico / vandalismo
  | 'seller_fotos'
  | 'seller_ocupacion' | 'seller_servicios' | 'seller_predial'
  | 'seller_estado_civil'
  | 'seller_escrituras' | 'seller_num_duenos'
  | 'seller_duenos_disponibles'     ← condicional: solo si numeroDuenos es 'pareja' | 'varios'
  | 'seller_credito'
  | 'seller_cesion_infonavit'       ← condicional: solo si situacionCredito === 'infonavit_activo'
  | 'seller_cancelacion_infonavit'  ← condicional: solo si situacionCredito === 'infonavit_pagado'
  | 'seller_cuotas_condominio'      ← condicional: solo si tipoPropiedad === 'departamento' | 'fraccionamiento'
  | 'seller_precio' | 'seller_urgencia' | 'seller_comentarios'
  ```
- `buildSellerSteps(data)` maneja todos los pasos condicionales
- `calcularRedFlags(data)` según la lógica del RFP (13 flags + 1 oportunidad)
- `fotoPaths: string[]` — paths en Storage (máx 5)
- `precioPedido: number | null`, campo `tienePrecio: boolean | null` para manejar el radio Sí/No
- `cesion_infonavit_interes` se guarda como flag pero se muestra con badge verde/dorado en admin (no rojo)

**Acceptance:** TypeScript compila sin errores. El store exporta `useSellerFormStore`.

---

## VND-002 — Firebase: submitSellerLead + uploadSellerPhoto + reglas

**Descripción:** Funciones Firebase para el módulo vendedor y actualización de reglas de seguridad.

**Archivos a modificar:**
- `src/lib/firestore.ts` — agregar `submitSellerLead()` y `updateSellerLeadStatus()`
- `src/lib/storage.ts` — agregar `uploadSellerPhoto()`
- `firestore.rules` — agregar colección `seller-leads`
- `storage.rules` — agregar path `seller-photos/`
- `firestore.indexes.json` — agregar índices para seller-leads

**Detalles:**

En `firestore.ts`, agregar:
```ts
export async function submitSellerLead(store: SellerFormStore) {
  const ref = doc(db, 'seller-leads', store.sellerId)
  const redFlags = calcularRedFlags(store)
  await setDoc(ref, {
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    status: 'nuevo',
    fuente: 'formulario_web',

    nombre: store.nombre.trim(),
    whatsapp: store.whatsapp,
    email: store.email,

    municipio: store.municipio,
    fraccionamiento: store.fraccionamiento,
    calle: store.calle,
    cp: store.cp,
    tipoPropiedad: store.tipoPropiedad,
    recamaras: store.recamaras,
    banos: store.banos,
    m2Construccion: store.m2Construccion,
    antiguedad: store.antiguedad,
    condicionFisica: store.condicionFisica,

    fotoPaths: store.fotoPaths,

    ocupacion: store.ocupacion,
    serviciosActivos: store.serviciosActivos,
    predialAlCorriente: store.predialAlCorriente,

    estadoCivil: store.estadoCivil,

    tieneEscrituras: store.tieneEscrituras,
    numeroDuenos: store.numeroDuenos,
    duenosDisponibles: store.duenosDisponibles,

    situacionCredito: store.situacionCredito,
    cesionInfonvitInteres: store.cesionInfonvitInteres,
    cancelacionInfonvitRegistrada: store.cancelacionInfonvitRegistrada,

    cuotasCondominio: store.cuotasCondominio,

    redFlags,

    precioPedido: store.precioPedido,
    urgencia: store.urgencia,
    comentarios: store.comentarios,
  })
}

export async function updateSellerLeadStatus(id: string, status: string) {
  await updateDoc(doc(db, 'seller-leads', id), { status, updatedAt: serverTimestamp() })
}
```

En `storage.ts`, agregar:
```ts
export async function uploadSellerPhoto(file: File, sellerId: string, index: number): Promise<string> {
  const validationError = validateImageFile(file)
  if (validationError) throw new Error(validationError)
  const compressed = await compressImage(file)
  const path = `seller-photos/${sellerId}/${index}.jpg`
  await uploadBytes(ref(storage, path), compressed, { contentType: 'image/jpeg' })
  return path
}
```

En `firestore.rules`, agregar bajo las reglas existentes:
```
match /seller-leads/{leadId} {
  allow create: if request.resource.data.nombre is string
                && request.resource.data.nombre.size() > 0
                && request.resource.data.whatsapp is string
                && request.resource.data.whatsapp.size() == 10;
  allow read, update: if isAdmin();
}
```

En `storage.rules`, agregar bajo las reglas existentes:
```
match /seller-photos/{leadId}/{fileName} {
  allow write: if request.resource.size < 8 * 1024 * 1024
               && request.resource.contentType.matches('image/.*');
  allow read: if isAdmin();
}
```

En `firestore.indexes.json`, agregar 2 índices compuestos:
- `seller-leads`: `status` ASC + `createdAt` DESC
- `seller-leads`: `municipio` ASC + `createdAt` DESC

**Acceptance:** 
- El usuario despliega las reglas con `firebase deploy --only firestore:rules,storage`
- El usuario despliega los índices con `firebase deploy --only firestore:indexes`

---

## VND-003 — Rutas + SellerFormPage + SellerConfirmationPage + SellerFormShell

**Descripción:** Crear la infraestructura de páginas y routing para el flujo del vendedor.

**Archivos a crear:**
- `src/pages/SellerFormPage.tsx`
- `src/pages/SellerConfirmationPage.tsx`
- `src/components/seller/SellerFormShell.tsx`

**Archivos a modificar:**
- `src/router/index.tsx` — agregar rutas `/vender` y `/vender/confirmation`

**Detalles:**

`src/router/index.tsx` — agregar:
```tsx
import { SellerFormPage } from '@/pages/SellerFormPage'
import { SellerConfirmationPage } from '@/pages/SellerConfirmationPage'
// ...
<Route path="/vender" element={<SellerFormPage />} />
<Route path="/vender/confirmation" element={<SellerConfirmationPage />} />
```

`src/pages/SellerFormPage.tsx` — análogo a `FormPage.tsx` pero renderiza `SellerFormShell`

`src/components/seller/SellerFormShell.tsx`:
- Misma estructura que `FormShell.tsx`
- Usa `useSellerFormStore`
- Mapeo de `StepId → componente` para los 23 steps del vendedor
- Progreso: barra naranja igual que el formulario comprador
- Back button no aparece en el primer paso (`seller_nombre`)
- Animación slide igual (AnimatePresence + motion.div)

`src/pages/SellerConfirmationPage.tsx`:
- Pantalla de confirmación con gradiente naranja (igual estilo que buyer confirmation)
- Texto: "¡Gracias, {nombre}! Te contactamos en menos de 24 horas."
- Botón "Volver al inicio" → navega a `/`
- Lee el nombre del `useSellerFormStore`

**Acceptance:** 
- Navegar a `/vender` muestra directamente el paso de nombre (sin pantalla intermedia)
- Las rutas existen sin errores TypeScript

---

## VND-004 — Actualizar StepWelcome: botón "Quiero vender casa"

**Descripción:** Reemplazar el modal "En construcción" por navegación real a `/vender`.

**Archivos a modificar:**
- `src/steps/StepWelcome.tsx`

**Cambios:**
- Quitar `showUnderConstruction` state y el modal `AnimatePresence`
- El botón "Quiero vender casa" llama a `navigate('/vender')`
- Quitar imports de `useState`, `AnimatePresence` si ya no se usan en este archivo

**Acceptance:** Al hacer clic en "Quiero vender casa" navega directamente a `/vender`.

---

## VND-005 — Steps Bloque A + Bloque B (contacto + propiedad)

**Descripción:** Implementar los 10 primeros pasos del formulario vendedor (pasos 1–10 del RFP).

**Archivos a crear (en `src/steps/seller/`):**
- `StepSellerNombre.tsx`
- `StepSellerWhatsapp.tsx`
- `StepSellerEmail.tsx`
- `StepSellerDireccion.tsx` ← dirección completa en un paso (municipio select + fracc + calle + CP)
- `StepSellerTipoPropiedad.tsx`
- `StepSellerRecamaras.tsx`
- `StepSellerBanos.tsx`
- `StepSellerM2.tsx`
- `StepSellerAntiguedad.tsx`
- `StepSellerCondicion.tsx` ← nuevo: estado físico / vandalismo

**Archivos a modificar:**
- `src/steps/StepDomicilio.tsx` — cambiar municipio de input a `<select>` con la lista de municipios del área metro

**Nota:** No hay `StepSellerWelcome`. El formulario arranca directo en `seller_nombre` al navegar a `/vender`. La `SellerConfirmationPage` con el gradiente naranja ya cumple el rol de bienvenida visualmente.

**Municipios del área metro de Monterrey (compartido entre comprador y vendedor):**
```ts
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
]
```
Extraer a `src/lib/municipios.ts` para reutilizar en comprador y vendedor.

**Detalles por step:**

`StepSellerNombre/Whatsapp/Email.tsx`:
- Misma UI que los equivalentes del comprador (`StepNombre`, `StepWhatsapp`, `StepEmail`)
- Conectados a `useSellerFormStore` en vez de `useFormStore`
- Validaciones idénticas (nombre required, whatsapp 10 dígitos, email opcional)

`StepSellerDireccion.tsx`:
- 4 campos en un solo paso (igual que `StepDomicilio` del comprador):
  - Municipio: `<select>` con `MUNICIPIOS_MTY`
  - Fraccionamiento o colonia: input texto
  - Calle y número: input texto
  - Código postal: input numérico, 5 dígitos
- Microcopy bajo municipio: "Solo para ubicarnos — no necesitamos la dirección exacta"
- Todos requeridos para continuar

`StepDomicilio.tsx` (comprador — modificación):
- Cambiar el input de `domicilioMunicipio` por `<select>` con `MUNICIPIOS_MTY`
- Mismo estilo visual (`border-2 border-gray-200 focus:border-orange-500 rounded-xl px-4 py-3.5`)

`StepSellerTipoPropiedad.tsx`:
- StepCard options: Casa en fraccionamiento, Casa en colonia, Departamento, Terreno
- Values: `fraccionamiento | colonia | departamento | terreno`
- Auto-avanza al seleccionar

`StepSellerRecamaras.tsx`:
- StepCard: 1, 2, 3, 4 o más → values `'1' | '2' | '3' | '4+'`

`StepSellerBanos.tsx`:
- StepCard: 1, 2, 3 o más → values `'1' | '2' | '3+'`
- Microcopy: "Cuenta solo los que tienen regadera, WC y lavabo"

`StepSellerM2.tsx`:
- StepCard: Menos de 60m², 60–90m², 90–120m², Más de 120m², No sé
- Values: `'menos_60' | '60_90' | '90_120' | 'mas_120' | 'no_se'`

`StepSellerAntiguedad.tsx`:
- StepCard: Menos de 5 años, 5–15 años, 15–30 años, Más de 30 años, No sé
- Values: `'menos_5' | '5_15' | '15_30' | 'mas_30' | 'no_se'`

`StepSellerCondicion.tsx`:
- Título: "¿En qué estado físico está la propiedad?"
- Microcopy: "Esto nos ayuda a preparar la visita del valuador"
- StepCard:
  - "En buen estado, lista para habitar" → `'buena'`
  - "Necesita reparaciones menores (pintura, detalles)" → `'reparaciones_menores'`
  - "Necesita trabajo importante (pisos, baños, cocina)" → `'reparaciones_mayores'`
  - "Le faltan puertas, ventanas o tiene daños severos" → `'deteriorada'`
- Auto-avanza al seleccionar
- Red flag `propiedad_deteriorada` si elige `'deteriorada'`
  - Badge en admin: "🔨 Deteriorada" — "Propiedad con daños severos o sin puertas/ventanas — valuador INFONAVIT puede rechazarla"

**Acceptance:** 10 pasos renderizan y avanzan. Municipio es select en comprador y vendedor. No existe pantalla de bienvenida intermedia en `/vender`.

---

## VND-006 — Step Bloque C: Fotos (hasta 5)

**Descripción:** Paso de carga de fotos de la propiedad — cámara o galería, hasta 5 imágenes.

**Archivos a crear:**
- `src/steps/seller/StepSellerFotos.tsx`

**Detalles:**

UI:
- Título: "Sube fotos de tu propiedad"
- Microcopy: "Fachada, sala, cocina, recámaras y baño son lo más útil"
- Grid de tarjetas de foto (máx 5). Cada tarjeta muestra:
  - Si vacía: ícono de cámara + botón "Agregar foto"
  - Si tiene foto: thumbnail + botón "Quitar"
- Botón único "Agregar foto" abre `<input type="file" accept="image/*" capture="environment">` con flag para poder elegir galería también (sin `capture` en desktop, con `capture` opcional en móvil)
- El estado local maneja preview URLs (`URL.createObjectURL`)
- Al continuar, sube las fotos a Storage con `uploadSellerPhoto()` y guarda los paths en el store

Lógica:
```tsx
// Estado local de archivos seleccionados (antes de subir)
const [files, setFiles] = useState<(File | null)[]>([null, null, null, null, null])
const [uploading, setUploading] = useState(false)

const handleNext = async () => {
  setUploading(true)
  const paths: string[] = []
  for (let i = 0; i < files.length; i++) {
    if (files[i]) {
      const path = await uploadSellerPhoto(files[i]!, sellerId, i + 1)
      paths.push(path)
    }
  }
  setField('fotoPaths', paths)
  nextStep()
  setUploading(false)
}
```

- Paso es **opcional** — se puede continuar sin fotos
- Botón "Continuar" habilitado siempre (con o sin fotos)
- Si hay fotos, botón dice "Continuar" (no "Siguiente")
- Mientras sube: spinner + "Subiendo fotos..."
- Validación por archivo: `validateImageFile()` existente en `storage.ts`

**Acceptance:** Se pueden seleccionar hasta 5 fotos, ver previews, quitar, y al continuar se suben a Firebase Storage bajo `seller-photos/{sellerId}/`.

---

## VND-007 — Steps Bloque D: Situación legal y servicios

**Descripción:** Implementar pasos 12–20 del RFP (ocupación, servicios, predial, estado civil, escrituras, dueños, crédito y cuotas).

**Archivos a crear (en `src/steps/seller/`):**
- `StepSellerOcupacion.tsx`
- `StepSellerServicios.tsx`
- `StepSellerPredial.tsx`
- `StepSellerEstadoCivil.tsx`
- `StepSellerEscrituras.tsx`
- `StepSellerNumeroDuenos.tsx`
- `StepSellerDuenosDisponibles.tsx` ← condicional
- `StepSellerCredito.tsx`
- `StepSellerCesionInfonavit.tsx` ← condicional
- `StepSellerCancelacionInfonavit.tsx` ← condicional
- `StepSellerCuotasCondominio.tsx` ← condicional

**Detalles:**

`StepSellerOcupacion.tsx`:
- Título: "¿La propiedad está ocupada actualmente?"
- StepCard:
  - "Sí, yo la habito" → `'habitada'`
  - "Está rentada" → `'rentada'`
  - "Está desocupada" → `'desocupada'`
  - "Hay personas ahí sin mi autorización" → `'invadida'`
- Auto-avanza al seleccionar

`StepSellerServicios.tsx`:
- Título: "¿Tu propiedad tiene estos servicios activos?"
- Multi-chip: Luz (CFE), Agua, Gas → values `'luz' | 'agua' | 'gas'`
- Selección múltiple. No auto-avanza.
- Botón "Continuar" siempre habilitado (puede tener 0 servicios)
- Guarda en `serviciosActivos: string[]`

`StepSellerPredial.tsx`:
- Título: "¿El predial de tu propiedad está al corriente?"
- StepCard:
  - "Sí, está pagado" → `'si'`
  - "Tiene adeudo / está vencido" → `'no'`
  - "No sé cómo verificarlo" → `'no_se'`
- Microcopy: "El notario necesita predial al corriente para escriturar"
- Auto-avanza al seleccionar

`StepSellerEstadoCivil.tsx`:
- Título: "¿Cuál es tu estado civil actualmente?"
- StepCard:
  - "Soltero/a" → `'soltero'`
  - "Casado/a" → `'casado'`
  - "Divorciado/a" → `'divorciado'`
  - "Viudo/a" → `'viudo'`
- Microcopy: "Esto nos ayuda a preparar los documentos correctos"
- Auto-avanza al seleccionar

`StepSellerEscrituras.tsx`:
- Título: "¿Tienes las escrituras de tu propiedad?"
- StepCard:
  - "Sí, están a mi nombre" → `'propias'`
  - "Sí, pero están a nombre de un familiar" → `'otro_nombre'`
  - "No las tengo / No sé dónde están" → `'no_tiene'`
- Auto-avanza al seleccionar

`StepSellerNumeroDuenos.tsx`:
- Título: "¿Cuántos propietarios tiene la casa?"
- StepCard:
  - "Solo yo" → `'solo_yo'`
  - "Yo y mi pareja o cónyuge" → `'pareja'`
  - "Yo y otros familiares (2 o más dueños)" → `'varios'`
  - "No estoy seguro/a" → `'no_se'`
- Auto-avanza. Si `'solo_yo'`, salta `seller_duenos_disponibles` en `buildSellerSteps`

`StepSellerDuenosDisponibles.tsx` (condicional — `numeroDuenos === 'pareja' | 'varios'`):
- Título: "¿Todos los propietarios pueden participar en el proceso?"
- StepCard:
  - "Sí, todos estamos disponibles" → `'todos'`
  - "Alguno no está disponible por el momento" → `'alguno_no'`
  - "Uno de los propietarios ha fallecido" → `'fallecido'`
- Auto-avanza al seleccionar

`StepSellerCredito.tsx`:
- Título: "¿Tu propiedad tiene hipoteca o crédito de vivienda?"
- StepCard:
  - "No, está libre de cualquier crédito" → `'libre'`
  - "Sí, tengo crédito INFONAVIT activo" → `'infonavit_activo'` → siguiente: `seller_cesion_infonavit`
  - "Sí, tengo hipoteca con un banco" → `'banco'`
  - "Ya terminé de pagar mi INFONAVIT" → `'infonavit_pagado'` → siguiente: `seller_cancelacion_infonavit`
  - "No estoy seguro/a" → `'no_se'`
- Microcopy: "Tener hipoteca no impide la venta, solo lo tomamos en cuenta"
- Auto-avanza al seleccionar

`StepSellerCesionInfonavit.tsx` (condicional — `situacionCredito === 'infonavit_activo'`):
- Título: "¿Qué preferirías hacer con tu crédito INFONAVIT?"
- StepCard:
  - "Liquidarlo con el producto de la venta" → `cesionInfonvitInteres = false`
  - "Ya no quiero seguir pagando — me ayudan" → `cesionInfonvitInteres = true`
- Microcopy: "Existen opciones para transferir el crédito a otra persona — te explicamos"
- Auto-avanza al seleccionar
- ⚠️ Nota: si elige "ya no quiero pagar" → flag `cesion_infonavit_interes` (badge VERDE/DORADO en admin, no rojo — es oportunidad)

`StepSellerCancelacionInfonavit.tsx` (condicional — `situacionCredito === 'infonavit_pagado'`):
- Título: "¿Ya tramitaste la cancelación de la hipoteca en escrituras?"
- StepCard:
  - "Sí, ya está cancelado en el Registro Público" → `'si'`
  - "No lo he tramitado / No lo sé" → `'no'`
- Microcopy: "Aunque hayas terminado de pagar, el trámite de cancelación debe hacerse por separado"
- Auto-avanza al seleccionar

`StepSellerCuotasCondominio.tsx` (condicional — `tipoPropiedad === 'departamento' | 'fraccionamiento'`):
- Título: "¿Las cuotas de mantenimiento están al corriente?"
- StepCard:
  - "Sí, están al corriente" → `'al_corriente'`
  - "Tienen adeudo" → `'con_adeudo'`
  - "No hay cuotas en mi propiedad" → `'no_aplica'`
- Auto-avanza al seleccionar

**Acceptance:** 
- Todos los pasos condicionales aparecen/desaparecen correctamente según `buildSellerSteps`
- El badge `cesion_infonavit_interes` se muestra en verde/dorado en admin (no rojo)
- Red flags calculados correctamente al submit

---

## VND-008 — Steps Bloque E: Precio, urgencia y submit

**Descripción:** Implementar los pasos finales (21–23 del RFP) y el submit del formulario vendedor.

**Archivos a crear (en `src/steps/seller/`):**
- `StepSellerPrecio.tsx`
- `StepSellerUrgencia.tsx`
- `StepSellerComentarios.tsx` ← último paso, dispara submit

**Detalles:**

`StepSellerPrecio.tsx`:
- Título: "¿Tienes un precio en mente?"
- Dos opciones radio + input condicional:
  - "Sí" → muestra input de precio en MXN (formato numérico, sin comas al guardar)
  - "No, me gustaría orientación" → `precioPedido = null`
- State local: `tienePrecio: boolean | null`
- Validación: si eligió "Sí", el precio debe ser > 0 para poder continuar
- Placeholder input: "Ej. 1,500,000"
- Guarda en `precioPedido: number | null`

`StepSellerUrgencia.tsx`:
- Título: "¿Qué tan pronto necesitas vender?"
- StepCard:
  - "Lo antes posible" → `'urgente'`
  - "En los próximos 3 meses" → `'3_meses'`
  - "Sin prisa, espero el precio correcto" → `'sin_prisa'`
- Auto-avanza

`StepSellerComentarios.tsx`:
- Título: "¿Algo más que debamos saber sobre tu propiedad?"
- Subtitle: "Opcional"
- Textarea, máx 300 caracteres, contador igual que `StepComentarios.tsx`
- Anti-spam: honeypot field + rate limit 60s (`'viva-casa-seller-last-submit'` en localStorage)
- Botón: "Enviar mi información"
- Al confirmar:
  1. `submitSellerLead(store)` — sube a Firestore `/seller-leads`
  2. `reset()` del store
  3. `navigate('/vender/confirmation')`
- Manejo de errores: mensaje rojo si falla
- Estado loading: "Enviando..." en el botón

**Acceptance:** Al completar el formulario y enviar, aparece el documento en Firestore `/seller-leads` con todos los campos incluyendo `redFlags[]`.

---

## VND-009 — Admin: Lista de Seller Leads (`/admin/seller-leads`)

**Descripción:** Página de administración para ver y gestionar leads de vendedores.

**Archivos a crear:**
- `src/pages/admin/SellerLeadsPage.tsx`
- `src/hooks/useSellerLeads.ts`

**Archivos a modificar:**
- `src/router/index.tsx` — agregar ruta `/admin/seller-leads`

**Detalles:**

`src/hooks/useSellerLeads.ts`:
- Misma lógica de paginación cursorial que `useLeads.ts`
- Colección: `seller-leads`
- Ordenado: `status ASC + createdAt DESC`
- 25 por página
- Método `loadInitial()` + `loadMore()`

`src/pages/admin/SellerLeadsPage.tsx`:
- Header igual que `LeadsPage`: imagotipo + "Viva Casa / Vendedores"
- Filtros:
  - Búsqueda por nombre
  - Dropdown de municipio
  - Dropdown de status
- Tabla con columnas: **Nombre, WhatsApp, Municipio, Tipo, Precio pedido, Urgencia, Red Flags, Status**
- Red Flags: badges inline en la fila de tabla (rojos los bloqueantes, verde/dorado `cesion_infonavit_interes`)
  - `propiedad_deteriorada` → "🔨 Deteriorada"
  - `propiedad_invadida` → "🚨 Invadida"
  - `inquilinos_presentes` → "🔑 Rentada"
  - `predial_insoluto` → "🧾 Predial"
  - `cfe_inactivo` → "⚡ Sin CFE"
  - `escrituras_otro_nombre` → "📄 Escrituras"
  - `sin_escrituras` → "📄 Sin escrituras"
  - `estado_civil_divorciado` → "💔 Divorciado"
  - `multiple_duenos` → "👥 Varios dueños"
  - `duenos_no_disponibles` → "⚠️ Dueño ausente"
  - `intestado` → "⚠️ Intestado"
  - `hipoteca_activa` → "🏦 Hipoteca"
  - `cancelacion_infonavit_pendiente` → "🏦 INFONAVIT s/cancelar"
  - `cuotas_condominio_adeudo` → "🏢 Cuotas"
  - `cesion_infonavit_interes` → "💰 Cesión INFONAVIT" (badge verde/dorado — oportunidad)
- Click en fila → navega a `/admin/seller-leads/:id`
- Botón "Cargar más" al pie
- Botón "Exportar CSV" — reutilizar `exportToCSV()` adaptado a SellerLead
- Botón "Cerrar sesión" (mismo que LeadsPage)
- Link de navegación hacia "Compradores" (LeadsPage) en el header

**Acceptance:** La página carga seller leads de Firestore, muestra badges de red flags, filtra por nombre/municipio/status.

---

## VND-010 — Admin: Detalle de Seller Lead (`/admin/seller-leads/:id`)

**Descripción:** Vista de detalle completa para un seller lead individual.

**Archivos a crear:**
- `src/pages/admin/SellerLeadDetailPage.tsx`

**Archivos a modificar:**
- `src/router/index.tsx` — agregar ruta `/admin/seller-leads/:id`

**Detalles:**

Secciones de la vista de detalle:
1. **Header** — nombre + status dropdown editable + botón WhatsApp directo (`https://wa.me/52{whatsapp}`)
2. **Red Flags** — badges grandes con tooltip. `cesion_infonavit_interes` en verde/dorado; el resto en rojo.
3. **Datos de contacto** — nombre, whatsapp, email
4. **Propiedad** — municipio, fraccionamiento, calle, CP, tipo, recámaras, baños, m2, antigüedad, condición física
5. **Ocupación** — habitada / rentada / desocupada / invadida
6. **Servicios y adeudos** — chips luz/agua/gas (verdes = activo, gris = no) + predial al corriente
7. **Propietario** — estado civil, escrituras, num dueños, disponibilidad dueños
8. **Crédito** — situación crédito, cesión INFONAVIT (si aplica), cancelación INFONAVIT (si aplica)
9. **Condominio** — cuotas (si aplica)
10. **Precio y expectativas** — precio pedido (o "Sin precio definido"), urgencia, comentarios
11. **Fotos** — galería de thumbnails. Al hacer clic abre en tamaño completo (lightbox simple). Usa `getImageUrl()`.
12. **Footer** — fecha de creación

Status dropdown cambia con `updateSellerLeadStatus()`.

Tooltips de red flags (al pasar el mouse o al tocar):
| RedFlag | Tooltip |
|---------|---------|
| `propiedad_deteriorada` | "Propiedad con daños severos o sin puertas/ventanas — valuador INFONAVIT puede rechazarla" |
| `propiedad_invadida` | "Hay personas sin autorización — requiere proceso legal previo a la venta" |
| `inquilinos_presentes` | "Propiedad con inquilinos — coordinar acceso y proceso de desalojo" |
| `predial_insoluto` | "Predial con adeudo — el notario no puede escriturar sin predial al corriente" |
| `cfe_inactivo` | "CFE no activo — puede bloquear valuador INFONAVIT" |
| `escrituras_otro_nombre` | "Las escrituras están a nombre de otra persona" |
| `sin_escrituras` | "El vendedor no tiene o no localiza sus escrituras" |
| `estado_civil_divorciado` | "Propietario divorciado — verificar si la propiedad era mancomunada y si se formalizó la partición" |
| `multiple_duenos` | "Más de un propietario — confirmar disponibilidad de todos" |
| `duenos_no_disponibles` | "Algún propietario no disponible — requiere poder notarial" |
| `intestado` | "Propietario fallecido — proceso de sucesión requerido (2–4 meses)" |
| `hipoteca_activa` | "Propiedad con gravamen bancario — liquidar en notaría al momento de venta" |
| `cancelacion_infonavit_pendiente` | "Crédito INFONAVIT pagado pero gravamen NO cancelado en el Registro Público" |
| `cuotas_condominio_adeudo` | "Adeudo de cuotas de condominio — puede bloquear la venta" |
| `cesion_infonavit_interes` | "El cliente quiere dejar de pagar su INFONAVIT — oportunidad de cambio de acreditado" |

**Acceptance:** La vista muestra todos los campos, red flags con tooltips, galería de fotos funcional, y el status se puede cambiar en tiempo real.

---

## VND-011 — Navegación Admin: Link entre secciones comprador/vendedor

**Descripción:** Agregar navegación cruzada en el panel admin entre leads de compradores y vendedores.

**Archivos a modificar:**
- `src/pages/admin/LeadsPage.tsx` — agregar link/tab a "Vendedores"
- `src/pages/admin/SellerLeadsPage.tsx` — link/tab a "Compradores"

**Detalles:**
- En ambas páginas, debajo del header agregar dos botones/tabs:
  - "Compradores" → `/admin`
  - "Vendedores" → `/admin/seller-leads`
- El tab activo visualmente resaltado (fondo naranja sólido, el inactivo translúcido)
- Estilo consistente con la UI existente (rounded-full, naranja)

**Acceptance:** Se puede navegar entre `/admin` y `/admin/seller-leads` con un solo clic desde cualquier pantalla del panel.

---

## Resumen de archivos nuevos

```
src/
  types/
    sellerLead.ts                          (VND-001)
  store/
    useSellerFormStore.ts                  (VND-001)
  lib/
    municipios.ts                          (VND-005, nuevo — lista compartida)
    firestore.ts                           (VND-002, modificación)
    storage.ts                             (VND-002, modificación)
  steps/
    StepDomicilio.tsx                      (VND-005, modificación — municipio → select)
  steps/seller/
    StepSellerNombre.tsx                   (VND-005)
    StepSellerWhatsapp.tsx                 (VND-005)
    StepSellerEmail.tsx                    (VND-005)
    StepSellerDireccion.tsx                (VND-005)
    StepSellerTipoPropiedad.tsx            (VND-005)
    StepSellerRecamaras.tsx                (VND-005)
    StepSellerBanos.tsx                    (VND-005)
    StepSellerM2.tsx                       (VND-005)
    StepSellerAntiguedad.tsx               (VND-005)
    StepSellerCondicion.tsx                (VND-005)
    StepSellerFotos.tsx                    (VND-006)
    StepSellerOcupacion.tsx                (VND-007)
    StepSellerServicios.tsx                (VND-007)
    StepSellerPredial.tsx                  (VND-007)
    StepSellerEstadoCivil.tsx              (VND-007)
    StepSellerEscrituras.tsx               (VND-007)
    StepSellerNumeroDuenos.tsx             (VND-007)
    StepSellerDuenosDisponibles.tsx        (VND-007)
    StepSellerCredito.tsx                  (VND-007)
    StepSellerCesionInfonavit.tsx          (VND-007)
    StepSellerCancelacionInfonavit.tsx     (VND-007)
    StepSellerCuotasCondominio.tsx         (VND-007)
    StepSellerPrecio.tsx                   (VND-008)
    StepSellerUrgencia.tsx                 (VND-008)
    StepSellerComentarios.tsx              (VND-008)
  components/seller/
    SellerFormShell.tsx                    (VND-003)
  pages/
    SellerFormPage.tsx                     (VND-003)
    SellerConfirmationPage.tsx             (VND-003)
    admin/
      SellerLeadsPage.tsx                  (VND-009)
      SellerLeadDetailPage.tsx             (VND-010)
  hooks/
    useSellerLeads.ts                      (VND-009)

firestore.rules                            (VND-002, modificación)
storage.rules                              (VND-002, modificación)
firestore.indexes.json                     (VND-002, modificación)
```

## Orden de implementación recomendado

```
VND-000 → VND-001 → VND-002 → VND-003 → VND-004 → VND-005 → VND-006 → VND-007 → VND-008 → VND-009 → VND-010 → VND-011
```

Cada ticket puede ser revisado y probado antes de pasar al siguiente. Los primeros 4 sientan las bases; del 5 al 8 es el formulario completo; 9-11 es el panel admin.
