# RFP — Viva Casa Leads: Captura de Leads Inmobiliarios (PWA)

**Versión:** 1.1  
**Fecha:** 2026-04-13  
**Responsable:** Gibran Villarreal  
**Empresa:** Viva Casa (Inmobiliaria)

---

## 1. Resumen Ejecutivo

Se requiere desarrollar una **Progressive Web App (PWA)** con marca **Viva Casa** que funcione como formulario inteligente de captura y perfilado de leads inmobiliarios. El objetivo es aprovechar los contactos que ya llegan mediante Facebook Marketplace (leads calificados con intención de compra) y registrarlos de forma estructurada, rápida y agradable desde cualquier navegador web, sin necesidad de instalar ninguna app.

El formulario debe sentirse como una **conversación**, no como un trámite burocrático. Debe adaptarse según el tipo de crédito del usuario y capturar el perfil completo del comprador para facilitar el seguimiento comercial.

---

## 2. Problema a Resolver

El equipo recibe mensajes de personas interesadas en comprar casa mediante Facebook Marketplace. Muchas de estas personas **ya cuentan con un crédito activo** pero no encuentran la propiedad que buscan en el catálogo actual.

Estos contactos representan **leads válidos y calificados** que se pierden al no registrarlos. La solución capturará esa información en el momento de contacto para darles seguimiento posterior con propiedades que sí se adapten a su perfil financiero y preferencias.

---

## 3. Objetivos del Proyecto

1. **Capturar leads calificados** que ya tienen intención y capacidad de compra.
2. **Perfilar completamente al comprador**: datos personales, situación laboral, financiera y preferencias.
3. **Segmentar por tipo de crédito** para filtros y seguimiento personalizado.
4. **Registrar preferencias** de zona, tipo de inmueble y uso (vivienda vs. inversión).
5. **Notificar en tiempo real** al administrador por email al recibir cada nuevo lead.
6. **Almacenar y gestionar** todos los leads desde un panel de administración protegido.

---

## 4. Alcance

### 4.1 Incluido en este proyecto

- PWA accesible desde cualquier navegador web moderno (Chrome, Safari, Firefox), sin necesidad de App Store
- Formulario conversacional multi-paso con lógica condicional por tipo de crédito
- Subida de screenshot/foto del NSS desde cámara o galería del celular (opcional)
- Subida de imagen a Firebase Storage
- Notificación automática por **email al administrador** cada vez que llega un nuevo lead (via Firebase Extension: Trigger Email + Gmail SMTP — gratuito)
- Panel de administración MVP con React, protegido por login (Firebase Auth)
- Almacenamiento en Firestore
- Hosting en Firebase Hosting
- Diseño mobile-first, responsive, con marca Viva Casa

### 4.2 Fuera de alcance (v1)

- CRM completo
- Integración automática con WhatsApp o Meta Ads
- Notificaciones push
- Módulo de propiedades / catálogo
- Tracking por asesor (un solo administrador en v1)
- App nativa para Android o iOS

---

## 5. Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18+ con Vite |
| Estilos | Tailwind CSS |
| Animaciones / UX | Framer Motion |
| PWA | Vite PWA Plugin (Workbox) |
| Base de datos | Firebase Firestore |
| Archivos / fotos | Firebase Storage |
| Hosting | Firebase Hosting |
| Autenticación (admin) | Firebase Auth (email + password) |
| Notificaciones email | Firebase Extension: Trigger Email from Firestore + Gmail SMTP |
| State management | Zustand |

---

## 6. Diseño del Formulario

### 6.1 Principios de UX

- **Conversacional:** Cada pregunta aparece sola, como en un chat. No mostrar todo el formulario de golpe.
- **Progressive disclosure:** Mostrar preguntas adicionales solo según las respuestas previas.
- **Mobile-first:** Botones grandes, una sola columna, auto-avance al seleccionar opción cuando es posible.
- **Motivacional:** Barra de progreso visible, microcopy amigable ("Perfecto", "Ya casi terminamos", etc.)
- **Completo:** Capturar el perfil más completo posible para facilitar el seguimiento comercial.

