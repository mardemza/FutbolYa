## Context

Actualmente el proyecto no tiene capacidades funcionales para gestionar torneos. Se necesita un flujo completo para campeonatos de 32 equipos: alta de campeonato, carga de equipos y jugadores, sorteo de grupos/fechas y avance por fases.

Restricciones principales:
- El torneo objetivo tiene 32 equipos.
- Debe existir consistencia entre entidades (campeonato, equipos, jugadores, grupos, partidos y fases).
- El sorteo no puede ejecutarse si faltan datos minimos.

## Goals / Non-Goals

**Goals:**
- Definir un modelo de dominio para campeonatos de 32 equipos y su ciclo de vida.
- Permitir gestionar equipos y jugadores asociados al campeonato.
- Implementar reglas de sorteo de grupos, calendario de fechas y encuentros.
- Habilitar progresion de fases desde grupos hacia eliminacion directa.
- Garantizar trazabilidad y validaciones para evitar estados invalidos.

**Non-Goals:**
- No incluye integraciones externas (federaciones, APIs de terceros, pagos).
- No incluye app movil nativa en esta etapa.
- No incluye estadisticas avanzadas (posesion, xG, heatmaps) en la primera version.

## Decisions

1. Modelo de dominio centrado en agregados
- Decisión: definir agregados principales `Championship`, `Team`, `Player`, `Group`, `Match`, `Stage` y `Standing`.
- Rationale: separa responsabilidades y facilita reglas de negocio por contexto.
- Alternativas consideradas: modelo anemico con tablas sueltas; se descarta por alta complejidad de validaciones cruzadas.

2. Maquina de estados para campeonato y fases
- Decisión: manejar estados explicitos (`draft`, `registration-closed`, `drawn`, `in-progress`, `finished`).
- Rationale: evita operaciones fuera de orden (por ejemplo, sortear dos veces).
- Alternativas consideradas: usar banderas booleanas; se descarta por falta de claridad y riesgo de inconsistencias.

3. Sorteo determinista con semilla opcional
- Decisión: soportar sorteo pseudoaleatorio con semilla opcional para auditoria/repeticion.
- Rationale: permite reproducir resultados en pruebas y debugging.
- Alternativas consideradas: aleatorio puro sin semilla; se descarta por baja trazabilidad.

4. Progresion por reglas configurables de clasificacion
- Decisión: la fase de grupos define clasificados por grupo y criterios de desempate; eliminacion directa se genera automaticamente.
- Rationale: separa reglas del formato de la ejecucion de partidos.
- Alternativas consideradas: hardcodear reglas fijas; se descarta para permitir evolucion de formatos.

## Risks / Trade-offs

- [Riesgo] Complejidad de reglas de desempate en grupos -> Mitigacion: encapsular desempates en servicio dedicado con pruebas de casos limite.
- [Riesgo] Inconsistencias por actualizaciones concurrentes de partidos -> Mitigacion: transacciones y versionado optimista sobre standings/fases.
- [Trade-off] Mayor esfuerzo inicial de modelado -> Beneficio: menor deuda tecnica al incorporar nuevas fases/formats.
- [Riesgo] Errores de calendario al generar fechas -> Mitigacion: validadores de cobertura (todos contra todos en grupo, sin duplicados).

## API Design (REST v1)

Base path: `/api/v1`

Recursos y endpoints principales:
- `POST /championships`: crear campeonato (`201 Created`).
- `GET /championships/{championshipId}`: obtener detalle de campeonato (`200 OK`).
- `PATCH /championships/{championshipId}`: editar metadata en `draft` (`200 OK`).
- `POST /championships/{championshipId}/close-registration`: cerrar inscripcion con validacion de 32 equipos (`200 OK`, `422` si faltan).

- `POST /championships/{championshipId}/teams`: alta de equipo (`201 Created`).
- `GET /championships/{championshipId}/teams`: listar equipos (`200 OK`).
- `PATCH /championships/{championshipId}/teams/{teamId}`: editar equipo (`200 OK`).
- `DELETE /championships/{championshipId}/teams/{teamId}`: baja de equipo (`204 No Content`).

- `POST /championships/{championshipId}/teams/{teamId}/players`: alta de jugador (`201 Created`).
- `GET /championships/{championshipId}/teams/{teamId}/players`: listar jugadores (`200 OK`).
- `PATCH /championships/{championshipId}/teams/{teamId}/players/{playerId}`: editar jugador (`200 OK`).
- `DELETE /championships/{championshipId}/teams/{teamId}/players/{playerId}`: baja de jugador (`204 No Content`).

- `POST /championships/{championshipId}/draw`: ejecutar sorteo de grupos (admite `seed` opcional) (`200 OK`).
- `POST /championships/{championshipId}/fixtures`: generar fixture de grupos (`201 Created`, `409` si ya existe).
- `GET /championships/{championshipId}/groups`: listar grupos y equipos (`200 OK`).
- `GET /championships/{championshipId}/matches`: listar partidos por filtros de fase/fecha (`200 OK`).

- `PUT /matches/{matchId}/result`: registrar/actualizar resultado (`200 OK`).
- `GET /championships/{championshipId}/groups/{groupId}/standings`: tabla de posiciones de grupo (`200 OK`).
- `POST /championships/{championshipId}/stages/knockout/generate`: generar cruces de eliminacion (`201 Created`, `422` si faltan clasificados).
- `GET /championships/{championshipId}/stages/knockout/bracket`: consultar cuadro eliminatorio (`200 OK`).

Convenciones de contrato:
- IDs en formato UUID.
- Campos de fecha/hora en ISO-8601 UTC.
- Paginacion estandar (`page`, `pageSize`, `total`) en listados que puedan crecer.
- Errores de dominio uniformes con payload: `code`, `message`, `details`, `traceId`.

Codigos de estado esperados:
- `200`, `201`, `204` para operaciones exitosas.
- `400` para payload invalido.
- `404` para recurso inexistente.
- `409` para conflictos de estado (ej: fixture duplicado).
- `422` para violaciones de reglas de negocio (ej: cupo incompleto, clasificacion pendiente).
