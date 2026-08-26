## Context

La API NestJS usa TypeORM con `better-sqlite3` y archivo en `DATABASE_PATH`. Las migraciones corren al arrancar (`migrationsRun: true`). Docker Compose despliega `api` + `web` y monta un volume para el SQLite. No hay FKs formales; PKs son varchar UUID. Base de datos nueva: no se migra data de SQLite.

## Goals / Non-Goals

**Goals:**

- PostgreSQL como único motor de persistencia.
- Servicio `postgres` en Docker Compose con DB inicial `futbolya`.
- TypeORM conectado por `DATABASE_URL`; `migrationsRun: true` sin cambios de flujo.
- Migraciones existentes reescritas a SQL Postgres (mismos nombres/timestamps).
- Entities con `timestamptz` en columnas de fecha.

**Non-Goals:**

- Migrar datos desde `futbolya.sqlite`.
- Soporte dual SQLite/Postgres.
- Introducir foreign keys nuevas.
- Cambiar contratos HTTP de la API.

## Decisions

### 1. Solo Postgres vía `DATABASE_URL`

- **Choice:** `type: 'postgres'` + `url: process.env.DATABASE_URL` (requerida).
- **Alternatives:** dual por env; path de archivo. Rechazadas: el usuario eligió motor único.
- **Rationale:** Simplifica ops y alinea Docker/local/prod.

### 2. Reescribir las 4 migraciones in-place

- **Choice:** Adaptar SQL de las migraciones actuales (mismos class names / timestamps).
- **Alternatives:** squash a una baseline; generar nuevas con TypeORM CLI.
- **Rationale:** Conserva el historial incremental y el auto-run; DB limpia evita conflictos de checksum.

### 3. Traducciones SQL

| SQLite | Postgres |
|--------|----------|
| `datetime` | `TIMESTAMPTZ` |
| `DEFAULT (datetime('now'))` | `DEFAULT now()` |
| `DEFAULT ('x')` / `DEFAULT (n)` | `DEFAULT 'x'` / `DEFAULT n` |

`CREATE TABLE/INDEX IF NOT EXISTS` y `ALTER TABLE ... ADD/DROP COLUMN` se mantienen.

### 4. Docker Compose

- Imagen `postgres:16-alpine`, volume `postgres-data`, healthcheck `pg_isready`.
- `api` `depends_on` con `condition: service_healthy`.
- Quitar `DATABASE_PATH` y volume `api-data`.
- Credenciales por env (defaults de desarrollo documentados en `.env.example`).

### 5. Dependencias

- Agregar `pg`; remover `better-sqlite3`.

## Risks / Trade-offs

- [API arranca antes que Postgres] → `depends_on` + healthcheck.
- [`DATABASE_URL` ausente] → fallar al boot; documentar en `.env.example`.
- [Tests que asumen SQLite] → apuntar a Postgres o ajustar en implementación.
- [Pérdida de datos locales SQLite] → aceptado (opción A); documentar en proposal.

## Migration Plan

1. Agregar `postgres` al compose y vars de `api`.
2. Cambiar TypeORM + deps + entities.
3. Reescribir migraciones a Postgres.
4. `docker compose up` → migraciones auto → smoke de auth/CRUD.
5. Rollback: revertir commit; no hay datos Postgres a preservar en esta etapa.

## Open Questions

Ninguna bloqueante; credenciales de desarrollo se documentan con defaults seguros solo para local.
