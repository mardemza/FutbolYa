## ADDED Requirements

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
