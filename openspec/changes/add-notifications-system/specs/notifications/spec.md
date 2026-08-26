## Purpose

Permite a cada organizador ver y gestionar avisos in-app sobre actividad relevante de sus campeonatos, sin revisar manualmente cada módulo del torneo.

## ADDED Requirements

### Requirement: Persistencia de notificaciones por usuario

The system SHALL store notifications scoped to the authenticated user (`recipientId`), with fields for type, category, title, body, read state, optional championship reference, optional entity reference, deep-link path, and creation timestamp.

#### Scenario: Notificación creada con metadatos mínimos

- **WHEN** the system emits a domain notification for a user
- **THEN** it persists a record with `readAt = null`, a stable `type` code, a human-readable `title` and `body` in Spanish, and a `deepLink` path the client can navigate to

#### Scenario: Notificaciones aisladas por usuario

- **WHEN** user A lists notifications
- **THEN** the system returns only notifications where `recipientId` equals user A's id

### Requirement: Eventos que generan notificaciones automáticas

The system SHALL create notifications for the championship owner when these domain events occur:

| Event code | Trigger |
|---|---|
| `championship.created` | A championship is successfully created |
| `team.registered` | A team is registered in a championship |
| `registration.closed` | Registration closes with full capacity (32 teams) |
| `groups.drawn` | Group draw completes |
| `fixture.generated` | Group-stage fixture is generated |
| `match.result_updated` | A match result is saved or changed |
| `championship.phase_changed` | Championship status transitions (e.g. `drawn` → `in-progress`, `in-progress` → `finished`) |

#### Scenario: Campeonato creado

- **WHEN** an organizer creates a championship
- **THEN** the system creates a `championship.created` notification for that organizer with a deep link to the championship dashboard

#### Scenario: Equipo inscripto

- **WHEN** a team is registered in a championship owned by the organizer
- **THEN** the system creates a `team.registered` notification including team name and registered/total count in the body

#### Scenario: Resultado de partido actualizado

- **WHEN** a match result is saved or updated in a championship owned by the organizer
- **THEN** the system creates a `match.result_updated` notification with both team names, score, group/round context, and a deep link to the fixture view

#### Scenario: Inscripción cerrada

- **WHEN** registration closes because 32 teams are registered
- **THEN** the system creates a `registration.closed` notification prompting the organizer to proceed with the draw

#### Scenario: Cambio de fase del campeonato

- **WHEN** the championship status changes to a new lifecycle value
- **THEN** the system creates a `championship.phase_changed` notification describing the new phase and suggested next action

### Requirement: API REST de notificaciones

The system SHALL expose authenticated endpoints under `/api/v1/notifications`:

- `GET /notifications` — paginated list with optional filters: `category`, `championshipId`, `unreadOnly`
- `GET /notifications/unread-count` — integer count of unread notifications
- `PATCH /notifications/:id/read` — mark one notification as read
- `PATCH /notifications/read-all` — mark all (optionally filtered by `championshipId`) as read

#### Scenario: Listado paginado por defecto

- **WHEN** an authenticated client sends `GET /api/v1/notifications`
- **THEN** the system returns notifications ordered by `createdAt` descending with pagination metadata

#### Scenario: Filtro por categoría

- **WHEN** a client sends `GET /api/v1/notifications?category=match`
- **THEN** the system returns only notifications whose category is `match`

#### Scenario: Contador de no leídas

- **WHEN** a client sends `GET /api/v1/notifications/unread-count`
- **THEN** the system returns the count of notifications with `readAt = null` for the authenticated user

#### Scenario: Marcar una como leída

- **WHEN** the owner sends `PATCH /api/v1/notifications/{id}/read`
- **THEN** the system sets `readAt` to the current timestamp and returns the updated notification

#### Scenario: Marcar todas como leídas

- **WHEN** the owner sends `PATCH /api/v1/notifications/read-all`
- **THEN** all unread notifications for that user are marked read

#### Scenario: Acceso denegado a notificación ajena

- **WHEN** a client attempts to read or mark a notification belonging to another user
- **THEN** the system returns `404 Not Found`

### Requirement: Categorías y presentación en UI

The system SHALL classify each notification into one of: `championship`, `team`, `match`, `system`. The web client SHALL render notifications according to the Stitch design: unread accent bar, filter tabs (Todas, Campeonato, Partidos, Equipos), relative timestamps, and deep-link action.

#### Scenario: Mapeo de tipo a categoría

- **WHEN** a `match.result_updated` notification is created
- **THEN** its category is `match`

#### Scenario: Badge de campana

- **WHEN** the user has unread notifications
- **THEN** the header bell shows a badge with the unread count (capped display at `99+`)

### Requirement: Push en tiempo real vía WebSocket

The system SHALL expose an authenticated WebSocket channel (Socket.IO namespace `/notifications`) that pushes notification events to connected browsers belonging to the recipient user.

#### Scenario: Conexión autenticada

- **WHEN** an authenticated client opens a WebSocket connection with a valid JWT in the handshake
- **THEN** the server accepts the connection and joins the socket to room `user:{userId}`

- **WHEN** the handshake JWT is missing or invalid
- **THEN** the server rejects the connection

#### Scenario: Señal al crear notificación

- **WHEN** the system persists a new notification for a user
- **THEN** it emits event `notification:new` to room `user:{recipientId}` with the created notification and the updated `unreadCount`

#### Scenario: Badge actualizado en campana

- **WHEN** the browser receives `notification:new` while the app shell is visible
- **THEN** the bell badge updates to show the server-provided `unreadCount` without requiring a manual page refresh

#### Scenario: Click en campana navega a notificaciones

- **WHEN** the user clicks the notification bell
- **THEN** the client navigates to `/notifications` and loads notifications via REST

#### Scenario: Lista en vivo en página de notificaciones

- **WHEN** the user is on `/notifications` and receives `notification:new`
- **THEN** the bell badge updates AND the notifications list prepends the new item (deduplicated by id) without a full page reload

#### Scenario: Reconexión tras desconexión

- **WHEN** the WebSocket connection drops and reconnects successfully
- **THEN** the client refetches `GET /notifications/unread-count` to resync the badge
