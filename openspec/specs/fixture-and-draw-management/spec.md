# fixture-and-draw-management Specification

## Purpose
TBD - created by archiving change crear-sistema-campeonato-32-equipos. Update Purpose after archive.
## Requirements
### Requirement: Sorteo de grupos con equipos registrados
The system SHALL generate group assignments for the 32 registered teams only when registration is closed.

#### Scenario: Sorteo exitoso en estado valido
- **WHEN** an organizer runs the group draw for a championship in `registration-closed` state with 32 teams
- **THEN** the system assigns all teams to groups according to tournament format and transitions championship to `drawn`

#### Scenario: Bloqueo de sorteo fuera de estado
- **WHEN** an organizer runs group draw while championship state is not `registration-closed`
- **THEN** the system rejects the operation with an invalid-state error

### Requirement: Generacion de fechas y encuentros sin duplicados
The system SHALL generate matchdays and matches for group stage without duplicate fixtures.

#### Scenario: Generacion valida de calendario de grupos
- **WHEN** the organizer confirms fixture generation after successful draw
- **THEN** the system creates matchdays and matches covering all required group pairings

#### Scenario: Rechazo de segunda generacion
- **WHEN** an organizer requests fixture generation after a fixture already exists for the same stage
- **THEN** the system rejects the operation to prevent duplicate schedules

### Requirement: API REST para sorteo y fixture
The system SHALL expose draw and fixture endpoints for organizers under `/api/v1/championships/{championshipId}`.

#### Scenario: Sorteo con semilla opcional via API
- **WHEN** a client sends `POST /api/v1/championships/{championshipId}/draw` with optional `seed`
- **THEN** the system returns `200 OK` with generated group assignments and applied seed value

#### Scenario: Conflicto por fixture preexistente via API
- **WHEN** a client sends `POST /api/v1/championships/{championshipId}/fixtures` and the fixture already exists
- **THEN** the system returns `409 Conflict` with an error code indicating duplicate fixture generation

