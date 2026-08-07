## 1. Docker Compose — PostgreSQL

- [x] 1.1 Agregar servicio `postgres` (imagen 16-alpine, `POSTGRES_DB=futbolya`, user/password, volume `postgres-data`, healthcheck `pg_isready`, puerto 5432)
- [x] 1.2 Actualizar servicio `api`: `DATABASE_URL`, `depends_on` con `condition: service_healthy`, quitar `DATABASE_PATH` y volume `api-data`
- [x] 1.3 Limpiar Dockerfile de la API (quitar mkdir del path SQLite si ya no aplica)

## 2. Dependencias y TypeORM

- [x] 2.1 Agregar dependencia `pg` y remover `better-sqlite3` en `apps/api`
- [x] 2.2 Reconfigurar `typeorm.options.ts` a `type: 'postgres'` + `url: DATABASE_URL` (fail si falta); mantener `migrationsRun: true` y `synchronize: false`
- [x] 2.3 Reconfigurar `data-source.ts` de la misma forma para la CLI de migraciones
- [x] 2.4 Agregar `.env.example` con `DATABASE_URL` de desarrollo

## 3. Entities y migraciones

- [x] 3.1 Cambiar `CreateDateColumn`/`UpdateDateColumn` de `datetime` a `timestamptz` en todas las entities
- [x] 3.2 Reescribir `1762700000000-initial-schema.ts` a SQL Postgres
- [x] 3.3 Reescribir `1762790000000-championship-schema.ts` a SQL Postgres
- [x] 3.4 Reescribir `1762795000000-tournament-core-schema.ts` a SQL Postgres
- [x] 3.5 Reescribir `1762810000000-auth-ownership-schema.ts` a SQL Postgres

## 4. Verificación

- [x] 4.1 `docker compose up --build` y confirmar postgres healthy + API arranca con migraciones aplicadas
- [x] 4.2 Smoke: register/login y listado/alta de equipos contra Postgres
- [x] 4.3 Confirmar que no quedan referencias a `better-sqlite3`, `DATABASE_PATH` ni volume `api-data`
