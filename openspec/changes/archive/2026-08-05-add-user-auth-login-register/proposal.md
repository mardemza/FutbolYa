## Why

La UI y el dominio de campeonatos ya existen, pero no hay identidad: cualquiera puede operar sin cuenta y no hay forma de vincular un campeonato a su organizador. Hace falta login/register para que cada usuario administre solo sus datos.

## What Changes

- Agregar registro de usuario con email y password.
- Agregar login que emita un token JWT de sesion.
- Exponer endpoint de perfil autenticado (`/auth/me`).
- Vincular campeonatos al usuario creador (`ownerId`) y restringir mutaciones al dueño.
- Agregar pantallas web de Login y Register, con sesion persistida y guards de navegacion.
- Proteger endpoints de escritura del campeonato con autenticacion.

## Capabilities

### New Capabilities
- `user-auth`: Registro, login, sesion JWT y perfil del usuario autenticado.
- `championship-ownership`: Propiedad de campeonatos por usuario y filtrado de "mis torneos".

### Modified Capabilities
- Ninguna en `openspec/specs/` (main aun vacio; el cambio previo de campeonato sigue sin archivar).

## Impact

- API NestJS: nuevo modulo `auth`, dependencias JWT/bcrypt, guardas y DTOs.
- Persistencia: migracion para `users` (si hace falta enriquecer) y `championships.owner_id`.
- Web: rutas `/login` y `/register`, contexto de sesion, header con usuario real.
- Endpoints de campeonato: create/update/mutations requieren Bearer token; listado propio del organizador.
