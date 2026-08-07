# championship-management Specification

## Purpose
TBD - created by archiving change crear-sistema-campeonato-32-equipos. Update Purpose after archive.
## Requirements
### Requirement: Crear y configurar campeonato de 32 equipos
The system SHALL allow users to create a championship with fixed capacity of 32 teams and editable metadata while it is in draft state.

#### Scenario: Creacion valida de campeonato
- **WHEN** an organizer creates a championship with name, season and start date
- **THEN** the system stores the championship in `draft` state with max capacity set to 32 teams

#### Scenario: Edicion permitida en borrador
- **WHEN** an organizer updates championship metadata while state is `draft`
- **THEN** the system persists the changes and keeps the championship in `draft`

### Requirement: Control de ciclo de vida del campeonato
The system SHALL enforce valid state transitions for the championship lifecycle.

#### Scenario: Cierre de inscripcion con cupo completo
- **WHEN** an organizer requests registration close and exactly 32 teams are registered
- **THEN** the system transitions state from `draft` to `registration-closed`

#### Scenario: Rechazo de cierre sin cupo completo
- **WHEN** an organizer requests registration close with fewer than 32 teams
- **THEN** the system rejects the action and returns a validation error explaining missing teams

### Requirement: API REST para administracion de campeonatos
The system SHALL expose championship management endpoints under `/api/v1/championships` for create, read, update and registration close operations.

#### Scenario: Creacion via API
- **WHEN** a client sends `POST /api/v1/championships` with valid payload
- **THEN** the system returns `201 Created` with the championship identifier and initial `draft` state

#### Scenario: Cierre de inscripcion via API con validacion de negocio
- **WHEN** a client sends `POST /api/v1/championships/{championshipId}/close-registration` and the championship has fewer than 32 teams
- **THEN** the system returns `422 Unprocessable Entity` with error code and missing-team details

