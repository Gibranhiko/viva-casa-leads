# Arquitectura y Stack Técnico — Viva Casa Leads

---

## 1. Visión General

```
┌─────────────────────────────────────────────────────────────┐
│                        USUARIOS                             │
│                                                             │
│   Lead (celular/desktop)          Administrador             │
│   Accede por URL pública          Accede por /admin         │
└────────────────┬────────────────────────┬───────────────────┘
                 │                        │
                 ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  FIREBASE HOSTING                           │
│           React SPA (PWA) — dominio único                   │
│                                                             │
│  ┌─────────────────────┐   ┌──────────────────────────┐    │
│  │   FORMULARIO        │   │   PANEL ADMIN (/admin)   │    │
│  │   (ruta pública)    │   │   (ruta protegida)       │    │
│  │                     │   │                          │    │
│  │  Multi-paso         │   │  Login Firebase Auth     │    │
│  │  Lógica condicional │   │  Tabla de leads          │    │
│  │  Animaciones        │   │  Filtros + detalle       │    │
│  │  Subida de foto NSS │   │  Cambio de status        │    │
│  └────────┬────────────┘   │  Exportar CSV            │    │
│           │                └────────────┬─────────────┘    │
└───────────┼─────────────────────────────┼─────────────────┘
            │                             │
            ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    FIREBASE BACKEND                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Firestore   │  │   Storage    │  │  Authentication  │  │
│  │              │  │              │  │                  │  │
│  │  /leads      │  │  /nss-images │  │  Email/Password  │  │
│  │  /mail       │  │              │  │  (solo admin)    │  │
│  └──────┬───────┘  └──────────────┘  └──────────────────┘  │
│         │                                                   │
│         │ onCreate trigger                                  │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────┐          │
│  │  Firebase Extension: Trigger Email           │          │
│  │  Gmail SMTP → email al admin                 │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológico

### Frontend

| Tecnología | Versión | Rol |
|-----------|---------|-----|
| React | 18+ | UI library principal |
| TypeScript | 5+ | Tipado estático |
| Vite | 6+ | Build tool y dev server |
| Tailwind CSS | 4+ | Estilos utility-first |
| Framer Motion | 11+ | Animaciones entre pasos y micro-interacciones |
| Zustand | 5+ | Estado global del formulario |
| React Router | 7+ | Navegación SPA (`/` formulario, `/admin` panel) |
| vite-plugin-pwa | latest | Genera Service Worker y manifest PWA |

### Firebase

| Servicio | Uso |
|---------|-----|
| Firestore | Base de datos principal (leads, cola de emails) |
| Firebase Storage | Almacenamiento de fotos del NSS |
| Firebase Authentication | Login del administrador (Email/Password) |
| Firebase Hosting | Hosting del SPA con SSL incluido |
| Firebase Extension: Trigger Email | Envío automático de email al crear un lead |

### Herramientas de Desarrollo

| Herramienta | Uso |
|------------|-----|
| Firebase CLI | Deploy, reglas, emuladores |
| Firebase Emulator Suite | Desarrollo local sin afectar producción |
| ESLint + Prettier | Calidad y formato de código |

---

## 3. Estructura de Carpetas

```
viva-casa-leads/
├── public/
│   ├── icons/               # Íconos PWA (192x192, 512x512, etc.)
│   └── favicon.ico
│
├── src/
│   ├── assets/              # Logo Viva Casa, imágenes estáticas
│   │
│   ├── components/          # Componentes reutilizables
│   │   ├── ui/              # Componentes genéricos (Button, Card, Input, Badge, etc.)
│   │   └── form/            # Componentes específicos del formulario
│   │       ├── FormShell.tsx         # Contenedor principal, barra de progreso, navegación
│   │       ├── StepCard.tsx          # Tarjeta de opción única (auto-avanza al seleccionar)
│   │       ├── MultiChip.tsx         # Selector de opciones múltiples
│   │       ├── ImageUploader.tsx     # Captura/subida de foto NSS
│   │       └── ProgressBar.tsx       # Barra de progreso animada
│   │
│   ├── pages/
│   │   ├── FormPage.tsx              # Página pública del formulario
│   │   ├── ConfirmationPage.tsx      # Pantalla de éxito tras enviar
│   │   └── admin/
│   │       ├── LoginPage.tsx         # Login del administrador
│   │       ├── LeadsPage.tsx         # Tabla principal de leads
│   │       └── LeadDetailPage.tsx    # Detalle de un lead específico
│   │
│   ├── steps/               # Un componente por cada paso del formulario
│   │   ├── StepWelcome.tsx
│   │   ├── StepNombre.tsx
│   │   ├── StepWhatsapp.tsx
│   │   ├── StepEmail.tsx
│   │   ├── StepEdad.tsx
│   │   ├── StepEstadoCivil.tsx
│   │   ├── StepDependientes.tsx
│   │   ├── StepDomicilio.tsx
│   │   ├── StepSituacionLaboral.tsx
│   │   ├── StepEmpresa.tsx
│   │   ├── StepIngreso.tsx
│   │   ├── StepTipoCredito.tsx
│   │   ├── StepNSS.tsx
│   │   ├── StepPrecalificacion.tsx
│   │   ├── StepParticipantes.tsx
│   │   ├── StepBanco.tsx
│   │   ├── StepEnganche.tsx
│   │   ├── StepPresupuesto.tsx
│   │   ├── StepUsoInmueble.tsx
│   │   ├── StepZonas.tsx
│   │   ├── StepTipoInmueble.tsx
│   │   ├── StepCaracteristicas.tsx
│   │   └── StepComentarios.tsx
│   │
│   ├── store/
│   │   ├── useFormStore.ts   # Estado global del formulario (Zustand)
│   │   └── useAuthStore.ts   # Estado de autenticación (Zustand)
│   │
│   ├── lib/
│   │   ├── firebase.ts       # Inicialización del SDK de Firebase
│   │   ├── firestore.ts      # Funciones CRUD (submitLead, getLeads, updateLeadStatus)
│   │   ├── storage.ts        # Función uploadNssImage
│   │   └── exportCsv.ts      # Función exportToCSV
│   │
│   ├── hooks/
│   │   ├── useAuth.ts        # onAuthStateChanged listener
│   │   └── useLeads.ts       # Query y suscripción a leads de Firestore
│   │
│   ├── router/
│   │   └── index.tsx         # Definición de rutas, ProtectedRoute
│   │
│   ├── types/
│   │   └── lead.ts           # Tipos TypeScript del modelo Lead
│   │
│   ├── App.tsx
│   └── main.tsx
│
├── firestore.rules            # Reglas de seguridad Firestore
├── storage.rules              # Reglas de seguridad Storage
├── firebase.json              # Configuración Firebase CLI
├── .firebaserc                # Alias del proyecto Firebase
├── .env.local                 # Variables de entorno (gitignored)
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── RFP.md
├── TICKETS.md
└── ARCHITECTURE.md
```

---

## 4. Modelo de Datos Firestore

### Colección: `leads`

```typescript
interface Lead {
  id: string;                    // auto-generado por Firestore
  createdAt: Timestamp;
  updatedAt: Timestamp;           // actualizar en cada cambio de status
  status: 'nuevo' | 'contactado' | 'calificado' | 'descartado';

