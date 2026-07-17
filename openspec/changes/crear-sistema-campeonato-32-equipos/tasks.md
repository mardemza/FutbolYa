## 1. Fundacion del dominio y persistencia

- [x] 1.1 Definir entidades y relaciones base (`Championship`, `Team`, `Player`, `Group`, `Match`, `Stage`, `Standing`) en el modelo de dominio.
- [x] 1.2 Crear esquema de persistencia inicial con TypeORM sobre SQLite y migraciones para las entidades del torneo.
- [x] 1.3 Implementar repositorios/casos de uso para crear y editar campeonato en estado `draft`.
- [x] 1.4 Implementar validaciones de capacidad fija de 32 equipos y unicidad de equipo por campeonato.

## 1.5 Infraestructura de base de datos y migraciones

- [x] 1.5.1 Configurar conexion SQLite en `apps/api/data/futbolya.sqlite` y asegurar creacion automatica del archivo al iniciar.
- [x] 1.5.2 Ejecutar migraciones automaticamente en bootstrap (`migrationsRun`) sin usar `synchronize` en entornos de trabajo.
- [x] 1.5.3 Mantener scripts operativos para `migration:run`, `migration:revert` y `migration:generate` usando el DataSource del proyecto.
- [x] 1.5.4 Verificar tabla de control de migraciones y consistencia de esquema tras iniciar la API en limpio.

## 2. Gestion de equipos y jugadores

- [x] 2.1 Implementar casos de uso/API para alta, edicion y baja de equipos durante inscripcion abierta.
- [x] 2.2 Implementar casos de uso/API para alta y gestion de jugadores por equipo.
- [x] 2.3 Bloquear modificaciones de plantilla y equipos luego de `registration-closed`.
- [x] 2.4 Agregar pruebas unitarias de reglas de negocio de registro y validaciones.

## 3. Sorteo de grupos y generacion de fixtures

- [x] 3.1 Implementar transicion de estado `draft` -> `registration-closed` con validacion de 32 equipos completos.
- [x] 3.2 Implementar servicio de sorteo de grupos con semilla opcional para reproducibilidad.
- [x] 3.3 Implementar generador de fechas y encuentros de grupos evitando duplicados.
- [x] 3.4 Agregar pruebas de cobertura de fixture (todos los cruces requeridos, sin repeticiones).

## 4. Resultados y progresion de fases

- [x] 4.1 Implementar carga/actualizacion de resultados de partidos de fase de grupos.
- [x] 4.2 Implementar calculo de tabla de posiciones con criterios de desempate configurables.
- [x] 4.3 Implementar deteccion de cierre de grupos y clasificacion automatica de equipos.
- [x] 4.4 Implementar generacion de cruces de eliminacion directa y avance de etapa.

## 5. Endpoints, pruebas integrales y hardening

- [x] 5.1 Exponer endpoints o comandos de aplicacion para flujo completo (alta, sorteo, fixture, resultados, avance).
- [x] 5.2 Agregar pruebas de integracion end-to-end del ciclo completo de campeonato.
- [x] 5.3 Agregar manejo de errores y mensajes de validacion claros para estados invalidos.
- [x] 5.4 Documentar flujo operativo minimo para organizadores y criterios de aceptacion de negocio.

## 6. Contrato API y documentacion OpenAPI

- [x] 6.1 Definir DTOs de request/response por endpoint y versionar bajo prefijo `/api/v1`.
- [x] 6.2 Estandarizar errores HTTP (`400/404/409/422`) con estructura `code`, `message`, `details`, `traceId`.
- [x] 6.3 Agregar decoradores Swagger (`@ApiOperation`, `@ApiResponse`, `@ApiTags`) en controllers de campeonato, equipos, fixture y fases.
- [x] 6.4 Publicar y validar contrato OpenAPI en Swagger para todo el flujo de campeonato.
