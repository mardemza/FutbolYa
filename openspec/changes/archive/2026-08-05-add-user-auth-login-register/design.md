## Context

Ya existe `UserEntity` (`email`, `password_hash`) y la UI de organizador con slot de usuario, pero sin auth real. Los campeonatos no tienen dueño. Este cambio agrega autenticacion JWT y ownership.

## Goals / Non-Goals

**Goals:**
- Register y login con email/password.
- Sesion JWT Bearer para API y web.
- Vincular campeonato al usuario creador.
- Listar solo los campeonatos del usuario autenticado.
- Proteger mutaciones de campeonato/equipos/resultados al owner.

**Non-Goals:**
- OAuth social (Google, etc.).
- Roles complejos (arbitro, jugador) — solo organizador por ahora.
- Refresh tokens / logout server-side (logout es borrar token en cliente).
- Verificacion de email.

## Decisions

1. JWT Bearer + bcrypt
- Decision: `@nestjs/jwt` + `passport-jwt` (o guard JWT manual Nest) y `bcrypt` para hash.
- Rationale: estandar Nest, sin cookies cross-origin en monorepo Vite proxy.
- Alternativa: sessions en SQLite; se descarta por simplicidad de API REST.

2. Ownership en `championships.owner_id`
- Decision: FK nullable inicialmente no — obligatorio en create autenticado.
- Rationale: "mis datos" = campeonatos donde `ownerId === user.id`.
- Alternativa: tabla pivot user_championships; se descarta para MVP.

3. Endpoints auth bajo `/api/v1/auth`
- `POST /register` → `{ user, accessToken }`
- `POST /login` → `{ user, accessToken }`
- `GET /me` → `{ user }` (requiere auth)

4. Lectura publica vs privada
- Decision: listado y mutaciones de campeonato requieren auth; detalle/lectura de un campeonato propio requiere ser owner.
- Rationale: evita filtrar datos ajenos en la UI de organizador.

5. Web session
- Decision: `localStorage` key `futbolya.auth` con token + user; `AuthContext` + redirect a `/login`.
- Rationale: alineado al storage de recientes ya usado.

## Risks / Trade-offs

- [Riesgo] JWT secret en env — Mitigacion: `JWT_SECRET` con default solo en local.
- [Riesgo] Campeonatos existentes sin owner — Mitigacion: migracion con `owner_id` nullable; create nuevo siempre setea owner; ops legacy quedan huérfanas hasta asignar.
- [Trade-off] Sin refresh token — el usuario re-loguea al expirar (7 dias).

## Migration Plan

1. Agregar `display_name` opcional a `users` (para UI).
2. Agregar `owner_id` nullable a `championships` + indice.
3. Deploy API + web; usuarios nuevos crean torneos propios.

## Open Questions

- Ninguna bloqueante para MVP organizador.