  // Contacto
  nombre: string;
  whatsapp: string;
  email: string | null;

  // Perfil personal
  edad: number;
  estadoCivil: 'soltero' | 'casado' | 'union_libre' | 'divorciado' | 'viudo';
  dependientes: 'ninguno' | '1_2' | '3_mas';
  domicilioActual: {
    municipio: string;
    fraccionamiento: string;
    calle: string;
  };

  // Situación laboral
  situacionLaboral: 'empleado_formal' | 'empleado_informal' | 'independiente' | 'pensionado' | 'sin_empleo';
  empresa: string | null;
  ingresoMensual: string | null;

  // Tipo de crédito
  tipoCredito: 'infonavit_tradicional' | 'infonavit_total' | 'cofinavit' | 'unamos_creditos' | 'segundo_credito' | 'banco' | 'recursos_propios';

  // Datos INFONAVIT (aplica a cualquier modalidad Infonavit)
  infonavit?: {
    nss: string | null;
    nssImageUrl: string | null;    // URL en Firebase Storage
    precalificacion: string | null;
    participantes: 'pareja' | 'familiar' | 'amigo' | 'entidad_bancaria' | null;
  };

  // Datos bancarios
  banco?: {
    bancoPreferencia: string | null;
    tieneEnganche: 'listo' | 'juntando' | 'no_sabe' | null;
  };

