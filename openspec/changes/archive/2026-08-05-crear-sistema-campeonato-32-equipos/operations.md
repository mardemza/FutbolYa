## Flujo Operativo Minimo (Organizador)

1. Crear campeonato
- Endpoint: `POST /api/v1/championships`
- Resultado esperado: campeonato en estado `draft` con capacidad de 32 equipos.

2. Cargar equipos
- Endpoint: `POST /api/v1/championships/{championshipId}/teams`
- Regla: deben cargarse exactamente 32 equipos unicos por nombre.

3. Cerrar inscripcion
- Endpoint: `POST /api/v1/championships/{championshipId}/close-registration`
- Regla: solo habilitado si `registeredTeams === 32`.

4. Sortear grupos
- Endpoint: `POST /api/v1/championships/{championshipId}/draw`
- Opcional: enviar `seed` para reproducir el sorteo.

5. Generar fixtures de grupos
- Endpoint: `POST /api/v1/championships/{championshipId}/fixtures`
- Resultado esperado: 48 partidos de grupos (8 grupos x 6 partidos).

6. Cargar resultados
- Endpoint: `PUT /api/v1/matches/{matchId}/result`
- Regla: actualizar todos los partidos de grupos antes de generar knockout.

7. Verificar tabla
- Endpoint: `GET /api/v1/championships/{championshipId}/groups/{groupId}/standings`
- Criterios de orden: puntos, diferencia de gol, goles a favor, nombre de equipo.

8. Generar cuadro eliminatorio
- Endpoint: `POST /api/v1/championships/{championshipId}/stages/knockout/generate`
- Regla: bloqueado si hay partidos de grupos pendientes.

9. Consultar bracket
- Endpoint: `GET /api/v1/championships/{championshipId}/stages/knockout/bracket`

## Criterios de Aceptacion de Negocio

- El sistema no permite cerrar inscripcion sin 32 equipos.
- El sorteo no puede ejecutarse fuera de `registration-closed`.
- No se permite generar fixtures duplicados.
- No se puede generar knockout con fase de grupos incompleta.
- Las validaciones de estado devuelven errores consistentes (`code`, `message`, `details`, `traceId`).