### 6.2 Flujo del Formulario (Multi-paso con lógica condicional)

```
PASO 1 — Bienvenida
  └── "¡Hola! Soy del equipo de Viva Casa. En unos minutos
       registramos tu perfil para encontrarte la propiedad ideal.
       ¿Empezamos?"
       [Botón: Sí, empecemos →]

──────────────────────────────────────────────────────────────
 BLOQUE A — DATOS DE CONTACTO
──────────────────────────────────────────────────────────────

PASO 2 — Nombre completo
  └── "¿Cuál es tu nombre completo?" [Input texto]

PASO 3 — WhatsApp
  └── "¿Tu número de WhatsApp?" [Input tel, prefijo +52]

PASO 4 — Email
  └── "¿Tu correo electrónico?" [Input email]
      [Opción: "Prefiero no dar mi email"] → guarda null

──────────────────────────────────────────────────────────────
 BLOQUE B — PERFIL PERSONAL
──────────────────────────────────────────────────────────────

PASO 5 — Edad
  └── "¿Cuántos años tienes?" [Input numérico, 18–80]

PASO 6 — Estado civil
  └── "¿Cuál es tu estado civil?"
      ◉ Soltero/a
      ◉ Casado/a
      ◉ Unión libre
      ◉ Divorciado/a
      ◉ Viudo/a

PASO 7 — Dependientes económicos
  └── "¿Tienes hijos u otras personas que dependan de ti?"
      ◉ No
      ◉ Sí, 1–2 personas
      ◉ Sí, 3 o más personas

PASO 8 — Dónde vive actualmente
  └── Tres campos de texto libre (sin catálogo):
      "¿En qué municipio vives?" [Input texto]
      "¿En qué fraccionamiento o colonia?" [Input texto]
      "¿En qué calle?" [Input texto]

──────────────────────────────────────────────────────────────
 BLOQUE C — SITUACIÓN LABORAL
──────────────────────────────────────────────────────────────

PASO 9 — Situación laboral
  └── "¿Cuál es tu situación laboral actual?"
      ◉ Empleado formal (con IMSS)
      ◉ Empleado informal (sin IMSS)
      ◉ Independiente / negocio propio
      ◉ Pensionado / jubilado
      ◉ Sin empleo actualmente

PASO 10 — Empresa o giro (condicional: si NO es "sin empleo")
  └── "¿En qué empresa trabajas o cuál es tu giro de negocio?"
      [Input texto] + [Opción: "Prefiero no decirlo"]

PASO 11 — Ingreso mensual aproximado
  └── "¿Cuál es tu ingreso mensual aproximado?"
      ◉ Menos de $8,000
      ◉ $8,000 – $15,000
      ◉ $15,000 – $25,000
      ◉ $25,000 – $40,000
      ◉ Más de $40,000
      ◉ Prefiero no decirlo

──────────────────────────────────────────────────────────────
 BLOQUE D — TIPO DE CRÉDITO
──────────────────────────────────────────────────────────────

PASO 12 — Tipo de crédito
  └── "¿Con qué tipo de crédito planeas comprar?"
      [Tarjetas con ícono + descripción breve:]

      ◉ Crédito Infonavit Tradicional
          "Para comprar casa nueva o usada. Tasas según tu salario."

      ◉ Infonavit Total
          "Para ingresos superiores, combina Infonavit con una entidad financiera."

      ◉ Cofinavit
          "Une tu crédito Infonavit con un crédito bancario para mayor monto."

      ◉ Unamos Créditos
          "Únetе con pareja, familiar o amigo para comprar una casa de mayor valor."

      ◉ Segundo Crédito Infonavit
          "Ya liquidaste tu primer crédito y quieres comprar otra propiedad."

      ◉ Crédito bancario / hipotecario
          "Financiamiento directo con un banco, sin Infonavit."

      ◉ Recursos propios / contado
          "Compra directa sin crédito."

        ┌──────────────────────────────────────────────────────┐
        │ SI cualquier opción de INFONAVIT → RAMA A (13A–15A) │
        │ SI BANCO → RAMA B (13B–14B)                         │
        │ SI RECURSOS PROPIOS → RAMA C (13C)                  │
        └──────────────────────────────────────────────────────┘

── RAMA A: CUALQUIER MODALIDAD INFONAVIT ──────────────────────

PASO 13A — NSS
  └── "¿Tienes tu Número de Seguridad Social (NSS)?"
      [Input numérico de 11 dígitos]
      [Botón secundario: "Subir foto / screenshot de mi NSS 📷"]
        → Abre cámara o galería → sube imagen a Firebase Storage
      [Opción: "No lo tengo a la mano" → guarda null]
      Microcopy: "Solo lo usamos para verificar tu precalificación."

PASO 14A — Precalificación conocida
  └── "¿Sabes aproximadamente cuánto te presta Infonavit?"
      ◉ Menos de $400,000
      ◉ $400,000 – $700,000
      ◉ $700,000 – $1,000,000
      ◉ Más de $1,000,000
      ◉ No sé / no he consultado

PASO 15A — ¿Alguien más participa en el crédito?
  (Solo si eligió Infonavit Total, Cofinavit o Unamos Créditos)
  └── "¿Quién más participará en el crédito contigo?"
      ◉ Mi pareja (casados o unión libre)
      ◉ Un familiar (padre, madre, hermano/a, hijo/a)
      ◉ Un amigo
      ◉ Una entidad bancaria (solo cofinanciamiento)

→ Continúa en PASO 16 (Uso del inmueble)

── RAMA B: CRÉDITO BANCARIO ───────────────────────────────────

PASO 13B — Banco de preferencia
  └── "¿Ya tienes banco en mente?"
      ◉ BBVA
      ◉ Santander
      ◉ Banamex / Citibanamex
      ◉ Scotiabank
      ◉ HSBC
      ◉ Banorte
      ◉ Otro / No sé todavía

PASO 14B — Enganche disponible
  └── "¿Cuentas con enganche?"
      ◉ Sí, tengo enganche listo
      ◉ Estoy juntando el enganche
      ◉ No sé cuánto necesito

→ Continúa en PASO 16 (Uso del inmueble)

── RAMA C: RECURSOS PROPIOS ───────────────────────────────────

PASO 13C — Presupuesto estimado
  └── "¿Cuál es tu presupuesto aproximado?"
      ◉ Menos de $500,000
      ◉ $500,000 – $1,000,000
      ◉ $1,000,000 – $2,000,000
      ◉ Más de $2,000,000
      ◉ Prefiero no decirlo

→ Continúa en PASO 16 (Uso del inmueble)

──────────────────────────────────────────────────────────────
 BLOQUE E — USO Y PREFERENCIAS (TODOS)
──────────────────────────────────────────────────────────────

PASO 16 — Uso del inmueble
  └── "¿Para qué vas a usar la propiedad?"
      ◉ Para vivir (residencia principal)
      ◉ Inversión — renta tradicional (inquilino fijo)
      ◉ Inversión — renta vacacional (Airbnb / corto plazo)

PASO 17 — Zona de interés
  └── "¿En qué zona del área metro de Monterrey buscas?"
      [Selección múltiple de chips:]
      ☐ Monterrey       ☐ San Pedro Garza García
      ☐ Santa Catarina  ☐ Apodaca
      ☐ García          ☐ Juárez
      ☐ General Escobedo ☐ Guadalupe
      ☐ Santiago        ☐ Cadereyta
      ☐ Me da igual / Donde haya buena oferta

PASO 18 — Tipo de inmueble
  └── "¿Qué tipo de propiedad buscas?"
      ◉ Casa en fraccionamiento privado (acceso controlado)
      ◉ Casa en colonia abierta
      ◉ Departamento
      ◉ Me da igual

PASO 19 — Características deseadas
  └── "¿Qué es lo que NO puede faltar?"
      [Selección múltiple de chips:]
      ☐ 3 recámaras o más    ☐ 2 recámaras
      ☐ 2 baños o más        ☐ Cochera techada
      ☐ Jardín               ☐ Cuarto de servicio
      ☐ Cerca de escuelas    ☐ Cerca de trabajo
      ☐ Área de juegos       ☐ Alberca
      ☐ Vigilancia 24h

PASO 20 — Comentarios adicionales
  └── "¿Algo más que quieras contarnos sobre lo que buscas?"
      [Textarea, opcional, máx. 300 caracteres]
      [Opción: "No, ya está todo" → omite]

──────────────────────────────────────────────────────────────
 CONFIRMACIÓN
──────────────────────────────────────────────────────────────

PASO 21 — Pantalla final
  └── "¡Listo, [Nombre]! Ya registramos tu perfil. 🎉
       El equipo de Viva Casa te contactará pronto con
       opciones que se adapten a ti."

       [Logo Viva Casa]
       [Botón: Compartir con un amigo]  ← Web Share API nativa
```

