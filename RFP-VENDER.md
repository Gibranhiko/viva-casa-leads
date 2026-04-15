# RFP — Módulo: Captura de Leads de Vendedores (Quiero Vender Casa)

**Versión:** 1.0  
**Fecha:** 2026-04-14  
**Responsable:** Gibran Villarreal

---

## 1. Resumen Ejecutivo

Se requiere un formulario multi-paso para capturar leads de **propietarios que quieren vender su casa**. El objetivo es recopilar la información mínima necesaria para que el asesor pueda hacer una primera evaluación de la propiedad y detectar posibles complicaciones antes de comprometer tiempo en la visita.

El tono debe ser **amigable y sin tecnicismos**. Muchas preguntas sensibles (escrituras, estado civil, gravámenes) se formulan de forma natural para no alarmar al vendedor. El asesor investigará los detalles en la primera reunión presencial.

---

## 2. Filosofía de Diseño

- **No abrumar al vendedor.** El formulario no es un trámite notarial. Pregunta lo justo para que el asesor llegue informado a la primera cita.
- **Detectar red flags temprano.** Ciertos edge cases (intestado, múltiples dueños, escrituras con errores) se identifican con preguntas simples de sí/no.
- **Fotos desde cámara o galería.** El vendedor puede tomar fotos en el momento o subir imágenes existentes.
- **Máximo 5 fotos.** Cantidad razonable para dar contexto visual sin saturar al usuario.
- **Progressive disclosure.** Solo se muestran preguntas relevantes según las respuestas anteriores.

---

## 3. Flujo de Pasos del Formulario

