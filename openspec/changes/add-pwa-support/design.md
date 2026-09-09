## Context

`apps/web` es una SPA Vite 8 + React 19 + React Router. Hoy solo hay `favicon.svg` (logo genérico Vite, no marca FutbolYa) y no hay manifest ni service worker. El proxy de Vite ya enruta `/api` y `/socket.io`; en producción el static hosting debe seguir sirviendo la SPA bajo HTTPS. Ver `proposal.md` para motivación.

## Goals / Non-Goals

**Goals:**

- PWA instalable en Chromium/Android y agregable a home screen en iOS (Safari), con manifest e iconos de marca.
- Splash screen de marca al lanzar la PWA (nativo + boot screen del shell).
- Service worker que precachee el app shell (HTML/JS/CSS/assets estáticos del build).
- UI visible solo cuando hay update pendiente: mensaje + botón que activa el nuevo SW y recarga.
- Build integrado: un `vite build` genera SW, manifest y precache list sin pasos manuales.

**Non-Goals:**

- Modo offline completo del dominio (crear campeonatos, sync de resultados sin red).
- Push notifications nativas del sistema operativo (Web Push) — las notificaciones in-app existentes siguen por Socket.IO.
- Background sync / Periodic Background Sync.
- App Store / Play Store packaging (TWA, Capacitor, etc.).
- Cambiar contratos de la API.

## Decisions

### 1. `vite-plugin-pwa` + Workbox (generateSW)

- **Choice:** Plugin oficial de Vite con estrategia `generateSW`, `registerType: 'prompt'` (no auto-update silencioso).
- **Alternatives:** SW manual; `injectManifest` custom; Workbox CLI separado.
- **Rationale:** Encaja con Vite, genera manifest + SW en build, y `prompt` permite el botón “Actualizar” que pidió el producto. Auto-update forzaría reload sin control del usuario.

### 2. Manifest embebido en config del plugin

- **Choice:** Definir `manifest` en `vite.config.ts` (name, short_name, theme/background, icons, `display: 'standalone'`, `start_url: '/'`, `lang: 'es-AR'`).
- **Alternatives:** `public/manifest.webmanifest` estático.
- **Rationale:** Un solo lugar de verdad; el plugin inyecta el link en el HTML de build.

Valores de marca (desde `index.css`):

| Campo | Valor |
|-------|--------|
| `name` | FutbolYa — Panel de Torneos |
| `short_name` | FutbolYa |
| `theme_color` | `#006e2f` |
| `background_color` | `#f8f9ff` |
| `display` | `standalone` |
| `orientation` | `any` |

### 3. Iconos PNG generados y versionados en `public/icons/`

- **Choice:** Crear assets PNG maskable + any en 192×192 y 512×512 (mínimo Chrome installability), más `apple-touch-icon` 180×180. Marca: tipografía/logo “FY” o pelota + verde `#006e2f` / accent `#6bff8f` (no reutilizar el SVG morado de Vite).
- **Alternatives:** Solo SVG; generar en CI en cada build.
- **Rationale:** iOS y criterios de install de Chrome exigen PNG; versionar en repo evita dependencia de toolchain de diseño en cada deploy. Script opcional (`scripts/generate-pwa-icons.mjs`) si se quiere regenerar desde un SVG fuente.

### 4. Registro del SW y prompt de actualización en React

- **Choice:** Virtual module `virtual:pwa-register/react` → hook `useRegisterSW`. Componente `PwaUpdatePrompt` montado en `App` / layout raíz:
  - Visible solo cuando `needRefresh === true`.
  - Copy en español: “Hay una actualización disponible” + botón “Actualizar”.
  - On click: `updateServiceWorker(true)` (activa waiting SW + reload).
  - Opcional secundario: “Ahora no” que oculta el banner en la sesión (`needRefresh` local dismiss).
- **Alternatives:** Banner global fijo; auto-reload; solo consola.
- **Rationale:** Cumple el requisito de botón explícito; no interrumpe flujos mid-form sin que el usuario elija.

### 5. Caching strategy

- **Choice:** Precache de assets del build (app shell). Runtime: network-first o bypass para `/api/**` y `/socket.io/**` (no cachear respuestas de API).
- **Alternatives:** Cache-first agresivo de API; offline queue.
- **Rationale:** Datos de torneo deben ser frescos; el SW no debe servir JSON viejo. Socket.IO no es cacheable.

### 6. Dev vs prod

- **Choice:** SW deshabilitado o en modo `devOptions.enabled: false` por defecto en `vite`; verificar con `vite build` + `vite preview` (o deploy).
- **Alternatives:** SW activo en hot reload.
- **Rationale:** Evita estados fantasmas de cache durante desarrollo.

### 7. Meta tags iOS / theme

- **Choice:** En `index.html`: `apple-mobile-web-app-capable`, `apple-mobile-web-app-title`, link `apple-touch-icon`, `theme-color`.
- **Rationale:** Safari no usa el mismo flujo de install que Chromium; estos meta mejoran “Agregar a pantalla de inicio”.

### 8. Splash screen de marca (nativo + boot shell)

- **Choice:** Combinar dos capas:
  1. **Splash nativo**: `background_color` + `theme_color` + iconos del manifest (Android/Chrome standalone launch). En iOS, `apple-touch-startup-image` para al menos un tamaño portrait representativo (o generación de un set mínimo iPhone) con fondo `#f8f9ff` e icono/logo centrado.
  2. **Boot splash en `index.html`**: markup estático dentro de `#root` (o sibling) con fondo de marca, logo/monograma FutbolYa y tipografía display; se remueve al montar React (`main.tsx` / root render) para cubrir el gap entre el splash del OS y el primer paint de la SPA.
- **Alternatives:** Solo colores del manifest (sin assets); librería de splash; splash React-only (flash blanco antes del JS).
- **Rationale:** El usuario pidió splash explícito; el nativo sola no alcanza en cold start de SPA, y el HTML boot evita pantalla blanca sin depender del bundle.

## Risks / Trade-offs

- [Usuarios con SW viejo no ven deploys] → `registerType: 'prompt'` + check periódico / `onNeedRefresh`; documentar hard refresh como fallback.
- [Precache incompleto tras deploy parcial] → versionado de assets con hash de Vite; Workbox invalida por revision.
- [API cacheada por error de config] → deny list explícita de `/api` y `/socket.io` en workbox runtimeCaching.
- [Install prompt no aparece en todos los browsers] → criteria de Chrome (HTTPS, manifest válido, iconos, SW); iOS solo “Add to Home Screen” manual — UI de “Instalar” puede escuchar `beforeinstallprompt` donde exista y ocultarse si no.
- [Iconos placeholder de baja calidad] → brief de diseño simple (monograma FY sobre verde) en tasks; iterar assets sin cambiar specs.
- [Flash blanco entre splash OS y React] → boot splash en HTML estático removido solo tras hydrate/mount.
- [Muchos tamaños iOS startup] → set mínimo documentado; ampliar assets sin cambiar el requirement.

## Migration Plan

1. Merge de assets + config PWA; deploy web en HTTPS.
2. Primera visita registra SW; visitas siguientes pueden recibir el banner de update tras un nuevo deploy.
3. Rollback: redeploy build anterior; usuarios con SW waiting necesitan el botón o hard refresh una vez.

## Open Questions

- ¿Mostrar también un botón “Instalar app” permanente (cuando `beforeinstallprompt` esté disponible), o solo el flujo nativo del browser + update banner? Default propuesto: **sí**, botón/CTA de instalar en header o menú de usuario, visible solo si el evento está disponible y la app aún no está instalada.
