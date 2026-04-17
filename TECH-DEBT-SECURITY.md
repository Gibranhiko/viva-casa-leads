# Tech Debt — Seguridad
**Fecha:** 2026-04-16  
**Revisado por:** Claude Code  

---

## Resumen ejecutivo

El proyecto tiene una base sólida: Firestore rules con validación de campos, Storage con restricciones de tipo y tamaño, autenticación de admin via Firebase Auth, y anti-spam client-side. Los riesgos encontrados son principalmente de **abuso de costos** y **spam de datos**, no de exposición de datos de usuarios existentes (que están bien protegidos).

---

## SEC-001 — Storage permite escrituras sin autenticación
**Criticidad: 🔴 ALTA**

**Problema:** Las reglas de Storage permiten que cualquier persona en internet suba archivos sin estar autenticada. Solo valida tamaño (8 MB) y tipo MIME. La config de Firebase está embebida en el bundle del cliente — cualquiera puede extraerla y lanzar un script que suba miles de archivos.

```
# Actual — permite escritura anónima
match /seller-photos/{sellerId}/{filename} {
  allow write: if request.resource.size < 8 * 1024 * 1024
               && request.resource.contentType.matches('image/...');
}
```

**Riesgo:** Un atacante puede agotar el free tier de Storage en minutos, generando cargos inesperados.

**Fix:** Revisar si es viable pedir un token temporal firmado desde un Cloud Function antes de subir, o al menos reducir el límite de tamaño en las reglas a 1 MB (ya que el cliente comprime antes de subir).

**Workaround inmediato (sin refactor):** Cambiar el límite en `storage.rules` de 8 MB a 1.5 MB — el cliente ya comprime a ~200-400 KB, así que 1.5 MB es suficiente y reduce el daño potencial.

---

## SEC-002 — Firestore sin límites de tamaño en campos de texto
**Criticidad: 🟠 MEDIA**

**Problema:** Las reglas de `leads` y `seller-leads` solo validan `nombre` (< 200 chars) y `whatsapp` (== 10 chars). El resto de los campos (`comentarios`, `fraccionamiento`, `calle`, `fotoPaths`, etc.) no tienen restricciones de tamaño. Un bot podría enviar documentos con strings de megabytes o arrays con miles de entradas.

**Riesgo:** Documentos inflados aumentan el costo de lecturas (Firestore cobra por bytes leídos, mínimo 1 KB por documento).

**Fix sugerido:** Agregar validaciones en las reglas para los campos más vulnerables:
```
&& request.resource.data.comentarios is string
&& request.resource.data.comentarios.size() < 500
&& request.resource.data.fotoPaths is list
&& request.resource.data.fotoPaths.size() <= 5
```

---

## SEC-003 — Sin rate limiting en Firestore
**Criticidad: 🟠 MEDIA**

**Problema:** El rate limit de 60 segundos está en `localStorage` del navegador — trivialmente eludible borrando el storage, abriendo una pestaña de incógnito, o llamando directamente al SDK de Firebase.

**Riesgo:** Un script automatizado puede crear cientos de leads falsos en segundos, inflando la base de datos y mezclando señal con ruido.

**Fix:** Implementar un Cloud Function como intermediario del submit que valide y aplique rate limiting por IP. Alternativa más simple: App Check de Firebase, que verifica que las requests vienen de la app real (no de un script).

---

## SEC-004 — Email de admin hardcodeado en reglas
**Criticidad: 🟡 BAJA**

**Problema:** `gibranhiko@gmail.com` está escrito directamente en `firestore.rules` y `storage.rules`. Si el email cambia, las reglas dejan de funcionar y hay que hacer redeploy manualmente.

**Fix:** Usar Firebase Custom Claims en el token de auth en lugar del email. Se asigna el claim `admin: true` al usuario una sola vez via Admin SDK, y las reglas verifican `request.auth.token.admin == true`. Más robusto y no depende del email.

---

## SEC-005 — WhatsApp no validado como numérico
**Criticidad: 🟡 BAJA**

**Problema:** La regla de Firestore valida que `whatsapp.size() == 10` pero no que sean dígitos. Se pueden guardar strings como `aaaaaaaaaa` o `!!!!!!!!!!!`.

**Fix:** Agregar validación con regex en las reglas (Firestore CEL soporta `matches()`):
```
&& request.resource.data.whatsapp.matches('[0-9]{10}')
```

---

## SEC-006 — Honeypot y rate limit solo client-side
**Criticidad: 🟡 BAJA**

**Problema:** El honeypot (campo oculto) y el rate limit de 60s solo existen en el navegador. Un atacante que use el SDK de Firebase directamente los ignora por completo.

**Fix:** Ver SEC-003 (App Check o Cloud Function intermediario). El honeypot es útil contra bots básicos de formularios web, no contra atacantes que usen el SDK.

---

## Orden de atención sugerido

| Ticket | Descripción | Esfuerzo | Impacto |
|--------|-------------|----------|---------|
| SEC-001 | Reducir límite Storage a 1.5 MB | 5 min | Alto |
| SEC-002 | Validar tamaño de campos en Firestore rules | 30 min | Medio |
| SEC-005 | Validar whatsapp numérico en rules | 10 min | Bajo |
| SEC-003 | App Check o Cloud Function para rate limiting | 2-4 h | Alto |
| SEC-004 | Custom Claims en lugar de email hardcodeado | 1 h | Bajo |
