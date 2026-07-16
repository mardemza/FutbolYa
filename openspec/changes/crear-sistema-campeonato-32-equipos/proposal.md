## Why

Se necesita una base funcional para gestionar torneos de futbol de 32 equipos de punta a punta, evitando planillas manuales y errores de organizacion. Esto permite crear campeonatos, administrar planteles y generar cruces por fases de forma repetible y trazable.

## What Changes

- Agregar la capacidad de crear y administrar campeonatos con configuracion inicial para 32 equipos.
- Agregar la capacidad de alta y gestion de equipos y jugadores por campeonato.
- Agregar la capacidad de sortear grupos, calendario de fechas y encuentros de manera automatica.
- Agregar la capacidad de gestionar niveles/fases del torneo (grupos y eliminacion directa) y generar cruces de la siguiente fase segun resultados.
- Definir reglas de validacion para evitar estados invalidos (equipos incompletos, sorteos duplicados, avance de fase inconsistente).
- Definir un contrato API REST versionado (`/api/v1`) para exponer el flujo completo via controllers NestJS y documentarlo en OpenAPI/Swagger.

## Capabilities

### New Capabilities
- `championship-management`: Crear, editar y configurar campeonatos de 32 equipos con estados de ciclo de vida.
- `team-and-player-management`: Dar de alta equipos y jugadores, y vincularlos a un campeonato activo.
- `fixture-and-draw-management`: Sortear grupos, generar fechas y encuentros respetando reglas del formato.
- `stage-progression-management`: Administrar fases y niveles del torneo, incluyendo clasificacion y cruces eliminatorios.

### Modified Capabilities
- Ninguna.

## Impact

- Nuevos modulos de dominio para campeonato, equipos, jugadores, fixtures y fases.
- Nuevas reglas de negocio para validaciones y transiciones de estado.
- Nuevos endpoints/API o casos de uso para operaciones de alta, sorteo y avance de fase.
- Requiere persistencia para entidades de torneo y relaciones entre equipos, jugadores y partidos.
- Requiere DTOs, validaciones de entrada/salida y estandarizacion de errores HTTP para clientes web/admin.
