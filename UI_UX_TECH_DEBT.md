# UI/UX Tech Debt — Viva Casa Leads

Generated from ui-ux-pro-max assessment · 2026-04-17

---

## How to use this document

Each item has a priority, effort estimate, and acceptance criteria. Work top-down within each priority tier. Check the box when done and note the date.

---

## Critical

### TD-001 — Add accessible labels to all form inputs
- **File(s):** `src/components/form/StepLayout.tsx`, all `src/steps/*.tsx` and `src/steps/seller/*.tsx`
- **Problem:** Every step uses placeholder-only inputs. When the user starts typing the placeholder disappears and there is no persistent label. Screen readers cannot announce what the field is. WCAG Level A failure.
- **Fix:** Add a visible `<label>` above each input, or use `aria-label` / `aria-labelledby` at minimum.
- **Effort:** Medium (touches every step file)
- **AC:** Each input has an associated label. Running axe DevTools on any step reports zero label violations.
- [ ] Done — ___________

---

### TD-002 — Replace emoji icons with SVG icons
- **File(s):** `src/steps/StepWelcome.tsx` (🏠 🏷️), `src/pages/admin/SellerLeadDetailPage.tsx` (💬 ✉️), `src/components/admin/ConfirmDeleteModal.tsx` (if any)
- **Problem:** Emojis render differently across platforms and OS versions, cannot be styled or themed, and look inconsistent on some Android devices.
- **Fix:** Install `lucide-react` (already common in Tailwind projects) and replace each emoji with the equivalent SVG icon component. Suggested: `Home`, `Tag`, `MessageCircle`, `Mail` from Lucide.
- **Effort:** Small
- **AC:** No emoji characters used as UI icons anywhere in the app. Icons scale and color correctly in all modern browsers.
- [ ] Done — ___________

---

### TD-003 — Replace `min-h-screen` with `min-h-dvh` on full-screen views
- **File(s):** `src/steps/StepWelcome.tsx`, `src/pages/ConfirmationPage.tsx`, `src/pages/SellerConfirmationPage.tsx`, `src/components/form/FormShell.tsx`
- **Problem:** `min-h-screen` maps to `100vh`. On iOS Safari and Android Chrome the browser address bar eats into `100vh`, causing content to be cut off or the continue button to sit behind the browser chrome.
- **Fix:** Replace `min-h-screen` with `min-h-dvh` where the intent is truly full-viewport. Tailwind supports it out of the box.
- **Effort:** Small
- **AC:** Welcome screen and confirmation screen display without clipping on iOS Safari at default zoom. Continue button is always fully visible above the keyboard/browser chrome.
- [ ] Done — ___________

---

### TD-004 — Add `touch-action: manipulation` to eliminate 300ms tap delay
- **File(s):** `src/index.css` or `src/main.tsx` (global), or `src/components/form/StepLayout.tsx` (primary CTA)
- **Problem:** The default 300ms tap delay on mobile makes buttons feel sluggish compared to native apps. This is particularly noticeable on the main Continue button tapped dozens of times through the form.
- **Fix:** Add `touch-action: manipulation` to the global `button` selector in the stylesheet, or apply the Tailwind utility `[touch-action:manipulation]` on the primary CTA button.
- **Effort:** Trivial
- **AC:** Tapping the Continue button on an Android device feels instantaneous with no perceptible delay.
- [ ] Done — ___________

---

## High Priority

### TD-005 — Consolidate form steps to reduce abandonment
- **File(s):** `src/components/form/FormShell.tsx`, `src/store/useFormStore.ts`, `src/components/seller/SellerFormShell.tsx`
- **Problem:** The buyer flow has 22 steps and the seller flow has ~25 steps. Users see the total count ("3/22") and abandon. Steps like nombre + whatsapp, or edad + estadoCivil could reasonably share a screen.
- **Fix:** Group related single-field steps into combined screens. Target: buyer flow ≤ 12 steps, seller flow ≤ 15 steps. Suggested groupings:
  - Contacto: nombre + whatsapp (+ email optional)
  - Perfil: edad + estadoCivil + dependientes
  - Laboral: situacionLaboral + empresa + ingreso
  - Credito: tipoCredito + nss + precalificacion
  - Busqueda: zonas + tipoInmueble + caracteristicas
- **Effort:** Large (requires store refactor + new combined step components)
- **AC:** A new user completing the buyer flow sees no more than 12 total step indicators. Internal testing shows completion rate improves.
- [ ] Done — ___________

---

### TD-006 — Rethink progress bar to avoid showing large step totals
- **File(s):** `src/components/form/ProgressBar.tsx`, `src/components/form/FormShell.tsx`
- **Problem:** Showing "3/22" is psychologically discouraging. Even if TD-005 is not done immediately, the display of the raw total should be hidden or reframed.
- **Fix:** Either (a) hide the numeric indicator and show only the progress bar, or (b) group steps into sections and show section progress like "Sección 1 de 4 · Contacto". Option (b) is preferred.
- **Effort:** Small
- **AC:** No step screen shows a denominator greater than 6. User cannot easily determine total step count from the UI.
- [ ] Done — ___________