  // Recursos propios
  recursosPropios?: {
    presupuesto: string | null;
  };

  // Uso y preferencias
  usoInmueble: 'vivir' | 'renta_tradicional' | 'renta_vacacional';
  zonasInteres: string[];
  tipoInmueble: 'fraccionamiento' | 'colonia' | 'departamento' | 'indiferente';
  caracteristicas: string[];
  comentarios: string | null;

  // Metadata
  fuente: 'facebook_marketplace' | 'referido' | 'otro';  // default: 'facebook_marketplace' en submitLead()
}
```

### Colección: `mail` (usada por Firebase Extension)

```typescript
// Creada automáticamente por el trigger al guardar un lead
interface Mail {
  to: string;          // email del admin
  message: {
    subject: string;
    html: string;      // HTML con resumen del lead
  };
}
```

---

## 5. Flujo de Navegación del Formulario

```
/  (FormPage)
   └── <FormShell>
          │
          ├── StepWelcome
          ├── StepNombre
          ├── StepWhatsapp
          ├── StepEmail
          ├── StepEdad
          ├── StepEstadoCivil
          ├── StepDependientes
          ├── StepDomicilio
          ├── StepSituacionLaboral
          ├── StepEmpresa  ─────────── (OMITIR si situacionLaboral === 'sin_empleo')
          ├── StepIngreso
          ├── StepTipoCredito
          │
          ├── [INFONAVIT] ──────────── (si tipoCredito ∈ infonavit_*)
          │     ├── StepNSS
          │     ├── StepPrecalificacion
          │     └── StepParticipantes  (OMITIR si tipoCredito === 'infonavit_tradicional' o 'segundo_credito')
          │
          ├── [BANCO] ──────────────── (si tipoCredito === 'banco')
          │     ├── StepBanco
          │     └── StepEnganche
          │
          ├── [RECURSOS PROPIOS] ───── (si tipoCredito === 'recursos_propios')
          │     └── StepPresupuesto
          │
          ├── StepUsoInmueble  ─────── (todos)
          ├── StepZonas
          ├── StepTipoInmueble
          ├── StepCaracteristicas
          └── StepComentarios
                │
                └── submitLead() → Firestore
                      └── /confirmation
```

---

## 6. Flujo de Administración

```
/admin/login
   └── Firebase Auth (signInWithEmailAndPassword)
          │
          ▼
/admin  (LeadsPage)
   ├── useLeads() → query Firestore /leads (orden: createdAt desc)
   ├── Filtros: tipoCredito, zona, usoInmueble, status
   ├── Tabla de resultados paginada
   ├── Botón "Exportar CSV" → exportToCSV(leadsActuales)
   └── Click en fila → LeadDetailPage
          ├── Datos completos del lead
          ├── Imagen NSS (Firebase Storage URL)
          ├── Dropdown cambio de status → updateLeadStatus()
          ├── Botón "Abrir WhatsApp" → wa.me/52{whatsapp}
          └── Botón "Enviar email" → mailto:{email}
```

---

## 7. Flujo de Notificación de Email

```
Usuario envía formulario
      │
      ▼
submitLead() crea documento en Firestore /leads
      │
      ▼ (Firebase Extension detecta onCreate)
Extension "Trigger Email" crea documento en /mail
      │
      ▼
Gmail SMTP envía email al admin
      │
      ▼
