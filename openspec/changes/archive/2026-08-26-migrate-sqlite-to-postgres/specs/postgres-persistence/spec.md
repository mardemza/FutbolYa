## ADDED Requirements

### Requirement: PostgreSQL as sole persistence engine
The system SHALL persist all application data exclusively in PostgreSQL. SQLite MUST NOT be used as a database engine.

#### Scenario: API connects via DATABASE_URL
- **WHEN** the API starts with a valid `DATABASE_URL` pointing to PostgreSQL
- **THEN** TypeORM connects using the `postgres` driver and that URL

#### Scenario: Missing DATABASE_URL fails startup
- **WHEN** the API starts without `DATABASE_URL`
- **THEN** the process MUST fail to start with a clear configuration error

### Requirement: Docker Compose provides initial PostgreSQL database
Docker Compose MUST include a `postgres` service that creates the application database on first start and remains healthy before dependent services start.

#### Scenario: Fresh compose stack
- **WHEN** an operator runs `docker compose up` on a clean environment
- **THEN** a PostgreSQL service starts with database `futbolya`, a named data volume, and a healthcheck that passes before the API becomes ready

#### Scenario: API depends on healthy Postgres
- **WHEN** the API container starts as part of the compose stack
- **THEN** it MUST wait until the `postgres` healthcheck succeeds and MUST receive `DATABASE_URL` targeting that service

### Requirement: Automatic migrations on API startup
The API MUST continue to run TypeORM migrations automatically on startup (`migrationsRun: true`) against PostgreSQL, with `synchronize` disabled.

#### Scenario: First boot on empty database
- **WHEN** the API starts against an empty PostgreSQL database
- **THEN** all existing schema migrations run successfully and create the full application schema

#### Scenario: Subsequent boots are idempotent
- **WHEN** the API starts again after migrations have already been applied
- **THEN** TypeORM MUST NOT re-apply completed migrations and the API MUST start normally

### Requirement: Migrations are PostgreSQL-compatible
All TypeORM migration SQL MUST be valid for PostgreSQL. Timestamp columns MUST use `TIMESTAMPTZ` with `DEFAULT now()` where defaults are required.

#### Scenario: Migration SQL uses Postgres types
- **WHEN** migrations execute on PostgreSQL
- **THEN** they MUST NOT use SQLite-only constructs such as `datetime('now')` or column type `datetime`

### Requirement: No SQLite configuration remains
The codebase and Docker configuration MUST NOT rely on `DATABASE_PATH`, `better-sqlite3`, or a SQLite data volume for the API.

#### Scenario: Compose and package have no SQLite path
- **WHEN** an operator inspects `docker-compose.yml` and API dependencies
- **THEN** there is no `DATABASE_PATH`, no `api-data` SQLite volume, and no `better-sqlite3` dependency
