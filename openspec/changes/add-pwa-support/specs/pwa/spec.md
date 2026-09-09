## Purpose

Permite instalar FutbolYa como Progressive Web App en dispositivos compatibles, con identidad visual (manifest, iconos y splash screen), y un flujo explícito para aplicar actualizaciones del cliente cuando hay una nueva versión desplegada.

## ADDED Requirements

### Requirement: Web App Manifest instalable

The system SHALL expose a Web App Manifest that identifies the app as FutbolYa, with `name`, `short_name`, `start_url`, `display` of `standalone` (or equivalent fullscreen/standalone mode), `lang` of `es-AR`, `theme_color`, `background_color`, and icon entries sufficient for browser installability criteria on Chromium-based browsers.

#### Scenario: Manifest servido en producción

- **WHEN** a client requests the built web app
- **THEN** the document references a valid Web App Manifest and the manifest includes FutbolYa branding fields and at least one icon of 192×192 and one of 512×512

#### Scenario: Apertura en modo app

- **WHEN** the user launches FutbolYa from an installed PWA / home-screen shortcut
- **THEN** the app opens at the configured `start_url` without browser chrome typical of a normal tab (standalone presentation)

### Requirement: Iconos de aplicación

The system SHALL provide PWA icons that use FutbolYa brand colors (primary green family), not a third-party default logo, including sizes required for Android/Chrome install prompts and an Apple touch icon for iOS home-screen addition.

#### Scenario: Iconos referenciados por el manifest

- **WHEN** the Web App Manifest is loaded
- **THEN** each declared icon URL resolves successfully and matches the declared `sizes` and `type`

#### Scenario: Agregar a pantalla de inicio en iOS

- **WHEN** a user adds FutbolYa to the home screen from Safari
- **THEN** the home-screen icon uses the provided Apple touch icon (or equivalent apple-touch-icon link)

### Requirement: Splash screen de marca al lanzar

The system SHALL present a FutbolYa-branded splash experience when the installed PWA (or home-screen app) is launched and while the web shell is booting, using brand background/theme colors and logo/iconography—not a blank white screen or a third-party default.

#### Scenario: Splash nativo al abrir la PWA instalada

- **WHEN** the user opens FutbolYa from an installed PWA / home-screen shortcut on a platform that paints a launch splash from the manifest
- **THEN** the launch surface uses the configured brand `background_color` / `theme_color` and app icon rather than an unbranded blank screen

#### Scenario: Boot splash hasta el primer paint de la SPA

- **WHEN** the document loads before React has mounted the application UI
- **THEN** the user sees a static branded splash/boot screen in the HTML shell that is removed once the app root has mounted

#### Scenario: Splash iOS home screen

- **WHEN** the user launches FutbolYa from the iOS home screen
- **THEN** the startup experience uses Apple startup imagery or equivalent branded launch presentation linked from the document (not an unbranded white flash as the only experience)

### Requirement: Service worker del app shell

The system SHALL register a service worker in production builds that precaches the static app shell assets produced by the web build, and MUST NOT treat authenticated API or Socket.IO traffic as long-lived cached substitutes for live server responses.

#### Scenario: Registro tras cargar la app en producción

- **WHEN** an authenticated or anonymous user loads the production web app over a secure context (HTTPS or localhost)
- **THEN** a service worker is registered and controls subsequent navigations to the app origin according to the precache strategy

#### Scenario: API no servida desde cache stale como fuente de verdad

- **WHEN** the client calls `/api/**` or connects to `/socket.io/**`
- **THEN** those requests are fulfilled from the network (or fail with network error), not from a stale API cache presented as current tournament data

### Requirement: Detección de actualización y botón para aplicar

The system SHALL detect when a newer service worker / client build is waiting and SHALL show a visible control (message plus action button) that, when activated by the user, applies the update and reloads the site so the new version is active.

#### Scenario: Banner visible cuando hay update pendiente

- **WHEN** a new deployment causes a waiting service worker while the user still has the previous version open
- **THEN** the UI shows a Spanish-language notice that an update is available and a primary action labeled to update (e.g. “Actualizar”)

#### Scenario: Usuario aplica la actualización

- **WHEN** the user activates the update action
- **THEN** the waiting service worker becomes active and the page reloads so the user runs the new client build

#### Scenario: Sin update pendiente

- **WHEN** the active service worker is already the latest deployed version
- **THEN** the update notice and update button are not shown

### Requirement: Instalación guiada cuando el browser lo permite

The system SHALL offer an install affordance when the browser fires an install prompt capability (e.g. `beforeinstallprompt`) and the app is not already installed; when that capability is unavailable, the system MUST NOT show a broken install control that claims installation is possible.

#### Scenario: Botón instalar disponible

- **WHEN** the browser provides an install prompt event and the PWA is not already installed
- **THEN** the UI exposes a control that triggers the native install flow

#### Scenario: Browser sin install prompt

- **WHEN** the browser does not provide an install prompt (e.g. iOS Safari)
- **THEN** the dedicated install control is hidden or replaced by non-blocking guidance that does not call a missing install API
