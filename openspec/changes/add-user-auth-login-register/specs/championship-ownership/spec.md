## ADDED Requirements

### Requirement: Propiedad al crear campeonato
The system SHALL assign the authenticated user as owner when creating a championship.

#### Scenario: Create con owner
- **WHEN** an authenticated user creates a championship
- **THEN** the championship is stored with `ownerId` equal to that user id and returned in responses

#### Scenario: Create sin auth
- **WHEN** an unauthenticated client tries to create a championship
- **THEN** the system returns `401 Unauthorized`

### Requirement: Acceso solo del dueño
The system SHALL allow championship mutations and organizer reads only for the owner.

#### Scenario: Mutacion del dueño
- **WHEN** the owner updates teams, draw, fixtures or results for their championship
- **THEN** the system performs the operation

#### Scenario: Mutacion de no-dueño
- **WHEN** another authenticated user attempts to mutate a championship they do not own
- **THEN** the system returns `403 Forbidden`

### Requirement: Listado de mis campeonatos
The system SHALL list championships owned by the authenticated user.

#### Scenario: Listado propio
- **WHEN** an authenticated user calls `GET /api/v1/championships`
- **THEN** the system returns only championships where `ownerId` matches the user
