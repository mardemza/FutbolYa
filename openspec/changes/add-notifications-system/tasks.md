## 1. Backend — Persistencia

- [x] 1.1 Crear entidad `NotificationEntity` y migración PostgreSQL con índices
- [x] 1.2 Registrar entidad en `TypeOrmModule` y crear `NotificationsModule`

## 2. Backend — Servicio emisor

- [x] 2.1 Implementar `NotificationService` con métodos CRUD + `emit()` tipado
- [x] 2.2 Mapear `type` → `category` e icono sugerido
- [x] 2.3 Implementar plantillas de título/body en español (Argentina) por tipo de evento
- [x] 2.4 Tras persistir, invocar gateway WS con `notification:new` + `unreadCount`

## 3. Backend — WebSocket (Socket.IO)

- [x] 3.1 Agregar `@nestjs/websockets`, `@nestjs/platform-socket.io`, `socket.io` en API
- [x] 3.2 Implementar `NotificationsGateway` namespace `/notifications` con auth JWT en handshake
- [x] 3.3 Unir sockets al room `user:{userId}` al conectar
- [x] 3.4 Método `emitToUser(userId, payload)` usado por `NotificationService`
- [x] 3.5 Habilitar CORS/credentials para WebSocket en `main.ts`

## 4. Backend — Hooks de dominio

- [x] 4.1 Emitir `championship.created` en `ChampionshipService.create`
- [x] 4.2 Emitir `team.registered` en `ChampionshipService.createTeam`
- [x] 4.3 Emitir `registration.closed` en `ChampionshipService.closeRegistration`
- [x] 4.4 Emitir `groups.drawn` en `ChampionshipService.drawGroups`
- [x] 4.5 Emitir `fixture.generated` al generar fixture de grupos
- [x] 4.6 Emitir `match.result_updated` en `ChampionshipService.updateMatchResult`
- [x] 4.7 Emitir `championship.phase_changed` en cada transición de `status`

## 5. Backend — API REST

- [x] 5.1 `GET /api/v1/notifications` con paginación y filtros
- [x] 5.2 `GET /api/v1/notifications/unread-count`
- [x] 5.3 `PATCH /api/v1/notifications/:id/read`
- [x] 5.4 `PATCH /api/v1/notifications/read-all`
- [x] 5.5 Tests unitarios/e2e básicos del módulo

## 6. Frontend — WebSocket y estado

- [x] 6.1 Agregar `socket.io-client` en web
- [x] 6.2 Configurar proxy `/socket.io` con `ws: true` en `vite.config.ts`
- [x] 6.3 Crear `NotificationProvider` con conexión JWT, listener `notification:new`, reconexión
- [x] 6.4 Agregar funciones REST en `api.ts` y tipos TypeScript
- [x] 6.5 Hook `useNotifications()` expone `unreadCount`, lista y handlers

## 7. Frontend — UI según diseño Stitch

- [x] 7.1 Crear `NotificationBell` con badge numérico (cap 99+), click → `/notifications`
- [x] 7.2 Integrar `NotificationBell` en `AppShell` reemplazando icono estático
- [x] 7.3 Crear `NotificationItem` (accent bar, icono, título, cuerpo, tiempo relativo, deep link)
- [x] 7.4 Crear `NotificationsPage` con agrupación Hoy/Ayer/Esta semana y paginación
- [x] 7.5 En `/notifications`, prepend notificación al recibir `notification:new` (dedupe por id)
- [x] 7.6 Agregar ruta `/notifications` protegida con `RequireAuth`
- [x] 7.7 Estado vacío: "Sin novedades por ahora"

## 8. Verificación

- [x] 8.1 Probar: crear campeonato → badge campana sube sin refresh
- [x] 8.2 Probar: estar en `/notifications` → nueva notificación aparece en lista y campana
- [x] 8.3 Probar: click campana → navega y carga notificaciones vía REST
- [x] 8.4 Probar reconexión WS tras reinicio de API
- [x] 8.5 Validar change: `openspec validate add-notifications-system --strict`

## 9. Documentación Stitch (referencia)

- [ ] 9.1 Exportar screenshot/HTML de pantalla `99dd47bc88844bc4a7e884815e176d88` a `.stitch-export/` (opcional, gitignored)