---

### TD-007 — Verify back-navigation works on seller form shell
- **File(s):** `src/components/seller/SellerFormShell.tsx`
- **Problem:** The buyer FormShell has a back arrow button. The seller shell needs to be verified and fixed if the same back/progress header is missing. Users who tap the browser back button on a multi-step form lose all state.
- **Fix:** Ensure SellerFormShell renders the same header with back button and progress bar as FormShell. Confirm browser back button steps backward through form instead of navigating away.
- **Effort:** Small
- **AC:** Tapping back on step 5 of the seller form takes the user to step 4 with their previous answer preserved. Tapping browser back does the same.
- [ ] Done — ___________

---

### TD-008 — Increase touch target size on admin status buttons
- **File(s):** `src/pages/admin/SellerLeadDetailPage.tsx` (status section), `src/pages/admin/LeadDetailPage.tsx`
- **Problem:** Status pill buttons are small and cramped on narrow screens. They do not meet the 44px minimum touch target height required by Apple HIG and Material Design.
- **Fix:** Add `min-h-[44px]` and increase horizontal padding on status buttons. Also fix display of underscore-separated values — "en_proceso" should read "En proceso" with proper capitalization, not just `.replace(/_/g, ' ')`.
- **Effort:** Small
- **AC:** Status buttons are at least 44px tall. Text is properly capitalized. No mis-taps reported on a 375px wide device.
- [ ] Done — ___________

---

## Medium Priority

### TD-009 — Show red input border state on validation error
- **File(s):** `src/steps/StepNombre.tsx` and all steps with local error state, `src/components/form/StepLayout.tsx`
- **Problem:** When validation fails the error text appears below the input but the input itself stays gray. The visual signal is weak, especially for users who may not scroll down to read the error.
- **Fix:** When `error` is set, add `border-red-500` to the input border class. Consider a helper prop on StepLayout or pass `hasError` down to inputs.
- **Effort:** Small
- **AC:** On any step with a validation error, the input border turns red immediately. The error clears and border returns to normal when the user starts correcting.
- [ ] Done — ___________

---

### TD-010 — Move admin entry point off the welcome screen
- **File(s):** `src/steps/StepWelcome.tsx`
- **Problem:** The "Admin Leads" link is visible to all public users sharing the PWA link on Facebook Marketplace. It exposes the admin login entry point unnecessarily and adds visual noise to the welcome screen.
- **Fix:** Remove the link from StepWelcome. The admin route `/admin/login` still works if someone knows the URL. Optionally add a subtle footer link only on the `/admin/login` page itself for discoverability by team members.
- **Effort:** Trivial
- **AC:** No admin link visible on the public welcome screen. Navigating directly to `/admin/login` still works.
- [ ] Done — ___________

---

### TD-011 — Replace text "✕" close button in lightbox with SVG icon
- **File(s):** `src/pages/admin/SellerLeadDetailPage.tsx` (lightbox section)
- **Problem:** The close button renders the character `✕` which has inconsistent sizing and baseline alignment across fonts and platforms.
- **Fix:** Replace with an SVG X icon (Lucide `X` component, or inline SVG). Ensure it has an `aria-label="Cerrar"` attribute.
- **Effort:** Trivial
- **AC:** Lightbox close button renders as a clean vector icon in Chrome, Safari, and Firefox. Has accessible label.
- [ ] Done — ___________

---

### TD-012 — Add WhatsApp / contact option on buyer confirmation screen
- **File(s):** `src/pages/ConfirmationPage.tsx`
- **Problem:** After completing 22 steps the user sees only a passive "an advisor will contact you" message. Users who are motivated at this point have no way to reach out proactively, which loses warm leads.
- **Fix:** Add a WhatsApp button below the confirmation message that opens `https://wa.me/52XXXXXXXXXX` with a pre-filled message like "Hola, acabo de llenar el formulario de Viva Casa". Phone number should come from an environment variable or config constant.
- **Effort:** Small
- **AC:** Confirmation screen shows a green WhatsApp button. Tapping it opens WhatsApp with the pre-filled message. Same fix should be applied to `SellerConfirmationPage.tsx`.
- [ ] Done — ___________

---

