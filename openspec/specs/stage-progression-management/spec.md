# stage-progression-management Specification

## Purpose
TBD - created by archiving change crear-sistema-campeonato-32-equipos. Update Purpose after archive.
## Requirements
### Requirement: Tabla de posiciones y clasificacion por grupos
The system SHALL compute and maintain standings for each group based on recorded match results and configured tie-break rules.

#### Scenario: Actualizacion de tabla tras resultado
- **WHEN** a valid group-stage match result is recorded
- **THEN** the system recalculates standings for the affected group using configured scoring and tie-break criteria

#### Scenario: Cierre de fase de grupos con clasificados
- **WHEN** all group-stage matches are completed
- **THEN** the system marks group stage as complete and identifies qualified teams per group rules

### Requirement: Generacion de cruces de eliminacion directa
The system SHALL generate knockout pairings from qualified teams once group stage is complete.

#### Scenario: Generacion automatica de octavos
- **WHEN** the organizer requests knockout generation after qualification is complete
- **THEN** the system creates the first knockout bracket with valid pairings and updates tournament stage to knockout in progress

#### Scenario: Rechazo de avance sin clasificados completos
- **WHEN** knockout generation is requested and one or more qualification slots are unresolved
- **THEN** the system rejects the operation and reports pending qualification slots

### Requirement: API REST para resultados y progresion de fases
The system SHALL expose endpoints to record match results, query standings and generate knockout brackets.

#### Scenario: Registro de resultado via API
- **WHEN** a client sends `PUT /api/v1/matches/{matchId}/result` with valid goals payload
- **THEN** the system updates the match result and returns `200 OK`

#### Scenario: Rechazo de generacion knockout con grupos incompletos
- **WHEN** a client sends `POST /api/v1/championships/{championshipId}/stages/knockout/generate` and at least one group match is still pending
- **THEN** the system returns `422 Unprocessable Entity` with details of pending matches