```
BLOQUE A — DATOS DEL VENDEDOR
  (Arranca directo al ingresar a /vender, sin pantalla de bienvenida intermedia)
  Paso 1: Nombre completo (requerido)
  Paso 2: WhatsApp — 10 dígitos (requerido)
  Paso 3: Email (opcional)

BLOQUE B — DATOS DE LA PROPIEDAD
  Paso 4: Dirección de la propiedad
          - Municipio: select box (municipios del área metro de Monterrey)
          - Fraccionamiento o colonia: texto libre
          - Calle y número: texto libre
          - Código postal: numérico, 5 dígitos
          Microcopy debajo del municipio: "Solo para ubicarnos — no necesitamos la dirección exacta"

  Paso 5: ¿Qué tipo de propiedad es?
          ◉ Casa en fraccionamiento
          ◉ Casa en colonia
          ◉ Departamento
          ◉ Terreno

  Paso 6: ¿Cuántas recámaras tiene?
          ◉ 1  ◉ 2  ◉ 3  ◉ 4 o más

  Paso 7: ¿Cuántos baños completos tiene?
          ◉ 1  ◉ 2  ◉ 3 o más
          Microcopy: "Cuenta solo los que tienen regadera, WC y lavabo"
          ⚠️ Red flag interno: si 1 baño → asesor verifica si está dentro de la traza predial

  Paso 8: ¿Cuántos m² de construcción aproximadamente?
          ◉ Menos de 60 m²
          ◉ 60 – 90 m²
          ◉ 90 – 120 m²
          ◉ Más de 120 m²
          ◉ No sé

  Paso 9: ¿Cuántos años tiene la casa?
           ◉ Menos de 5 años
           ◉ 5 – 15 años
           ◉ 15 – 30 años
           ◉ Más de 30 años
           ◉ No sé

  Paso 10: ¿En qué estado físico está la propiedad?
           ◉ En buen estado, lista para habitar
           ◉ Necesita reparaciones menores (pintura, detalles)
           ◉ Necesita trabajo importante (pisos, baños, cocina)
           ◉ Le faltan puertas, ventanas o tiene daños severos
           Microcopy: "Esto nos ayuda a preparar la visita del valuador"
           ⚠️ Red flag: "daños severos" → propiedad_deteriorada
             (Propiedad vandalizada o incompleta puede bloquear la valuación INFONAVIT.
              El valuador rechaza casas sin puertas, ventanas o con daños estructurales)

BLOQUE C — FOTOS (hasta 5)
  Paso 11: "Sube fotos de tu propiedad — entre más mejor"
           - Hasta 5 imágenes
           - Cada foto: botón "Tomar foto" (cámara) o "Subir imagen" (galería)
           - Formatos: JPG, PNG, HEIC — máx 8 MB por foto
           - Se comprimen a 1280px antes de subir a Storage
           - Mínimo: 0 fotos (opcional)
           - Microcopy: "Fachada, sala, cocina, recámaras y baño son lo más útil"

BLOQUE D — SITUACIÓN LEGAL Y SERVICIOS

  Paso 12: "¿La propiedad está ocupada actualmente?"
           ◉ Sí, yo la habito
           ◉ Está rentada (hay inquilinos)
           ◉ Está desocupada
           ◉ Hay personas ahí sin mi autorización
           ⚠️ Red flags:
             - "Rentada" → inquilinos_presentes: asesor coordina acceso y aviso de desalojo
             - "Sin autorización" → propiedad_invadida: proceso legal previo requerido

  Paso 13: "¿Tu propiedad tiene estos servicios activos?"
           (chips de selección múltiple)
           ☐ Luz (CFE)   ☐ Agua   ☐ Gas
           ⚠️ Red flag: CFE no activo → cfe_inactivo (puede bloquear valuador INFONAVIT)

  Paso 14: "¿El predial de tu propiedad está al corriente?"
           ◉ Sí, está pagado
           ◉ Tiene adeudo / está vencido
           ◉ No sé cómo verificarlo
           Microcopy: "El notario necesita que el predial esté al corriente para escriturar"
           ⚠️ Red flag: adeudo o no sabe → predial_insoluto

  Paso 15: "¿Cuál es tu estado civil actualmente?"
           ◉ Soltero/a
           ◉ Casado/a
           ◉ Divorciado/a
           ◉ Viudo/a
           Microcopy: "Esto nos ayuda a preparar los documentos correctos para la venta"
           ⚠️ Red flag: divorciado → estado_civil_divorciado (verificar si la propiedad
              era mancomunada y si ya se formalizó la partición de bienes)

  Paso 16: "¿Tienes las escrituras de tu propiedad?"
           ◉ Sí, están a mi nombre
           ◉ Sí, pero están a nombre de un familiar
           ◉ No las tengo / No sé dónde están
           ⚠️ Red flag: opciones 2 y 3 → seguimiento prioritario

  Paso 17: "¿Cuántos propietarios tiene la casa?"
           ◉ Solo yo
           ◉ Yo y mi pareja o cónyuge
           ◉ Yo y otros familiares (2 o más dueños)
           ◉ No estoy seguro/a
           ⚠️ Red flag: múltiples dueños → confirmar disponibilidad de todos

  Paso 18 (condicional — si eligió "pareja" o "varios"):
           "¿Todos los propietarios pueden participar en el proceso?"
           ◉ Sí, todos estamos disponibles
           ◉ Alguno no está disponible por el momento
           ◉ Uno de los propietarios ha fallecido
           ⚠️ Red flags:
             - "No disponible" → poder notarial requerido
             - "Ha fallecido" → posible intestado, proceso largo (2–4 meses)

  Paso 19: "¿Tu propiedad tiene hipoteca o crédito de vivienda?"
           ◉ No, está libre de cualquier crédito
           ◉ Sí, tengo crédito INFONAVIT activo y lo sigo pagando → va a Paso 19a
           ◉ Sí, tengo hipoteca con un banco
           ◉ Ya terminé de pagar mi crédito INFONAVIT → va a Paso 19b
           ◉ No estoy seguro/a
           Microcopy: "Tener hipoteca no impide la venta, solo lo tomamos en cuenta"
           ⚠️ Red flags:
             - Banco o no sabe → hipoteca_activa
             - INFONAVIT activo → pasa a rama 19a

  Paso 19a (condicional — INFONAVIT activo):
           "¿Qué preferirías hacer con tu crédito INFONAVIT?"
           ◉ Liquidarlo con el producto de la venta (proceso normal)
           ◉ Ya no quiero seguir pagando — me gustaría que me ayuden
           ⚠️ Nota interna (NO red flag negativo):
             - "Ya no quiero pagar" → cesion_infonavit_interes
               Oportunidad: el cliente puede firmar un poder notarial para
               ceder el crédito a un nuevo acreditado. Viva Casa gestiona el
               cambio de acreditado y el vendedor recibe un monto acordado.

  Paso 19b (condicional — INFONAVIT ya pagado):
           "¿Ya tramitaste la cancelación de la hipoteca en escrituras?"
           ◉ Sí, ya está cancelado en el Registro Público
           ◉ No lo he tramitado / No lo sé
           ⚠️ Red flag: no tramitado → cancelacion_infonavit_pendiente
             (La propiedad sigue con gravamen en el Registro Público aunque
              el crédito esté pagado — debe tramitarse antes de escriturar)

  Paso 20 (condicional — si tipoPropiedad es "departamento" o "fraccionamiento"):
           "¿Las cuotas de mantenimiento o condominio están al corriente?"
           ◉ Sí, están al corriente
           ◉ Tienen adeudo
           ◉ No hay cuotas en mi propiedad
           ⚠️ Red flag: adeudo → cuotas_condominio_adeudo
             (Adeudos de HOA pueden bloquear la venta en propiedades en condominio)

BLOQUE E — PRECIO Y EXPECTATIVAS
  Paso 21: "¿Tienes un precio en mente?"
           ◉ Sí → [Input: precio en pesos MXN]
           ◉ No, me gustaría orientación

  Paso 22: "¿Qué tan pronto necesitas vender?"
           ◉ Lo antes posible
           ◉ En los próximos 3 meses
           ◉ Sin prisa, espero el precio correcto

  Paso 23: "¿Algo más que debamos saber sobre tu propiedad?" (opcional)
           [Textarea, máx. 300 caracteres]

ENVÍO
  submitSellerLead() → Firestore /seller-leads
  Calcular redFlags automáticamente antes de guardar
  Pantalla de confirmación con nombre del vendedor
```

