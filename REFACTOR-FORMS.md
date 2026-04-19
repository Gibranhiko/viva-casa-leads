# Refactor: Formularios mínimos para clientes

Reducir drásticamente los pasos del form para clientes.
Toda la información adicional se captura en el panel admin (modo edición).

---

## COMPRADOR

### B1 — Eliminar `edad` del store y del step de contacto
**Archivos:** `useFormStore.ts`, `StepContacto.tsx`
- Quitar el campo `edad` de `FormData` y del initial state
- Quitar el input de edad en `StepContacto` y su validación
- Verificar que `LeadDetailPage` (admin edit) siga teniendo el campo edad editable

---

### B2 — Simplificar `buildSteps` del comprador
**Archivo:** `useFormStore.ts`
- Nuevo flujo: `contacto → tipoCredito → [condicional] → zonas → comentarios`
- Quitar de `buildSteps`: `perfil`, `domicilio`, `situacionLaboral`, `ingreso`, `usoInmueble`, `busqueda`, `caracteristicas`
- Agregar nuevo step `zonas` al final (antes de comentarios)
- Actualizar tipo `StepId` removiendo los steps eliminados y agregando `'zonas'`
- La rama INFONAVIT sigue igual: `nss → precalificacion → zonas`
- La rama banco: `banco → zonas`
- La rama recursos propios: `presupuesto → zonas`
- La rama otro: directo a `zonas`

---

### B3 — Crear `StepZonas`
**Archivo nuevo:** `src/steps/StepZonas.tsx`
- Extraer solo la parte de zonas de interés del actual `StepBusqueda`
- Mismas opciones de zonas que hoy (Monterrey, San Pedro, Guadalupe, etc.)
- Sin tipo de inmueble (se queda solo en admin)
- Validar que al menos una zona esté seleccionada antes de avanzar

---

### B4 — Refactorizar `StepBanco`
**Archivo:** `src/steps/StepBanco.tsx`
**Archivo:** `useFormStore.ts`
- Reemplazar el step de enganche por campo de monto del crédito bancario
- Renombrar/reutilizar el campo `presupuesto` para el monto del crédito banco, O agregar campo nuevo `montoCredito: string | null` al store
- El step muestra: banco preference (chips igual que hoy) + input numérico "¿Cuánto te prestaría el banco aproximadamente?"
- Eliminar `StepEnganche` del flujo y de `FormShell`

---

### B5 — Limpiar `FormShell` del comprador
**Archivo:** `src/components/form/FormShell.tsx`
- Quitar imports: `StepPerfil`, `StepDomicilio`, `StepSituacionLaboral`, `StepIngreso`, `StepUsoInmueble`, `StepBusqueda`, `StepCaracteristicas`, `StepEnganche`
- Agregar import: `StepZonas`
- Actualizar `STEP_COMPONENTS` acorde

---

### B6 — Verificar admin comprador cubre campos eliminados
**Archivo:** `src/pages/admin/LeadDetailPage.tsx`
- Confirmar que el modo edición ya tiene: estadoCivil, dependientes, domicilio, situaciónLaboral, ingreso, usoInmueble, zonas, tipo inmueble, características, enganche
- Agregar cualquier campo faltante en el formulario de edición del admin
- No se elimina nada del store (los campos siguen existiendo, solo desaparecen del form cliente)

---

## VENDEDOR

### S1 — Eliminar `edad` del store y step de contacto vendedor
**Archivos:** `useSellerFormStore.ts`, `StepSellerContacto.tsx`
- Quitar `edad` de `SellerFormData` y del initial state
- Quitar el input de edad y su validación en `StepSellerContacto`

---

### S2 — Simplificar `buildSellerSteps`
**Archivo:** `useSellerFormStore.ts`
- Nuevo flujo fijo: `contacto → direccion → condicion → fotos → credito_urgencia → precio → comentarios`
- Quitar de `buildSellerSteps`: `tipo_propiedad`, `recamaras_banos`, `m2_antiguedad`, `ocupacion`, `servicios`, `predial_estado_civil`, `escrituras_propietarios`, `duenos_disponibles`, `cesion_infonavit`, `cancelacion_infonavit`
- La rama de crédito se maneja dentro del nuevo step `credito_urgencia` (no como steps separados)
- Actualizar tipo `SellerStepId` removiendo los steps eliminados y agregando `'seller_credito_urgencia'`

