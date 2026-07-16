## 1. Fundacion del dominio y persistencia

- [ ] 1.1 Definir entidades y relaciones base (`Championship`, `Team`, `Player`, `Group`, `Match`, `Stage`, `Standing`) en el modelo de dominio.
- [ ] 1.2 Crear esquema de persistencia inicial y migraciones para las entidades del torneo.
- [ ] 1.3 Implementar repositorios/casos de uso para crear y editar campeonato en estado `draft`.
- [ ] 1.4 Implementar validaciones de capacidad fija de 32 equipos y unicidad de equipo por campeonato.

## 2. Gestion de equipos y jugadores

- [ ] 2.1 Implementar casos de uso/API para alta, edicion y baja de equipos durante inscripcion abierta.
- [ ] 2.2 Implementar casos de uso/API para alta y gestion de jugadores por equipo.
- [ ] 2.3 Bloquear modificaciones de plantilla y equipos luego de `registration-closed`.
- [ ] 2.4 Agregar pruebas unitarias de reglas de negocio de registro y validaciones.

## 3. Sorteo de grupos y generacion de fixtures

- [ ] 3.1 Implementar transicion de estado `draft` -> `registration-closed` con validacion de 32 equipos completos.
- [ ] 3.2 Implementar servicio de sorteo de grupos con semilla opcional para reproducibilidad.
- [ ] 3.3 Implementar generador de fechas y encuentros de grupos evitando duplicados.
- [ ] 3.4 Agregar pruebas de cobertura de fixture (todos los cruces requeridos, sin repeticiones).

## 4. Resultados y progresion de fases

- [ ] 4.1 Implementar carga/actualizacion de resultados de partidos de fase de grupos.
- [ ] 4.2 Implementar calculo de tabla de posiciones con criterios de desempate configurables.
- [ ] 4.3 Implementar deteccion de cierre de grupos y clasificacion automatica de equipos.
- [ ] 4.4 Implementar generacion de cruces de eliminacion directa y avance de etapa.

## 5. Endpoints, pruebas integrales y hardening

- [ ] 5.1 Exponer endpoints o comandos de aplicacion para flujo completo (alta, sorteo, fixture, resultados, avance).
- [ ] 5.2 Agregar pruebas de integracion end-to-end del ciclo completo de campeonato.
- [ ] 5.3 Agregar manejo de errores y mensajes de validacion claros para estados invalidos.
- [ ] 5.4 Documentar flujo operativo minimo para organizadores y criterios de aceptacion de negocio.

## 6. Contrato API y documentacion OpenAPI

- [ ] 6.1 Definir DTOs de request/response por endpoint y versionar bajo prefijo `/api/v1`.
- [ ] 6.2 Estandarizar errores HTTP (`400/404/409/422`) con estructura `code`, `message`, `details`, `traceId`.
- [ ] 6.3 Agregar decoradores Swagger (`@ApiOperation`, `@ApiResponse`, `@ApiTags`) en controllers de campeonato, equipos, fixture y fases.
- [ ] 6.4 Publicar y validar contrato OpenAPI en Swagger para todo el flujo de campeonato.
