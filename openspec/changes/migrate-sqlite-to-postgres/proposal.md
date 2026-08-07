## Why

La API corre hoy sobre SQLite (`better-sqlite3`) con archivo local. Para entornos Docker y producción hace falta PostgreSQL como motor único, sin migrar datos existentes (base limpia).

## What Changes

- **BREAKING**: Eliminar soporte SQLite; la API solo conecta a PostgreSQL vía `DATABASE_URL`.
- Agregar servicio `postgres` en `docker-compose` con base inicial `futbolya`, volume y healthcheck.
- Reconfigurar TypeORM (`typeorm.options.ts`, `data-source.ts`) a `postgres` + `pg`.
- Reescribir las 4 migraciones existentes a SQL compatible con Postgres (mismos nombres/timestamps).
- Mantener `migrationsRun: true` al arrancar la API.
- Actualizar entities (`datetime` → `timestamptz`) y quitar `better-sqlite3` / `DATABASE_PATH` / volume `api-data`.
- Documentar `DATABASE_URL` en `.env.example`.

## Capabilities

### New Capabilities
- `postgres-persistence`: Persistencia exclusiva en PostgreSQL (Docker, TypeORM, migraciones auto-run).

### Modified Capabilities
- Ninguna en `openspec/specs/` (main aún vacío; cambios previos sin archivar).

## Impact

- Docker Compose: nuevo servicio `postgres`; `api` depende de healthcheck y usa `DATABASE_URL`.
- API NestJS: dependencia `pg`, config TypeORM, entities y migraciones.
- Datos locales SQLite se descartan; primer boot crea schema vía migraciones.
- APIs HTTP sin cambio de contrato; solo cambia el motor de persistencia.
