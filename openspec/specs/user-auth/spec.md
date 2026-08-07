# user-auth Specification

## Purpose
TBD - created by archiving change add-user-auth-login-register. Update Purpose after archive.
## Requirements
### Requirement: Registro de usuario
The system SHALL allow a new user to register with a unique email and password, storing a password hash (never plaintext).

#### Scenario: Registro exitoso
- **WHEN** a client sends a valid email and password that do not already exist
- **THEN** the system creates the user, returns `201 Created` with user public fields and an `accessToken`

#### Scenario: Email duplicado
- **WHEN** a client registers with an email that already exists
- **THEN** the system rejects the request with `409 Conflict`

### Requirement: Login de usuario
The system SHALL authenticate users by email and password and issue a JWT access token.

#### Scenario: Login exitoso
- **WHEN** a client submits correct email and password
- **THEN** the system returns `200 OK` with user public fields and an `accessToken`

#### Scenario: Credenciales invalidas
- **WHEN** a client submits unknown email or wrong password
- **THEN** the system returns `401 Unauthorized` without revealing which field failed

### Requirement: Perfil autenticado
The system SHALL expose the current user profile for a valid Bearer token.

#### Scenario: Consulta /me
- **WHEN** an authenticated client calls `GET /api/v1/auth/me`
- **THEN** the system returns the user id, email and displayName

#### Scenario: Token ausente o invalido
- **WHEN** a client calls a protected endpoint without a valid Bearer token
- **THEN** the system returns `401 Unauthorized`