---

### S3 — Crear `StepSellerCreditoUrgencia`
**Archivo nuevo:** `src/steps/seller/StepSellerCreditoUrgencia.tsx`
- Primera sección: situación de crédito con opciones (libre / infonavit_activo / banco / infonavit_pagado / no_se)
- Si el usuario selecciona `infonavit_activo`, aparece en la misma pantalla la pregunta de urgencia (las 2 opciones del actual `StepSellerCesionInfonavit`)
- Si selecciona cualquier otra opción, avanza automáticamente
- Si selecciona `infonavit_activo` y ya eligió urgencia, mostrar botón Continuar

---

### S4 — Limpiar `SellerFormShell`
**Archivo:** `src/components/seller/SellerFormShell.tsx`
- Quitar imports eliminados: `StepSellerTipoPropiedad`, `StepSellerRecamarasBanos`, `StepSellerM2Antiguedad`, `StepSellerOcupacion`, `StepSellerServicios`, `StepSellerPredialEstadoCivil`, `StepSellerEscriturasPropiedad`, `StepSellerDuenosDisponibles`, `StepSellerCesionInfonavit`, `StepSellerCancelacionInfonavit`
- Agregar import: `StepSellerCreditoUrgencia`
- Actualizar `STEP_COMPONENTS` acorde

---

## ADMIN

### A1 — Expandir edición de vendedor en admin
**Archivos:** `src/pages/admin/SellerLeadDetailPage.tsx`, `src/lib/firestore.ts`

Agregar al modo edición del admin todos los campos que ya no captura el form cliente:

**Propiedad:**
- Tipo de propiedad (select: fracc privado / fracc abierto / departamento / terreno)
- Recámaras (select: 1 / 2 / 3 / 4+)
- Baños (select: 1 / 2 / 3+)
- M² de construcción (select: rangos)
- Antigüedad (select: rangos)
- Cuotas de condominio (select)

**Situación:**
- Ocupación (select: habitada / rentada / desocupada / invadida)
- Luz CFE (select: activo / adeudo / inactivo)
- Agua (select)
- Gas (select)
- Predial al corriente (select)

**Propietario:**
- Estado civil (select)
- Escrituras (select)
- Número de dueños (select)
- Disponibilidad de dueños (select, solo si pareja/varios)

**Crédito:**
- Cancelación INFONAVIT registrada (select, solo si infonavit_pagado)

Expandir `SellerLeadEditable` en `firestore.ts` para incluir todos estos campos, y `updateSellerLead` para persistirlos.

---

### A2 — Recalcular red flags al guardar desde admin
**Archivo:** `src/pages/admin/SellerLeadDetailPage.tsx`, `src/lib/firestore.ts`
- Al hacer `updateSellerLead` desde admin con campos nuevos, recalcular y guardar `redFlags` actualizado
- Mover / exportar `calcularRedFlags` para que sea usable desde el admin sin importar todo el store

---

## UX

### U1 — Mostrar conteo de pasos en ambos formularios
**Archivos:** `FormShell.tsx`, `SellerFormShell.tsx`
- Agregar texto tipo "Paso 2 de 5" junto a la barra de progreso
- Con menos steps el usuario verá inmediatamente que es un form corto
- En comprador: excluir el step `welcome` del conteo si aplica

---

## Orden sugerido de ejecución

1. B2 + B3 + B4 + B5 (core del flujo comprador)
2. B1 (quitar edad comprador)
3. B6 (verificar admin comprador)
4. S2 + S3 + S4 (core del flujo vendedor)
5. S1 (quitar edad vendedor)
6. A1 + A2 (expandir admin vendedor — el más largo)
7. U1 (conteo de pasos)
