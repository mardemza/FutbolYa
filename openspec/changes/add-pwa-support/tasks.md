## 1. Dependencias y configuración Vite PWA

- [x] 1.1 Agregar `vite-plugin-pwa` en `apps/web` y verificar que `npm install` / el package manager del monorepo resuelve la dependencia sin errores
- [x] 1.2 Configurar `VitePWA` en `vite.config.ts` con `registerType: 'prompt'`, manifest FutbolYa (`name`, `short_name`, `theme_color` `#006e2f`, `background_color` `#f8f9ff`, `display: 'standalone'`, `lang: 'es-AR'`, `start_url: '/'`) y `devOptions.enabled: false`; verificar que `vite build` completa
- [x] 1.3 Configurar Workbox para precache del shell y excluir `/api/**` y `/socket.io/**` del cache de API; verificar en el SW generado (o config) que esas rutas no usan cache-first de datos de torneo

## 2. Iconos, splash y meta tags

- [x] 2.1 Crear iconos PNG de marca FutbolYa en `apps/web/public/icons/` (mínimo 192×192, 512×512 any + maskable, y `apple-touch-icon` 180×180) con colores primary/accent del tema; verificar que los archivos existen y abren correctamente
- [x] 2.2 Referenciar los iconos en el manifest del plugin y en `index.html` (`apple-touch-icon`, `theme-color`, `apple-mobile-web-app-capable` / title); verificar que el HTML de build / preview incluye los links
- [x] 2.3 Reemplazar o complementar el `favicon.svg` genérico de Vite con un favicon alineado a la marca; verificar que la pestaña del browser muestra el icono de FutbolYa
- [x] 2.4 Agregar splash/boot screen estático de marca en `index.html` (fondo `#f8f9ff` / primary, logo o monograma) y removerlo al montar React en `main.tsx`; verificar cold load sin JS bundle visible muestra splash y tras mount desaparece
- [x] 2.5 Agregar `apple-touch-startup-image` (set mínimo) o asset de splash iOS en `public/` alineado a la marca; verificar que el HTML referencia al menos una startup image y que el archivo responde 200

## 3. UI de actualización e instalación

- [x] 3.1 Implementar registro del SW con `virtual:pwa-register/react` (`useRegisterSW`) montado desde `App` o layout raíz; verificar en `vite preview` (tras build) que el SW se registra en Application → Service Workers
- [x] 3.2 Crear componente `PwaUpdatePrompt` que se muestra solo con `needRefresh`, copy en español (“Hay una actualización disponible”) y botón “Actualizar” que llama `updateServiceWorker(true)`; verificar manualmente forzando un segundo build/preview que aparece el banner y al pulsar recarga con la versión nueva
- [x] 3.3 Agregar control “Instalar app” que escucha `beforeinstallprompt`, muestra el CTA solo si el evento existe y la app no está instalada, y dispara el prompt nativo; verificar en Chrome (HTTPS/localhost + criterios cumplidos) que el botón aparece y abre el diálogo, y que en Safari no muestra un botón roto

## 4. Verificación de installability y docs mínimas

- [x] 4.1 Correr `vite build` + `vite preview` y validar con Chrome DevTools → Application (manifest válido, iconos 192/512, SW activo, splash/`background_color` coherente, no errores de installability bloqueantes)
- [x] 4.2 Documentar en README de `apps/web` o del repo cómo probar update (build → preview → redeploy/rebuild → botón Actualizar), splash (cold open de PWA instalada) y el requisito de HTTPS en producción; verificar que un desarrollador nuevo puede seguir los pasos sin adivinar