---

## 4. Modelo de Datos — Colección: `seller-leads`

```typescript
interface SellerLead {
  id: string
  createdAt: Timestamp
  updatedAt: Timestamp
  status: 'nuevo' | 'contactado' | 'en_proceso' | 'cerrado' | 'descartado'

  // Contacto
  nombre: string
  whatsapp: string
  email: string | null

  // Propiedad
  municipio: string
  direccionAproximada: string
  tipoPropiedad: 'fraccionamiento' | 'colonia' | 'departamento' | 'terreno'
  recamaras: '1' | '2' | '3' | '4+'
  banos: '1' | '2' | '3+'
  m2Construccion: 'menos_60' | '60_90' | '90_120' | 'mas_120' | 'no_se'
  antiguedad: 'menos_5' | '5_15' | '15_30' | 'mas_30' | 'no_se'
  condicionFisica: 'buena' | 'reparaciones_menores' | 'reparaciones_mayores' | 'deteriorada'

  // Fotos (paths en Firebase Storage, máx. 5)
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

  // Hipoteca / crédito
  situacionCredito: 'libre' | 'infonavit_activo' | 'banco' | 'infonavit_pagado' | 'no_se'
  cesionInfonvitInteres: boolean | null   // solo si infonavit_activo
  cancelacionInfonvitRegistrada: 'si' | 'no' | null  // solo si infonavit_pagado

  // Condominio (solo dept/fracc)
  cuotasCondominio: 'al_corriente' | 'con_adeudo' | 'no_aplica' | null

  // Red flags detectados automáticamente
  redFlags: RedFlag[]

  // Precio y expectativas
  precioPedido: number | null
  urgencia: 'urgente' | '3_meses' | 'sin_prisa'
  comentarios: string | null

  fuente: 'formulario_web'
}

type RedFlag =
  // Originales
  | 'cfe_inactivo'                    // CFE no activo — puede bloquear valuador INFONAVIT
  | 'escrituras_otro_nombre'          // escrituras no están a nombre del vendedor
  | 'sin_escrituras'                  // no tiene escrituras
  | 'multiple_duenos'                 // más de un dueño registrado
  | 'duenos_no_disponibles'           // algún dueño no puede participar — poder notarial
  | 'intestado'                       // dueño fallecido — sucesión pendiente (2–4 meses)
  | 'hipoteca_activa'                 // hipoteca banco activa — liquidar en notaría
  // Nuevos
  | 'propiedad_invadida'              // hay personas sin autorización — proceso legal previo
  | 'inquilinos_presentes'            // propiedad rentada — coordinar desalojo / acceso
  | 'predial_insoluto'                // predial con adeudo — notaría no puede escriturar
  | 'estado_civil_divorciado'         // divorciado — verificar partición de bienes mancomunados
  | 'cancelacion_infonavit_pendiente' // INFONAVIT pagado pero gravamen no cancelado en RPP
  | 'cuotas_condominio_adeudo'        // cuotas HOA con adeudo — puede bloquear venta
  | 'propiedad_deteriorada'           // daños severos / sin puertas o ventanas — bloquea valuación INFONAVIT
  // Oportunidad de negocio (badge distinto en admin — no es rojo)
  | 'cesion_infonavit_interes'        // cliente quiere ceder crédito INFONAVIT activo
```

