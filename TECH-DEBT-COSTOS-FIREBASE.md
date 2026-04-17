# Tech Debt — Optimización de Costos Firebase
**Fecha:** 2026-04-16  
**Revisado por:** Claude Code  

---

## Contexto de precios Firebase (Spark → Blaze pay-as-you-go)

| Servicio | Free tier | Costo extra |
|----------|-----------|-------------|
| Firestore reads | 50K/día | $0.06 / 100K |
| Firestore writes | 20K/día | $0.18 / 100K |
| Storage almacenamiento | 5 GB | $0.026 / GB |
| Storage descargas | 1 GB/día | $0.12 / GB |

A escala actual (decenas de leads/día), el proyecto está muy por debajo del free tier. Los tickets aquí son **preventivos** para cuando escale.

---

## COST-001 — Bajar resolución y calidad de compresión de fotos
**Prioridad: 🔴 ALTA — acción inmediata recomendada**

**Situación actual:**
```ts
const MAX_DIMENSION = 1280   // px lado más largo
const JPEG_QUALITY = 0.82
```

Una foto de iPhone a 1280px/0.82 quality pesa ~250-450 KB. Con 5 fotos por lead, eso es hasta **2.25 MB por lead**. A 100 leads con fotos = ~225 MB de storage.

Para el caso de uso (el agente revisa en el panel admin en móvil), no se necesita esa resolución. Con 800px y quality 0.70 las fotos siguen siendo nítidas para evaluación y pesan ~80-150 KB.

**Fix — cambiar en `src/lib/storage.ts`:**
```ts
const MAX_DIMENSION = 800    // antes: 1280
const JPEG_QUALITY  = 0.70   // antes: 0.82
```

**Ahorro estimado:** ~65% menos storage y bandwidth por foto. De ~350 KB promedio a ~110 KB.

**También:** Reducir el límite de validación client-side a 10 MB para HEIC/RAW grandes (el canvas las comprime igual), y actualizar `storage.rules` de 8 MB a 1.5 MB (ver también SEC-001).

---

## COST-002 — Las fotos se suben secuencialmente, no en paralelo
**Prioridad: 🟠 MEDIA**

**Situación actual en `StepSellerFotos.tsx`:**
```ts
for (let i = 0; i < files.length; i++) {
  if (files[i]) {
    const path = await uploadSellerPhoto(files[i]!, sellerId, photoIndex++)
    paths.push(path)
  }
}
```

Las fotos se comprimen y suben una por una. Con 5 fotos, el usuario espera 5 rondas completas.

**Fix — subir en paralelo con `Promise.all`:**
```ts
const entries = files
  .map((f, i) => ({ file: f, i }))
  .filter(({ file }) => file !== null)

const paths = await Promise.all(
  entries.map(({ file, i }) => uploadSellerPhoto(file!, sellerId, i + 1))
)
```

**Beneficio:** Tiempo de subida cae de ~N segundos a ~1 segundo (tiempo de la foto más lenta). No afecta costos directamente pero mejora conversión (menos abandono en el paso de fotos).

---

## COST-003 — `getDownloadURL` se llama en cada visita al detalle del lead
**Prioridad: 🟡 BAJA**

**Situación actual:** Cada vez que el admin abre un lead con fotos, se hacen N llamadas a `getDownloadURL`. Las URLs de Storage son válidas por horas pero no se cachean.

**Fix:** Cachear las URLs en memoria o sessionStorage con el path como clave. Costo de Storage downloads: $0.12/GB — a escala actual irrelevante, pero escala linealmente con visitas al admin.

```ts
const urlCache = new Map<string, string>()

export async function getImageUrl(path: string): Promise<string> {
  if (urlCache.has(path)) return urlCache.get(path)!
  const url = await getDownloadURL(ref(storage, path))
  urlCache.set(path, url)
  return url
}
```

---

## COST-004 — El admin re-fetcha todos los leads en cada navegación
**Prioridad: 🟡 BAJA**

**Situación actual:** `useLeads` y `useSellerLeads` llaman a `loadInitial()` en cada montaje del componente. Si el admin navega entre Compradores y Vendedores repetidamente, re-fetcha todo.

**Situación a escala:** Con 500 leads cargados, cada navegación = 500 reads de Firestore. A $0.06/100K reads, no es caro, pero sí innecesario.

**Fix:** Mover el estado de los hooks fuera del componente (Zustand store de admin, o React context) para que el fetch ocurra una sola vez por sesión. Alternativamente, añadir un flag `initialized` al hook para evitar re-fetches.

---

## COST-005 — Validación de tamaño de archivo ocurre después de cargar al browser
**Prioridad: 🟡 BAJA**

**Situación actual:** El usuario selecciona un archivo de 8 MB → el browser lo carga en memoria → `validateImageFile` lo rechaza. El archivo ya ocupó RAM y ancho de banda del usuario innecesariamente.

**Fix:** La validación de `accept="image/*"` en el input ya filtra tipos. Para el tamaño, el `validateImageFile` se llama inmediatamente al seleccionar — esto ya es correcto. El punto es que el límite de 8 MB es alto para un validador pre-compresión. Podría subirse a 15 MB (para cubrir HEIC de iPhone Pro) ya que el canvas lo comprimirá a < 200 KB de todas formas. El filtro real de abuso está en `storage.rules`.

---

## Acción inmediata recomendada (< 10 minutos)

**COST-001** es el único con impacto real hoy:

```ts
// src/lib/storage.ts
const MAX_DIMENSION = 800    // bajar de 1280
const JPEG_QUALITY  = 0.70   // bajar de 0.82
```

```
# storage.rules
allow write: if request.resource.size < 1536 * 1024   // bajar de 8 MB a 1.5 MB
```

Eso reduce el tamaño promedio por foto de ~350 KB a ~110 KB — un 68% de ahorro en storage y bandwidth de fotos sin impacto visible en la calidad para el caso de uso.

---

## Orden de atención

| Ticket | Descripción | Esfuerzo | Impacto |
|--------|-------------|----------|---------|
| COST-001 | Bajar resolución y quality de compresión | 5 min | Alto |
| COST-002 | Subir fotos en paralelo | 15 min | Medio (UX) |
| COST-003 | Cachear URLs de Storage | 20 min | Bajo |
| COST-004 | No re-fetchear leads al navegar | 1 h | Bajo |
| COST-005 | Revisar límite de validación pre-compresión | 5 min | Bajo |