---

## 7. Modelo de Datos (Firestore)

```json
// Colección: leads
{
  "id": "auto-generated",
  "createdAt": "Timestamp",
  "status": "nuevo | contactado | calificado | descartado",

  // Contacto
  "nombre": "string",
  "whatsapp": "string",
  "email": "string | null",

  // Perfil personal
  "edad": "number",
  "estadoCivil": "soltero | casado | union_libre | divorciado | viudo",
  "dependientes": "ninguno | 1_2 | 3_mas",
  "domicilioActual": {
    "municipio": "string",
    "fraccionamiento": "string",
    "calle": "string"
  },

  // Situación laboral
  "situacionLaboral": "empleado_formal | empleado_informal | independiente | pensionado | sin_empleo",
  "empresa": "string | null",
  "ingresoMensual": "string | null",

  // Tipo de crédito
  "tipoCredito": "infonavit_tradicional | infonavit_total | cofinavit | unamos_creditos | segundo_credito | banco | recursos_propios",

  // Datos INFONAVIT (cualquier modalidad)
  "infonavit": {
    "nss": "string | null",
    "nssImageUrl": "string | null",      // URL en Firebase Storage
    "precalificacion": "string | null",
    "participantes": "pareja | familiar | amigo | entidad_bancaria | null"
  },

  // Datos bancarios
  "banco": {
    "bancoPreferencia": "string | null",
    "tieneEnganche": "listo | juntando | no_sabe | null"
  },

  // Recursos propios
  "recursosPropios": {
    "presupuesto": "string | null"
  },

  // Uso y preferencias
  "usoInmueble": "vivir | renta_tradicional | renta_vacacional",
  "zonasInteres": ["string"],
  "tipoInmueble": "fraccionamiento | colonia | departamento | indiferente",
  "caracteristicas": ["string"],
  "comentarios": "string | null",

  // Metadata
  "fuente": "facebook_marketplace | referido | otro"
}
```

