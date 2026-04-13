# Tickets de Desarrollo — Viva Casa Leads

> Cada ticket es una unidad de trabajo independiente y entregable.  
> El orden dentro de cada épica es el orden recomendado de ejecución.
>
> **🤖 Claude** — lo ejecuto yo (código, comandos, archivos)  
> **🙋 Tú** — requiere tu intervención (navegador, cuenta Google, dispositivo físico)

---

## ÉPICA 0 — Setup y Configuración Base

### TKT-001 — Inicializar proyecto React + Vite + Tailwind
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Crear el proyecto base con todas las dependencias principales instaladas y configuradas.  
**Tareas:**
- 🤖 Crear proyecto con `npm create vite@latest` (template React + TypeScript)
- 🤖 Instalar y configurar Tailwind CSS v4
- 🤖 Instalar Framer Motion, Zustand, React Router v7
- 🤖 Configurar alias de paths en `vite.config.ts` (`@/` → `src/`)
- 🤖 Configurar `tsconfig.json` con paths
- 🤖 Crear estructura de carpetas del proyecto (ver ARCHITECTURE.md)

**Criterio de aceptación:** `npm run dev` levanta la app sin errores. Tailwind funciona con una clase de prueba.

---

### TKT-002 — Configurar Firebase en el proyecto
**Prioridad:** Alta  
**Quién lo hace:** 🙋 Tú (consola Firebase) + 🤖 Claude (código)  
**Descripción:** Crear el proyecto Firebase, habilitar los servicios necesarios y conectar el SDK al repo.  
**Tareas:**
- 🙋 Crear proyecto en [Firebase Console](https://console.firebase.google.com) con el nombre `viva-casa-leads`
- 🙋 Habilitar **Firestore** (modo producción)
- 🙋 Habilitar **Firebase Storage**
- 🙋 Habilitar **Firebase Authentication** (activar proveedor: Email/Password)
- 🙋 Habilitar **Firebase Hosting**
- 🙋 Copiar las credenciales del SDK (apiKey, authDomain, projectId, etc.) y pasármelas
- 🤖 Instalar `firebase` SDK en el proyecto (`npm install firebase`)
- 🤖 Crear `src/lib/firebase.ts` con la inicialización del SDK
- 🤖 Agregar variables de entorno en `.env.local` con las credenciales que me pases
- 🤖 Agregar `.env.local` al `.gitignore`

**Criterio de aceptación:** La app conecta con Firebase sin errores en consola.

---

### TKT-003 — Configurar PWA (manifest + service worker)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Convertir la app en PWA con carga rápida e instalable desde el navegador.  
**Tareas:**
- 🤖 Instalar y configurar `vite-plugin-pwa`
- 🤖 Crear `manifest.webmanifest` con nombre "Viva Casa", colores de marca, íconos
- 🤖 Configurar Workbox (`NetworkFirst` para la app, `CacheFirst` para assets estáticos)
- 🤖 Agregar meta tags de PWA en `index.html`
- 🤖 Verificar que el Service Worker se registra correctamente en build de producción

**Criterio de aceptación:** Chrome DevTools → Application → Manifest muestra los datos correctos. Score PWA en Lighthouse ≥ 90.

---

### TKT-004 — Configurar Firebase Extension: Trigger Email
**Prioridad:** Alta  
**Quién lo hace:** 🙋 Tú (consola Firebase + Google Account) + 🤖 Claude (plantilla HTML)  
**Descripción:** Configurar el envío automático de email al admin cuando llega un nuevo lead.  
**Tareas:**
- 🙋 Ir a Firebase Console → Extensions → instalar **"Trigger Email from Firestore"**
- 🙋 En tu cuenta Google, crear un **App Password** para Gmail (myaccount.google.com → Seguridad → Contraseñas de aplicaciones)
- 🙋 Configurar la extensión con: SMTP host `smtp.gmail.com`, puerto `587`, tu email y el App Password creado
- 🙋 Definir el email destino del administrador en la configuración de la extensión
- 🤖 Crear la plantilla HTML del email de notificación (resumen del lead: nombre, WhatsApp, tipo de crédito, zona, uso)
- 🤖 Integrar el disparo automático del email en `submitLead()` (crear documento en colección `mail`)
- 🙋 Probar enviando un lead de prueba y confirmar que el email llega

**Criterio de aceptación:** Al crear un lead, el admin recibe un email resumen en menos de 30 segundos.

---

### TKT-005 — Configurar Firestore + Storage Security Rules
**Prioridad:** Alta  
**Quién lo hace:** 🙋 Confirmar email del admin + 🤖 Claude completo  
**Descripción:** Definir y desplegar reglas de seguridad robustas para Firestore y Storage.  
**Tareas:**
- 🙋 Confirmarme el email exacto de la cuenta admin de Firebase (se hardcodea en las reglas)
- 🤖 Escribir `firestore.rules` con validación de campos en `create` (nombre, whatsapp), restricción de admin por email verificado, y `update` limitado a `['status', 'updatedAt']`
- 🤖 Escribir `storage.rules`: escritura pública con límite 5 MB, tipos imagen estrictos (`jpeg|png|webp|heic`), lectura solo admin con email verificado
- 🤖 Crear `firestore.indexes.json` con los 4 índices compuestos necesarios para los filtros del panel admin
- 🤖 Desplegar con `firebase deploy --only firestore:rules,firestore:indexes,storage`

> **Prerequisito:** Firebase CLI instalado y `firebase login` hecho.  
> 🙋 Instalar Firebase CLI y hacer login si aún no está hecho.

**Criterio de aceptación:** Usuario anónimo puede crear un lead con campos válidos pero no leerlo. Intentar crear sin `nombre` o `whatsapp` es rechazado por las reglas. Sin login no se pueden leer imágenes.

---

### TKT-006 — Deploy inicial en Firebase Hosting
**Prioridad:** Alta  
**Quién lo hace:** 🙋 Tú (login + init interactivo) + 🤖 Claude (config y deploy)  
**Descripción:** Configurar el pipeline de deploy y publicar la app para tener la URL lista.  
**Tareas:**
- 🙋 Ejecutar `firebase login` en la terminal (abre el navegador para autenticar tu cuenta Google)
- 🙋 Ejecutar `firebase init hosting` en la terminal y seleccionar el proyecto `viva-casa-leads` (es interactivo, te hago el paso a paso cuando lleguemos aquí)
- 🤖 Configurar `firebase.json` con `public: dist` y SPA rewrite (`"source": "**", "destination": "/index.html"`)
- 🤖 Agregar script `"deploy": "npm run build && firebase deploy --only hosting"` en `package.json`
- 🤖 Ejecutar el primer deploy

**Criterio de aceptación:** La URL de Firebase Hosting (`*.web.app`) carga la app correctamente.

---

## ÉPICA 1 — Formulario de Captura de Leads

### TKT-010 — Motor de formulario multi-paso (shell)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Estructura base del formulario: contenedor, navegación entre pasos, barra de progreso y store global.  
**Tareas:**
- 🤖 Crear store Zustand `useFormStore` con el estado completo del lead (ver modelo de datos en RFP)
- 🤖 Crear componente `<FormShell>` con barra de progreso animada, botones Atrás/Siguiente y lógica de navegación condicional
- 🤖 Guardar progreso en `sessionStorage` en cada cambio de paso
- 🤖 Recuperar progreso de `sessionStorage` al cargar la app

**Criterio de aceptación:** Se puede navegar hacia adelante y hacia atrás entre pasos. El estado persiste si se recarga la página.

---

### TKT-011 — Paso 1: Pantalla de bienvenida
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Primera pantalla con logo Viva Casa, mensaje de bienvenida y CTA.  
**Tareas:**
- 🤖 Crear componente `<StepWelcome>` con logo, texto y botón "Sí, empecemos →"
- 🤖 Animación de entrada (Framer Motion: fade + slide up)

> **Prerequisito:** 🙋 Proporcionarme el archivo del logo de Viva Casa (SVG o PNG).  
> Sin el logo, usaré un placeholder y lo reemplazamos cuando lo tengas.

**Criterio de aceptación:** La pantalla se ve correcta en móvil. El botón avanza al siguiente paso.

---

### TKT-012 — Bloque A: Datos de contacto (Pasos 2–4)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Capturar nombre completo, WhatsApp y email.  
**Tareas:**
- 🤖 Paso 2: Input "Nombre completo" — requerido, mínimo 3 caracteres
- 🤖 Paso 3: Input tel "WhatsApp" — requerido, prefijo +52, validación 10 dígitos
- 🤖 Paso 4: Input email — opcional, con botón "Prefiero no dar mi email" que guarda `null`
- 🤖 Validación en tiempo real, auto-focus, continuar con Enter

**Criterio de aceptación:** No avanza con nombre vacío ni WhatsApp inválido. Email vacío sí permite avanzar.

---

### TKT-013 — Bloque B: Perfil personal (Pasos 5–8)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Capturar edad, estado civil, dependientes y domicilio actual.  
**Tareas:**
- 🤖 Paso 5: Input numérico "Edad" — requerido, rango 18–80
- 🤖 Paso 6: Tarjetas "Estado civil" (5 opciones) — auto-avanza al seleccionar
- 🤖 Paso 7: Tarjetas "Dependientes económicos" (3 opciones) — auto-avanza
- 🤖 Paso 8: Tres inputs de texto libre (municipio, fraccionamiento/colonia, calle) — todos requeridos

**Criterio de aceptación:** Campos requeridos validados. Tarjetas de opción única avanzan solas al clic.

---

### TKT-014 — Bloque C: Situación laboral (Pasos 9–11)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Capturar situación laboral, empresa e ingreso mensual.  
**Tareas:**
- 🤖 Paso 9: Tarjetas "Situación laboral" (5 opciones) — auto-avanza
- 🤖 Paso 10 (condicional): Input "Empresa o giro" — omitido si eligió "Sin empleo"
- 🤖 Paso 11: Tarjetas "Ingreso mensual" (5 rangos + "Prefiero no decirlo")
- 🤖 Lógica de salto: sin empleo → ir directo de paso 9 a paso 11

**Criterio de aceptación:** El paso 10 se salta correctamente. El ingreso es seleccionable como "Prefiero no decirlo".

---

### TKT-015 — Bloque D: Tipo de crédito (Paso 12)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Selección del tipo de crédito con descripción de cada opción.  
**Tareas:**
- 🤖 7 tarjetas con ícono, nombre y descripción breve (Infonavit Tradicional, Infonavit Total, Cofinavit, Unamos Créditos, Segundo Crédito, Banco, Recursos propios)
- 🤖 Al seleccionar, avanza automáticamente a la rama correspondiente

**Criterio de aceptación:** La navegación ramifica correctamente según la opción elegida.

---

### TKT-016 — Rama A: Datos INFONAVIT (Pasos 13A–15A)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Pasos específicos para cualquier modalidad de INFONAVIT.  
**Tareas:**
- 🤖 Paso 13A: Input NSS (11 dígitos) + botón "Subir foto de mi NSS" (`<input type="file" capture="environment">`) + opción "No lo tengo"
- 🤖 Preview de imagen antes de continuar
- 🤖 Al iniciar el formulario (TKT-010), generar el `leadId` con `doc(collection(db, 'leads')).id` y guardarlo en el store — se usa en el path de Storage y al hacer `setDoc` en TKT-020
- 🤖 Subida de imagen a Firebase Storage en `nss-images/{leadId}/{timestamp}.jpg`, guardar URL en el store
- 🤖 Paso 14A: Tarjetas de precalificación (5 rangos) — auto-avanza
- 🤖 Paso 15A (solo para Total, Cofinavit y Unamos): Tarjetas "¿Quién más participa?" — auto-avanza

**Criterio de aceptación:** La foto sube correctamente a Storage. El paso 15A solo aparece para las modalidades que lo requieren.

---

### TKT-017 — Rama B: Datos bancarios (Pasos 13B–14B)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Tareas:**
- 🤖 Paso 13B: Tarjetas banco de preferencia (7 opciones) — auto-avanza
- 🤖 Paso 14B: Tarjetas enganche (3 opciones) — auto-avanza

**Criterio de aceptación:** Ambos pasos solo aparecen cuando el tipo de crédito es "banco".

---

### TKT-018 — Rama C: Recursos propios (Paso 13C)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Tareas:**
- 🤖 Paso 13C: Tarjetas de rango de presupuesto (5 opciones) — auto-avanza

**Criterio de aceptación:** El paso solo aparece cuando el tipo de crédito es "recursos_propios".

---

### TKT-019 — Bloque E: Uso y preferencias (Pasos 16–20)
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Tareas:**
- 🤖 Paso 16: Tarjetas uso del inmueble (Para vivir / Renta tradicional / Renta vacacional) — auto-avanza
- 🤖 Paso 17: Chips de selección múltiple con municipios del área metro + "Me da igual"
- 🤖 Paso 18: Tarjetas tipo de inmueble (4 opciones) — auto-avanza
- 🤖 Paso 19: Chips de selección múltiple con características (11 opciones)
- 🤖 Paso 20: Textarea opcional de comentarios (máx. 300 chars, con contador) + botón "No, ya está todo"

**Criterio de aceptación:** Chips múltiples funcionan correctamente. El textarea muestra contador. "No, ya está todo" avanza sin texto.

---

### TKT-020 — Envío del formulario a Firestore
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Al finalizar el último paso, guardar el lead en Firestore y mostrar confirmación.  
**Tareas:**
- 🤖 Función `submitLead()` que mapea el store al modelo de datos completo
- 🤖 Generar el ID del documento client-side con `const newRef = doc(collection(db, 'leads'))` **antes** de subir la foto NSS (el `newRef.id` se usa como `leadId` en el path de Storage)
- 🤖 Crear documento en `leads` con `setDoc(newRef, { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), status: 'nuevo', fuente: 'facebook_marketplace' })`
- 🤖 **NO crear documento en `/mail` desde el cliente** — el email lo dispara la Cloud Function del TKT-021
- 🤖 Manejo de estado de carga (spinner) y error (mensaje amigable + retry)
- 🤖 Al éxito: navegar a `/confirmation`, limpiar `sessionStorage`
- 🤖 Pantalla de confirmación con logo, nombre del usuario y botón Web Share API

**Criterio de aceptación:** El lead aparece en Firestore Console con todos los campos. El email llega al admin (via Cloud Function). La pantalla de confirmación muestra el nombre del usuario.

---

---

### TKT-007 — Configurar Firebase Emulator Suite
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Configurar emuladores locales para Firestore, Storage, Auth y Functions para desarrollar sin afectar producción.  
**Tareas:**
- 🤖 Agregar configuración de emuladores en `firebase.json` (puertos: Firestore 8080, Auth 9099, Storage 9199, Functions 5001)
- 🤖 Agregar `connectFirestoreEmulator`, `connectAuthEmulator`, `connectStorageEmulator` en `src/lib/firebase.ts` condicionados a `import.meta.env.DEV`
- 🤖 Agregar script `"emulators": "firebase emulators:start --import=./emulator-data --export-on-exit"` en `package.json`
- 🤖 Agregar `emulator-data/` al `.gitignore`

**Criterio de aceptación:** `npm run emulators` levanta todos los servicios. La app en `npm run dev` conecta a los emuladores automáticamente.

---

## ÉPICA 2 — Panel de Administración

### TKT-030 — Ruta protegida y pantalla de login
**Prioridad:** Alta  
**Quién lo hace:** 🙋 Tú (crear cuenta admin en consola) + 🤖 Claude (código)  
**Tareas:**
- 🤖 Crear componente `<ProtectedRoute>` que redirige a `/admin/login` si no hay sesión activa
- 🤖 Pantalla de login: email + contraseña, manejo de errores
- 🤖 Hook `useAuth` con `onAuthStateChanged`
- 🤖 Botón "Cerrar sesión" en el header del panel
- 🙋 Crear la cuenta del administrador en Firebase Console → Authentication → Users → "Add user" (email + contraseña que tú elijas)

**Criterio de aceptación:** Sin login, `/admin` redirige al login. Con credenciales correctas, accede al panel.

---

### TKT-031 — Tabla de leads con filtros
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Tareas:**
- 🤖 Query a Firestore `leads` ordenado por `createdAt` desc
- 🤖 Tabla con columnas: Nombre, WhatsApp, Tipo de crédito, Zonas, Uso, Status, Fecha
- 🤖 Filtros: tipo de crédito, zona, uso del inmueble, status
- 🤖 Paginación (25 leads por página)
- 🤖 Badge de color por status
- 🤖 Click en fila → detalle del lead

**Criterio de aceptación:** Filtros reducen correctamente los resultados. Paginación funciona con más de 25 leads.

---

### TKT-032 — Vista de detalle del lead
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Tareas:**
- 🤖 Mostrar todos los campos organizados en secciones (Contacto, Perfil, Laboral, Crédito, Preferencias)
- 🤖 Mostrar imagen del NSS si existe (preview desde Firebase Storage)
- 🤖 Dropdown para cambiar status (actualiza Firestore en tiempo real)
- 🤖 Botón "Abrir WhatsApp" → `https://wa.me/52{whatsapp}`
- 🤖 Botón "Enviar email" → `mailto:{email}`

**Criterio de aceptación:** Cambiar el status actualiza inmediatamente en la tabla. El enlace de WhatsApp abre correctamente.

---

### TKT-033 — Exportar leads a CSV
**Prioridad:** Media  
**Quién lo hace:** 🤖 Claude completo  
**Tareas:**
- 🤖 Función `exportToCSV(leads[])` con todos los campos del modelo
- 🤖 Descarga con `URL.createObjectURL` + `<a download>`
- 🤖 Nombre del archivo: `viva-casa-leads-YYYY-MM-DD.csv`
- 🤖 Solo exporta los leads con los filtros activos

**Criterio de aceptación:** CSV se descarga con todos los campos. Filtros aplicados se reflejan en la exportación.

---

### TKT-021 — Cloud Function: trigger email al crear lead
**Prioridad:** Alta  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Cloud Function `onCreate` en `/leads` que crea el documento en `/mail` con Admin SDK, eliminando la necesidad de que el cliente toque la colección `mail` (y evitando el riesgo de spam de emails desde el cliente).  
**Tareas:**
- 🤖 Inicializar Firebase Functions en el proyecto (`firebase init functions` con TypeScript)
- 🤖 Crear función `onLeadCreated` con `onDocumentCreated('/leads/{leadId}', ...)` que construye el HTML del email y crea el doc en `/mail`
- 🤖 Plantilla HTML del email: nombre, WhatsApp, tipo de crédito, zona, uso del inmueble, link al panel admin
- 🤖 Deploy: `firebase deploy --only functions`

> **Prerequisito:** TKT-004 (Firebase Extension Trigger Email instalada y configurada).

**Criterio de aceptación:** Al crear un lead en Firestore (sin que el cliente toque `/mail`), el admin recibe el email en menos de 30 segundos.

---

### TKT-034 — Búsqueda por nombre o WhatsApp en panel admin
**Prioridad:** Media  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Campo de búsqueda en el panel admin para encontrar leads por nombre o WhatsApp. Dado que Firestore no soporta full-text search, la búsqueda se hace client-side sobre los resultados ya cargados.  
**Tareas:**
- 🤖 Input de búsqueda en el header del panel admin (debounce 300ms)
- 🤖 Filtrado client-side sobre el array de leads cargado (nombre o whatsapp contiene el texto)
- 🤖 Limpiar búsqueda al aplicar filtros de Firestore

**Criterio de aceptación:** Escribir un nombre parcial filtra la tabla en tiempo real.

---

## ÉPICA 3 — UX y Pulido

### TKT-040 — Animaciones entre pasos
**Prioridad:** Media  
**Quién lo hace:** 🤖 Claude completo  
**Tareas:**
- 🤖 Slide horizontal entre pasos (siguiente = slide izquierda, atrás = slide derecha)
- 🤖 Fill animado de la barra de progreso
- 🤖 Micro-animación en tarjetas al seleccionar (scale + cambio de color)
- 🤖 Animación de entrada en pantalla de confirmación (check animado)

**Criterio de aceptación:** Transiciones fluidas a 60fps en celular de gama media.

---

### TKT-041 — Diseño visual con marca Viva Casa
**Prioridad:** Media  
**Quién lo hace:** 🙋 Tú (proveer assets) + 🤖 Claude (implementar)  
**Tareas:**
- 🙋 Proporcionar colores de la marca Viva Casa (hexadecimales o referencia visual)
- 🙋 Proporcionar logo en SVG o PNG de alta resolución
- 🙋 Proporcionar tipografía si hay una definida (o se elige una de Google Fonts)
- 🤖 Configurar paleta en `tailwind.config.ts`
- 🤖 Integrar logo en formulario, confirmación y panel admin
- 🤖 Diseñar estados de tarjetas (default, hover, selected)
- 🤖 Diseñar barra de progreso y botones con la identidad visual
- 🤖 Generar íconos PWA en todos los tamaños a partir del logo

**Criterio de aceptación:** El formulario tiene apariencia coherente y profesional con la marca.

---

### TKT-042 — Optimización de performance
**Prioridad:** Media  
**Quién lo hace:** 🤖 Claude completo  
**Tareas:**
- 🤖 Lazy loading de componentes de cada paso con `React.lazy`
- 🤖 Optimizar imágenes del manifest (WebP + múltiples tamaños)
- 🤖 Revisar y ajustar caché del Service Worker
- 🤖 Ejecutar Lighthouse y corregir issues hasta ≥ 90 en PWA y Performance

**Criterio de aceptación:** Lighthouse ≥ 90 en PWA. Carga < 3s en simulación 4G.

---

### TKT-043 — Anti-spam: honeypot + límite de envíos
**Prioridad:** Media  
**Quién lo hace:** 🤖 Claude completo  
**Descripción:** Protección básica contra bots y envíos masivos de leads falsos.  
**Tareas:**
- 🤖 Agregar campo honeypot oculto (`display: none`) en el formulario — si viene con valor, rechazar el submit client-side
- 🤖 Guardar timestamp del último envío en `localStorage` y bloquear reenvíos en menos de 60 segundos
- 🤖 Deshabilitar el botón de submit durante el envío y mostrarlo como "Enviando..." para evitar doble click

**Criterio de aceptación:** Un bot que llena todos los campos (incluyendo honeypot) no puede enviar el formulario. Un usuario no puede enviar dos leads en menos de 60 segundos.

---

## ÉPICA 4 — QA y Lanzamiento

### TKT-050 — Pruebas en dispositivos reales
**Prioridad:** Alta  
**Quién lo hace:** 🙋 Tú completo (pruebas manuales en tus dispositivos)  
**Tareas:**
- 🙋 Probar el formulario completo en Chrome Android
- 🙋 Probar el formulario completo en Safari iOS
- 🙋 Probar subida de foto NSS desde cámara y desde galería (en ambos sistemas)
- 🙋 Probar el botón Web Share API
- 🙋 Verificar que el email de notificación llega correctamente
- 🙋 Verificar que el admin puede ver, filtrar y actualizar leads desde el panel
- 🙋 Reportarme cualquier bug encontrado para corregirlo

**Criterio de aceptación:** Cero errores críticos en los dispositivos probados.

---

### TKT-051 — Deploy a producción y configuración final
**Prioridad:** Alta  
**Quién lo hace:** 🙋 Tú (dominio y credenciales) + 🤖 Claude (deploy y verificación técnica)  
**Tareas:**
- 🤖 Ejecutar `firebase deploy` (hosting + rules)
- 🤖 Verificar Firestore Security Rules en producción
- 🤖 Verificar Storage Security Rules en producción
- 🙋 Configurar dominio personalizado en Firebase Hosting (opcional — se hace en la consola de Firebase + panel de tu proveedor de dominio)
- 🙋 Guardar en lugar seguro la URL final y las credenciales del admin

**Criterio de aceptación:** App publicada y accesible. Admin puede hacer login. Se reciben emails al enviar un lead de prueba.

---

## Resumen de Tickets

| ID | Épica | Descripción | Prioridad | Quién |
|----|-------|-------------|-----------|-------|
| TKT-001 | Setup | Inicializar proyecto React + Vite + Tailwind | Alta | 🤖 |
| TKT-002 | Setup | Configurar Firebase | Alta | 🙋 + 🤖 |
| TKT-003 | Setup | Configurar PWA | Alta | 🤖 |
| TKT-004 | Setup | Firebase Extension: Trigger Email | Alta | 🙋 + 🤖 |
| TKT-005 | Setup | Firestore + Storage Security Rules + Indexes | Alta | 🙋 + 🤖 |
| TKT-006 | Setup | Deploy inicial Firebase Hosting | Alta | 🙋 + 🤖 |
| TKT-007 | Setup | Firebase Emulator Suite | Alta | 🤖 |
| TKT-010 | Formulario | Motor multi-paso + store Zustand | Alta | 🤖 |
| TKT-011 | Formulario | Paso 1: Bienvenida | Alta | 🤖 |
| TKT-012 | Formulario | Bloque A: Datos de contacto | Alta | 🤖 |
| TKT-013 | Formulario | Bloque B: Perfil personal | Alta | 🤖 |
| TKT-014 | Formulario | Bloque C: Situación laboral | Alta | 🤖 |
| TKT-015 | Formulario | Bloque D: Tipo de crédito | Alta | 🤖 |
| TKT-016 | Formulario | Rama A: Datos INFONAVIT | Alta | 🤖 |
| TKT-017 | Formulario | Rama B: Datos bancarios | Alta | 🤖 |
| TKT-018 | Formulario | Rama C: Recursos propios | Alta | 🤖 |
| TKT-019 | Formulario | Bloque E: Uso y preferencias | Alta | 🤖 |
| TKT-020 | Formulario | Envío a Firestore | Alta | 🤖 |
| TKT-021 | Admin | Cloud Function: trigger email al crear lead | Alta | 🤖 |
| TKT-030 | Admin | Login y ruta protegida | Alta | 🙋 + 🤖 |
| TKT-031 | Admin | Tabla de leads con filtros | Alta | 🤖 |
| TKT-032 | Admin | Vista de detalle del lead | Alta | 🤖 |
| TKT-033 | Admin | Exportar CSV | Media | 🤖 |
| TKT-034 | Admin | Búsqueda por nombre / WhatsApp | Media | 🤖 |
| TKT-040 | UX | Animaciones entre pasos | Media | 🤖 |
| TKT-041 | UX | Diseño visual Viva Casa | Media | 🙋 + 🤖 |
| TKT-042 | UX | Optimización de performance | Media | 🤖 |
| TKT-043 | UX | Anti-spam: honeypot + límite de envíos | Media | 🤖 |
| TKT-050 | QA | Pruebas en dispositivos reales | Alta | 🙋 |
| TKT-051 | QA | Deploy a producción | Alta | 🙋 + 🤖 |