---

## 5. Lógica de Red Flags (client-side antes de guardar)

```typescript
function calcularRedFlags(data: SellerFormData): RedFlag[] {
  const flags: RedFlag[] = []

  // Condición física
  if (data.condicionFisica === 'deteriorada')      flags.push('propiedad_deteriorada')

  // Ocupación
  if (data.ocupacion === 'invadida')               flags.push('propiedad_invadida')
  if (data.ocupacion === 'rentada')                flags.push('inquilinos_presentes')

  // Servicios
  if (!data.serviciosActivos.includes('luz'))      flags.push('cfe_inactivo')
  if (data.predialAlCorriente !== 'si')            flags.push('predial_insoluto')

  // Propietario
  if (data.estadoCivil === 'divorciado')           flags.push('estado_civil_divorciado')

  // Escrituras y dueños
  if (data.tieneEscrituras === 'otro_nombre')      flags.push('escrituras_otro_nombre')
  if (data.tieneEscrituras === 'no_tiene')         flags.push('sin_escrituras')
  if (['pareja','varios','no_se'].includes(data.numeroDuenos)) flags.push('multiple_duenos')
  if (data.duenosDisponibles === 'alguno_no')      flags.push('duenos_no_disponibles')
  if (data.duenosDisponibles === 'fallecido')      flags.push('intestado')

  // Crédito / hipoteca
  if (data.situacionCredito === 'banco' || data.situacionCredito === 'no_se')
                                                   flags.push('hipoteca_activa')
  if (data.cesionInfonvitInteres === true)         flags.push('cesion_infonavit_interes')
  if (data.cancelacionInfonvitRegistrada === 'no') flags.push('cancelacion_infonavit_pendiente')

  // Condominio
  if (data.cuotasCondominio === 'con_adeudo')      flags.push('cuotas_condominio_adeudo')

  return flags
}
```

---

## 6. Panel Admin — Seller Leads

- Ruta: `/admin/seller-leads`
- Tabla: Nombre, WhatsApp, Municipio, Tipo, Precio pedido, Urgencia, Red Flags, Status
- Red flags: badges rojos en tabla y detalle (con tooltip explicativo)
- Vista de detalle: todos los campos + galería de fotos
- Cambio de status en tiempo real
- Botón WhatsApp directo
- Exportar CSV

### Badges de Red Flags en el panel:

**Badges rojos (bloqueantes o de alto riesgo):**