---

## 8. Funcionalidades de la PWA

| Feature | Detalle |
|---------|---------|
| Accesible desde web | Sin instalación requerida, funciona en cualquier navegador moderno |
| Instalable (opcional) | manifest.json permite "Añadir a pantalla de inicio" en móvil |
| Offline básico | Service Worker cachea el formulario para carga rápida |
| Subida de fotos | Captura NSS por cámara o galería → Firebase Storage |
| Auto-guardado | Progreso guardado en `sessionStorage` para no perder datos si se cambia de app |
| Share API | Botón "Compartir formulario" usa Web Share API nativa del celular |
| Responsive | 100% mobile-first, funciona correctamente en desktop también |
| Marca Viva Casa | Logo, colores y tipografía propios de la empresa |

---

## 9. Notificación de Nuevos Leads (Email)

Se usará la extensión oficial de Firebase **"Trigger Email from Firestore"** con **Gmail SMTP** (gratuito hasta 500 emails/día).

**Flujo:**
1. El lead completa el formulario → se crea documento en Firestore.
2. Firebase detecta el nuevo documento y dispara automáticamente el envío de email.
3. El administrador recibe un email con el resumen del lead: nombre, WhatsApp, tipo de crédito, zona de interés y uso del inmueble.

**Ventajas:** sin código personalizado de backend, sin costo adicional, configuración en minutos.

---

