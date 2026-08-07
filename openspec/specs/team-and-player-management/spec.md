# team-and-player-management Specification

## Purpose
TBD - created by archiving change crear-sistema-campeonato-32-equipos. Update Purpose after archive.
## Requirements
### Requirement: Alta y gestion de equipos por campeonato
The system SHALL allow organizers to register, update and remove teams linked to a championship while registration is open.

#### Scenario: Registro exitoso de equipo
- **WHEN** an organizer registers a new team with unique name and required identifiers in a `draft` championship
- **THEN** the system links the team to the championship and increments registered team count

#### Scenario: Rechazo por nombre duplicado
- **WHEN** an organizer attempts to register a team whose name already exists in the same championship
- **THEN** the system rejects the operation with a uniqueness validation error

### Requirement: Alta y gestion de jugadores por equipo
The system SHALL allow organizers to register players in a team with roster constraints defined by championship rules.

#### Scenario: Alta valida de jugador
- **WHEN** an organizer adds a player with required fields to a team during open registration
- **THEN** the system stores the player and links it to the selected team

#### Scenario: Bloqueo de cambios de plantilla tras cierre
- **WHEN** an organizer tries to add or remove players after championship state is `registration-closed`
- **THEN** the system rejects the operation and returns a state-transition validation error

### Requirement: API REST para equipos y jugadores
The system SHALL expose nested team and player endpoints under `/api/v1/championships/{championshipId}`.

#### Scenario: Alta de equipo via API
- **WHEN** a client sends `POST /api/v1/championships/{championshipId}/teams` with a unique team name
- **THEN** the system returns `201 Created` and links the new team to the championship

#### Scenario: Bloqueo de alta de jugador tras cierre via API
- **WHEN** a client sends `POST /api/v1/championships/{championshipId}/teams/{teamId}/players` after registration has been closed
- **THEN** the system returns `409 Conflict` or `422 Unprocessable Entity` with invalid-state error metadata