Admin recibe resumen del lead en su correo
```

---

## 8. Seguridad

### Firestore Rules

> **Nota de arquitectura — colección `/mail`:** El frontend NO crea documentos en `/mail`.
> En su lugar, una **Cloud Function** (`onCreate` en `/leads`) lo hace via Admin SDK.
> Esto evita que clientes maliciosos inyecten emails arbitrarios y permite que la regla
> `if false` en `/mail` sea real. Ver TKT-021.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Función helper: verifica que el usuario es el admin configurado
    function isAdmin() {
      return request.auth != null
          && request.auth.token.email == 'ADMIN_EMAIL_AQUI'
          && request.auth.token.email_verified == true;
    }

    // Leads: crear público con validación básica, leer/editar solo admin
    match /leads/{leadId} {
      allow create: if request.resource.data.nombre is string
                   && request.resource.data.nombre.size() > 0
                   && request.resource.data.nombre.size() < 200
                   && request.resource.data.whatsapp is string
                   && request.resource.data.whatsapp.size() == 10;
      allow read: if isAdmin();
      allow update: if isAdmin()
                   && request.resource.data.diff(resource.data).affectedKeys()
                      .hasOnly(['status', 'updatedAt']); // admin solo puede cambiar status
      allow delete: if false;
    }

    // Mail: solo Admin SDK (Cloud Function) puede escribir — clientes bloqueados
    match /mail/{mailId} {
      allow read, write: if false;
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Imágenes NSS: escritura pública con restricciones, lectura solo admin
    // Path: nss-images/{leadId}/{filename}
    // Nota: el leadId debe generarse ANTES de la subida (usar doc() client-side)
    match /nss-images/{leadId}/{filename} {
      allow write: if request.resource.size < 5 * 1024 * 1024
                   && request.resource.contentType.matches('image/(jpeg|png|webp|heic)')
                   && filename.matches('[a-zA-Z0-9_\\-]+\\.(jpg|jpeg|png|webp|heic)');
      allow read: if request.auth != null
                 && request.auth.token.email_verified == true;
    }
  }
}
```

> **Nota sobre el leadId en Storage:** El `leadId` debe generarse client-side con
> `const newRef = doc(collection(db, 'leads'))` antes de subir la imagen. Así se usa
> `newRef.id` en el path de Storage y en el `addDoc` posterior. Ver TKT-016.

---

## 9. Índices Compuestos de Firestore

Los filtros del panel admin requieren índices compuestos. Definir en `firestore.indexes.json`:

| Colección | Campos | Orden |
|-----------|--------|-------|
| `leads` | `status` ASC, `createdAt` DESC | Filtro por status |
| `leads` | `tipoCredito` ASC, `createdAt` DESC | Filtro por crédito |
| `leads` | `usoInmueble` ASC, `createdAt` DESC | Filtro por uso |
| `leads` | `status` ASC, `tipoCredito` ASC, `createdAt` DESC | Filtros combinados |

```json
// firestore.indexes.json
{
  "indexes": [
    { "collectionGroup": "leads", "queryScope": "COLLECTION",
      "fields": [{"fieldPath": "status","order": "ASCENDING"}, {"fieldPath": "createdAt","order": "DESCENDING"}] },
    { "collectionGroup": "leads", "queryScope": "COLLECTION",
      "fields": [{"fieldPath": "tipoCredito","order": "ASCENDING"}, {"fieldPath": "createdAt","order": "DESCENDING"}] },
    { "collectionGroup": "leads", "queryScope": "COLLECTION",
      "fields": [{"fieldPath": "usoInmueble","order": "ASCENDING"}, {"fieldPath": "createdAt","order": "DESCENDING"}] },
    { "collectionGroup": "leads", "queryScope": "COLLECTION",
      "fields": [{"fieldPath": "status","order": "ASCENDING"}, {"fieldPath": "tipoCredito","order": "ASCENDING"}, {"fieldPath": "createdAt","order": "DESCENDING"}] }
  ],
  "fieldOverrides": []
}
```

---

## 10. Variables de Entorno

```bash
# .env.local — NO subir a git
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

---

## 11. Comandos Principales

```bash
# Desarrollo local (con emuladores Firebase)
npm run dev
firebase emulators:start

# Build de producción
npm run build

# Deploy completo (hosting + rules)
firebase deploy

# Deploy solo hosting
firebase deploy --only hosting

# Deploy solo reglas
firebase deploy --only firestore:rules,storage
```