### TD-013 — Add skeleton loader to admin detail pages
- **File(s):** `src/pages/admin/SellerLeadDetailPage.tsx`, `src/pages/admin/LeadDetailPage.tsx`
- **Problem:** During Firestore fetch the page shows plain "Cargando..." text in gray. This looks unfinished compared to the rest of the UI.
- **Fix:** Build a simple skeleton component using `animate-pulse` Tailwind classes that mimics the section layout (header bar, two info blocks, a button row). Show it while `loading === true`.
- **Effort:** Small
- **AC:** Navigating to any lead detail page shows an animated skeleton for up to 1 second before content appears. No "Cargando..." text visible.
- [ ] Done — ___________

---

## Low Priority / Polish

### TD-014 — Load a branded font for headings
- **File(s):** `index.html` or `src/main.tsx`, `src/index.css`
- **Problem:** The app uses the default system sans-serif font. For a real estate brand targeting Monterrey homeowners, a more premium font pairing would improve perceived quality and brand recall.
- **Recommended pairing:** Cinzel (headings — elegant, real estate feel) + Josefin Sans (body — clean, modern). Both available free on Google Fonts.
- **Fix:** Add the Google Fonts import to `index.html`. Apply `font-cinzel` to `h1`, `h2` elements in the welcome and confirmation screens at minimum. Do not apply to form step titles — keep those plain and fast.
- **Effort:** Small
- **AC:** Welcome screen and confirmation page h1 renders in Cinzel. Body text and form steps remain in system sans-serif for readability and performance.
- [ ] Done — ___________

---

### TD-015 — Add trust/reassurance subtitle on early form steps
- **File(s):** `src/steps/StepNombre.tsx`, `src/steps/StepWhatsapp.tsx`, `src/steps/StepEmail.tsx`
- **Problem:** The first three steps have no subtitle prop passed to StepLayout. Adding a short reassurance line on these critical early steps reduces form abandonment.
- **Fix:** Pass `subtitle` to StepLayout on the first 3 steps. Suggested copy: StepNombre → "Solo toma 3 minutos", StepWhatsapp → "Te contactaremos por aquí para avisarte cuando tengamos propiedades disponibles", StepEmail → "Opcional — solo para enviarte información adicional".
- **Effort:** Trivial
- **AC:** Steps 1–3 of the buyer form show a subtitle line. The subtitle does not appear on financial or property steps where it would feel out of place.
- [ ] Done — ___________

---

### TD-016 — Improve photo upload area with visual drop zone
- **File(s):** `src/components/form/MultiPhotoPicker.tsx`
- **Problem:** When no photos are selected the component shows a gray paragraph and a dashed button. The upload affordance is not immediately obvious, especially for less tech-savvy users.
- **Fix:** Replace the plain paragraph with a proper drop zone area: dashed border container, camera SVG icon centered, and the label text below it. Keep the existing hidden file input wired to this area on click.
- **Effort:** Small
- **AC:** When MultiPhotoPicker has no photos, it renders a visually distinct upload zone with an icon. Tapping anywhere on the zone opens the file picker. Existing photo grid and replace behavior unchanged.
- [ ] Done — ___________

---

### TD-017 — Reduce form step transition slide distance
- **File(s):** `src/components/form/FormShell.tsx`
- **Problem:** AnimatePresence uses `x: 40` for enter/exit which is slightly too large at 0.22s, making the transition feel more like a page flip than a smooth step progression.
- **Fix:** Reduce to `x: 20` for both initial and exit values. Keep the 0.22s duration unchanged.
- **Effort:** Trivial
- **AC:** Stepping through the form feels smooth and subtle. Animation is perceptible but does not distract from the input field.
- [ ] Done — ___________

---

## Summary Table

| ID | Title | Priority | Effort | Done |
|----|-------|----------|--------|------|
| TD-001 | Accessible labels on inputs | Critical | Medium | [ ] |
| TD-002 | Replace emoji with SVG icons | Critical | Small | [ ] |
| TD-003 | min-h-dvh on full-screen views | Critical | Small | [ ] |
| TD-004 | touch-action: manipulation | Critical | Trivial | [ ] |
| TD-005 | Consolidate form steps | High | Large | [ ] |
| TD-006 | Rethink progress bar display | High | Small | [ ] |
| TD-007 | Back nav on seller form shell | High | Small | [ ] |
| TD-008 | Admin status button touch targets | High | Small | [ ] |
| TD-009 | Red border on validation error | Medium | Small | [ ] |
| TD-010 | Remove admin link from welcome | Medium | Trivial | [ ] |
| TD-011 | SVG close button in lightbox | Medium | Trivial | [ ] |
| TD-012 | WhatsApp CTA on confirmation page | Medium | Small | [ ] |
| TD-013 | Skeleton loader on admin detail | Medium | Small | [ ] |
| TD-014 | Load branded font for headings | Low | Small | [ ] |
| TD-015 | Reassurance subtitles on steps 1–3 | Low | Trivial | [ ] |
| TD-016 | Visual drop zone in photo picker | Low | Small | [ ] |
| TD-017 | Reduce form transition slide distance | Low | Trivial | [ ] |
