# FutbolYa Web

SPA React + Vite del panel de torneos.

## Desarrollo

```bash
npm run dev -w web
```

El service worker **no** se activa en `vite` (dev). Usá build + preview para PWA.

## PWA

La app es instalable (`vite-plugin-pwa`):

- Manifest + iconos en `public/icons/`
- Splash/boot en `index.html` (se oculta al montar React)
- Splash iOS: `public/splash/`
- Banner **Actualizar** cuando hay un SW waiting
- Botón **Instalar app** solo si el browser dispara `beforeinstallprompt`

### Regenerar iconos / splash

```bash
npm run generate:pwa-icons -w web
```

### Probar instalación y service worker

1. `npm run build -w web`
2. `npm run preview -w web` (HTTPS o `localhost`)
3. Chrome → Application: Manifest, Service Workers, iconos 192/512
4. Instalá desde el botón de la UI o el menú del browser (si el criterio de installability se cumple)

### Probar actualización

1. Con preview corriendo y la app abierta, cambiá algo visible (p. ej. un texto) y volvé a `npm run build -w web`
2. Reiniciá preview (o serví el nuevo `dist`)
3. Recargá / esperá el check del SW → debe aparecer “Hay una actualización disponible”
4. Pulsá **Actualizar** → recarga con la versión nueva

### Producción

Serví el build bajo **HTTPS**. Sin contexto seguro el SW no se registra (excepto `localhost`).

Las rutas `/api/**` y `/socket.io/**` usan red (no cache de datos de torneo).
