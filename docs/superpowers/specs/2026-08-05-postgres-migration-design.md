# Diseño: Migración de SQLite a PostgreSQL

**Fecha:** 2026-08-05  
**Estado:** Aprobado (diseño conversacional); pendiente review de este documento  
**Alcance:** Solo Postgres, base limpia, conservar `migrationsRun: true`

## Contexto

Hoy la API usa `better-sqlite3` con archivo en `DATABASE_PATH` (default `apps/api/data/futbolya.sqlite`). TypeORM corre las 4 migraciones al arrancar (`migrationsRun: true`, `synchronize: false`). Docker Compose solo tiene `api` + `web`; el volume `api-data` monta el SQLite.

## Decisiones

| Decisión | Elección |
|----------|----------|
| Datos existentes | Descartar (base limpia) |
| Motor | Solo PostgreSQL (sin fallback SQLite) |
| Migraciones | Reescribir las 4 existentes a SQL Postgres (mismos nombres/timestamps) |
| Auto-run | Mantener `migrationsRun: true` |

## Arquitectura

```
┌─────────┐     ┌─────────┐     ┌──────────────┐
│   web   │────▶│   api   │────▶│   postgres   │
│  :5173  │     │  :3002  │     │    :5432     │
└─────────┘     └─────────┘     └──────────────┘
                     │                  ▲
                     │  migrationsRun   │
                     └──────────────────┘
```

### Docker Compose

Agregar servicio `postgres`:

- Imagen: `postgres:16-alpine` (o `postgres:16`)
- Variables: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB=futbolya`
- Volume nombrado `postgres-data` → `/var/lib/postgresql/data`
- Healthcheck: `pg_isready`
- Puerto host: `5432` (o configurable)

Cambios en `api`:

- `depends_on: postgres` con condición `service_healthy`
- Env: `DATABASE_URL=postgresql://user:pass@postgres:5432/futbolya`
- Quitar `DATABASE_PATH` y volume `api-data`
- Dockerfile: quitar `mkdir` del path SQLite si ya no aplica

### TypeORM

Archivos a actualizar:

- `apps/api/src/database/typeorm.options.ts`
- `apps/api/src/database/data-source.ts`

Configuración:

```ts
type: 'postgres',
url: process.env.DATABASE_URL, // required
// entities + migrations sin cambio de lista
migrationsRun: true,
synchronize: false,
```

Dependencias:

- Agregar `pg` (y `@types/pg` en dev si hace falta)
- Remover `better-sqlite3`

### Entities

En todas las entities, cambiar:

- `@CreateDateColumn({ type: 'datetime' })` → `type: 'timestamptz'`
- `@UpdateDateColumn({ type: 'datetime' })` → `type: 'timestamptz'`

El resto de columnas (`varchar`, `integer`) es compatible.

### Migraciones (cambios SQL)

Reescribir in-place las 4 migraciones existentes (mismos class names / timestamps):

1. `1762700000000-initial-schema.ts` — `users`
2. `1762790000000-championship-schema.ts` — `championships`
3. `1762795000000-tournament-core-schema.ts` — teams, players, groups, etc.
4. `1762810000000-auth-ownership-schema.ts` — `display_name`, `owner_id`

Traducciones SQLite → Postgres:

| SQLite | Postgres |
|--------|----------|
| `datetime` | `TIMESTAMPTZ` |
| `DEFAULT (datetime('now'))` | `DEFAULT now()` |
| `DEFAULT ('draft')` / `DEFAULT (32)` | `DEFAULT 'draft'` / `DEFAULT 32` |
| `varchar PRIMARY KEY` | `varchar PRIMARY KEY` (sin cambio) |
| `CREATE TABLE IF NOT EXISTS` | OK en Postgres |
| `CREATE UNIQUE INDEX IF NOT EXISTS` | OK en Postgres |
| `ALTER TABLE ... ADD COLUMN` | OK en Postgres |
| `ALTER TABLE ... DROP COLUMN` | OK en Postgres (down de auth) |

No hace falta squash: DB nueva + mismos nombres → TypeORM registra las 4 al primer boot.

### Config local / docs

- Agregar `.env.example` en raíz o `apps/api` con `DATABASE_URL`
- Documentar en README (si existe) cómo levantar con `docker compose up`
- Desarrollo local: Postgres vía compose; API puede correr en host apuntando a `localhost:5432`

## Fuera de alcance

- Migración de datos desde `futbolya.sqlite`
- Soporte dual SQLite/Postgres
- Foreign keys formales (hoy no hay FKs en migraciones; se mantiene igual)
- Cambiar estrategia de UUID / primary keys

## Criterios de éxito

1. `docker compose up` levanta postgres healthy + api + web
2. Al arrancar la API, las 4 migraciones corren solas en Postgres
3. Login/registro y CRUD de equipos/jugadores funcionan contra Postgres
4. No queda referencia a `better-sqlite3` ni `DATABASE_PATH` en código/compose
5. `npm run migration:run` (CLI) también apunta a Postgres vía `DATABASE_URL`

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| API arranca antes que Postgres listo | `depends_on` + healthcheck |
| `DATABASE_URL` ausente en local | Fallar claro al boot; documentar en `.env.example` |
| Tests e2e/unit que asumen SQLite | Revisar y apuntar a Postgres o mock; ajustar en implementación |
