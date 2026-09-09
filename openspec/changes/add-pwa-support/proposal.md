## Why

FutbolYa es una SPA Vite/React usada por organizadores en el celular y en escritorio, pero hoy solo funciona como sitio web: no se puede instalar, no tiene iconos de app ni manifest, y tras un deploy el usuario puede seguir viendo assets cacheados del navegador sin un aviso claro. Hace falta convertirlo en PWA instalable con detección de nueva versión y un botón explícito para actualizar.

## What Changes

- Agregar Web App Manifest con nombre, colores de marca, `display` e iconos en tamaños requeridos para install prompts (Android/Chrome, iOS home screen).
- Generar y servir iconos PWA (PNG) a partir del branding existente (`favicon.svg` / identidad FutbolYa).
- Incluir splash screen de marca al abrir la PWA (splash nativo vía manifest + splash/boot screen en el shell HTML hasta que React monte).
- Registrar un service worker que precachee el shell de la app y permita instalación ("Add to Home Screen" / install prompt).
- Mostrar un control en la UI (banner o botón) cuando el service worker detecta una actualización pendiente; al pulsarlo, activar el nuevo worker y recargar el sitio.
- Integrar `vite-plugin-pwa` (o equivalente) en el build de `apps/web` para generar SW + manifest en producción.

## Capabilities

### New Capabilities

- `pwa`: Instalación como Progressive Web App, manifest, iconos, splash screen de marca, service worker, y flujo de “hay una actualización → actualizar ahora”.

### Modified Capabilities

- Ninguna. No cambian requisitos de autenticación, campeonatos ni notificaciones; solo se agrega capa de instalación/actualización en el cliente web.

## Impact

- **Web (`apps/web`)**: `vite.config.ts`, `index.html`, `public/` (iconos, splash assets + manifest refs), splash/boot screen en el shell, nuevo componente/hook de update prompt (p. ej. en `AppShell` o layout raíz), dependencia `vite-plugin-pwa` / `workbox`.
- **Build/deploy**: el artefacto de `vite build` incluye SW y archivos de precache; hay que servir HTTPS (o localhost) y headers correctos para el service worker.
- **API NestJS**: sin cambios de contrato.
- **Alcance offline**: shell cacheado para arranque/instalación; las llamadas a `/api` y Socket.IO siguen requiriendo red (no es un modo offline completo del dominio).