| Red Flag | Badge | Tooltip |
|----------|-------|---------|
| `propiedad_deteriorada` | 🔨 Deteriorada | "Propiedad con daños severos o sin puertas/ventanas — valuador INFONAVIT puede rechazarla" |
| `propiedad_invadida` | 🚨 Invadida | "Hay personas en la propiedad sin autorización del dueño — requiere proceso legal previo" |
| `predial_insoluto` | 🧾 Predial | "Predial con adeudo — el notario no puede escriturar sin predial al corriente" |
| `cfe_inactivo` | ⚡ Sin CFE | "CFE no activo — puede bloquear valuador INFONAVIT" |
| `escrituras_otro_nombre` | 📄 Escrituras | "Las escrituras están a nombre de otra persona" |
| `sin_escrituras` | 📄 Sin escrituras | "El vendedor no tiene o no localiza sus escrituras" |
| `multiple_duenos` | 👥 Varios dueños | "Más de un propietario — confirmar disponibilidad de todos" |
| `duenos_no_disponibles` | ⚠️ Dueño ausente | "Algún propietario no disponible — requiere poder notarial" |
| `intestado` | ⚠️ Intestado | "Propietario fallecido — proceso de sucesión requerido (2–4 meses)" |
| `hipoteca_activa` | 🏦 Hipoteca | "Propiedad con gravamen bancario — liquidar en notaría al momento de venta" |
| `cancelacion_infonavit_pendiente` | 🏦 INFONAVIT s/cancelar | "Crédito INFONAVIT pagado pero gravamen NO cancelado en el Registro Público" |
| `estado_civil_divorciado` | 💔 Divorciado | "Propietario divorciado — verificar si la propiedad era mancomunada y si ya se formalizó la partición" |
| `cuotas_condominio_adeudo` | 🏢 Cuotas | "Adeudo de cuotas de condominio — puede bloquear la venta" |
| `inquilinos_presentes` | 🔑 Rentada | "Propiedad con inquilinos — coordinar acceso y proceso de desalojo" |

**Badge verde/dorado (oportunidad de negocio):**

| Red Flag | Badge | Tooltip |
|----------|-------|---------|
| `cesion_infonavit_interes` | 💰 Cesión INFONAVIT | "El cliente quiere dejar de pagar su crédito INFONAVIT — oportunidad de cambio de acreditado" |

---

## 7. Edge Cases que el Asesor Investiga en Visita

Estos **no se preguntan en el formulario** para no abrumar al vendedor:

| Situación | Qué busca el asesor |
|-----------|---------------------|
| Baños fuera de traza predial | Inspección visual — rechazo de valuador INFONAVIT |
| Ampliaciones sin permiso | Comparar planos vs. construcción real |
| Errores en escrituras | Revisar escritura vs. predial (dirección, nombres, lote) |
| Casa sin número oficial | Revisar con el predial municipal |
| Régimen matrimonial (bienes mancomunados) | Si el formulario detecta `estado_civil_divorciado` → asesor solicita acta de divorcio y convenio de partición de bienes |
| Poderes notariales vencidos | Verificar fecha de vigencia si hay dueño ausente |
| Certificado de Libertad de Gravamen | Solicitar al Registro Público — confirma que no hay embargos ocultos |
| Proceso de cesión INFONAVIT | Si hay flag `cesion_infonavit_interes` → asesor explica el proceso de cambio de acreditado y negocia el monto |

---

## 8. Consideraciones Técnicas

- **Colección Firestore:** `/seller-leads` (separada de `/leads` de compradores)
- **Storage fotos:** `seller-photos/{leadId}/1.jpg`, `2.jpg`, ... `5.jpg`
- **Compresión:** misma lógica que NSS — 1280px max, JPEG 0.82
- **Reglas Firestore:** create público con validación de nombre+whatsapp, read/update solo admin
- **Reglas Storage:** write público con límite 8MB, read solo admin
- **Índices:** status+createdAt, municipio+createdAt

---

## 9. Fuera de Alcance (Segunda Fase)

- Valuación automática de la propiedad
- Integración con portales (Lamudi, Vivanuncios, Inmuebles24)
- Contrato de exclusividad digital
- Estimador de precio por zona
- Tour virtual / planos