## 10. Panel de Administración (MVP)

Ruta protegida en la misma app React (ej. `/admin`), acceso solo con login de Firebase Auth (email + contraseña).

### Funcionalidades del panel:

| Función | Detalle |
|---------|---------|
| Login | Pantalla de acceso con email + contraseña |
| Tabla de leads | Lista paginada con columnas: nombre, WhatsApp, tipo crédito, zona, uso, status, fecha |
| Filtros | Por tipo de crédito, zona de interés, uso del inmueble, status |
| Detalle del lead | Vista completa de todos los datos capturados del lead |
| Ver foto NSS | Imagen subida a Firebase Storage visible en el panel |
| Cambiar status | Dropdown: nuevo → contactado → calificado → descartado |
| Exportar CSV | Descarga de todos los leads filtrados en formato CSV |

---

## 11. Requerimientos No Funcionales

| Atributo | Criterio |
|----------|---------|
| Performance | Lighthouse PWA score ≥ 90 |
| Tiempo de carga | < 3 segundos en 4G |
| Accesibilidad | WCAG AA básico |
| Seguridad | Firestore rules: escritura pública (solo crear), lectura restringida a admin autenticado |
| Storage rules | Solo usuarios autenticados pueden leer imágenes; escritura pública con límite de tamaño (5 MB) |
| Compatibilidad | Chrome y Safari en iOS/Android, últimas 2 versiones |

---

## 12. Fases de Desarrollo

### Fase 1 — MVP (Prioridad alta)
- [ ] Setup proyecto React + Vite + Tailwind + Firebase
- [ ] Configurar PWA (manifest + service worker básico)
- [ ] Implementar formulario multi-paso completo con lógica condicional
- [ ] Subida de foto NSS a Firebase Storage
- [ ] Integración con Firestore (guardar leads)
- [ ] Configurar Firebase Extension "Trigger Email" con Gmail SMTP
- [ ] Panel de admin: login + tabla de leads + filtros + cambio de status
- [ ] Deploy en Firebase Hosting

### Fase 2 — Mejoras UX (Prioridad media)
- [ ] Animaciones entre pasos (Framer Motion)
- [ ] Auto-guardado en `sessionStorage`
- [ ] Validaciones en tiempo real con mensajes amigables
- [ ] Exportar leads a CSV desde el panel
- [ ] Vista de detalle completo del lead

### Fase 3 — Integraciones futuras (Prioridad baja)
- [ ] Notificación por WhatsApp al capturar lead (Twilio / Meta API)
- [ ] Sincronización con Google Sheets
- [ ] Notificaciones push en el celular del admin

---

## 13. Decisiones Confirmadas

| Tema | Decisión |
|------|----------|
| Acceso al formulario | Público (sin login) |
| Marca | Viva Casa |
| Multi-asesor | No (un solo administrador en v1) |
| Tracking de asesor | No |
| Notificación de leads | Email automático via Firebase Extension + Gmail |
| Plataforma | PWA web, sin app nativa |
| NSS | Input + opción de subir foto (opcional) |
| Uso inmueble | Campo requerido: vivir / renta tradicional / renta vacacional |

---

## 14. Referencias

- [Tipos de crédito INFONAVIT 2026 — El Siglo de Torreón](https://www.elsiglodetorreon.com.mx/noticia/2026/infonavit-2026-conoce-todos-los-tipos-de-credito-y-los-nuevos-requisitos-para-estrenar-casa.html)
- [Crédito Cofinavit 2026 — Cita INFONAVIT](https://citainfonavit.com.mx/credito-cofinavit/)
- [Crédito Corresidencial / Unamos Créditos — Alfa México](https://www.alfamexico.com/credito-corresidencial-infonavit-una-opcion-para-cumplir-el-sueno-de-la-vivienda/)
- [Real Estate Lead Capture Best Practices 2026 — EstatePass](https://www.estatepass.ai/tools/lead-form/guide/)
- [Multi-step forms: 14% higher completion rate — Gapsy Studio](https://gapsystudio.com/blog/forms-designing-best-practices/)
- [Progressive Disclosure UX — Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/)
