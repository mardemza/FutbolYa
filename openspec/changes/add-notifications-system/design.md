## Context

FutbolYa es un monorepo NestJS + React con auth JWT y campeonatos ligados a `ownerId`. El `AppShell` ya renderiza `<Icon name="notifications" />` sin funcionalidad. El diseño visual fue generado en Google Stitch dentro del proyecto existente **Plataforma de Torneos FutbolYa**.

**Referencia Stitch**

| Campo | Valor |
|---|---|
| Proyecto | `15316978161588060486` — Plataforma de Torneos FutbolYa |
| Pantalla | `99dd47bc88844bc4a7e884815e176d88` — Centro de Notificaciones y Panel Desplegable |
| Design system | `assets/70162ae7ea174f098f6810145283d97b` — FutbolYa Performance System |

La pantalla incluye panel desplegable y página completa. **Comportamiento acordado:** click en la campana navega a `/notifications`; el badge numérico se actualiza en tiempo real vía WebSocket.

## Goals / Non-Goals

**Goals:**

- Backend transaccional: persistir notificación y emitir señal WebSocket al `recipientId` en la misma operación.
- API REST para carga inicial, listado paginado y marcado de lectura.
- WebSocket autenticado con JWT para push instantáneo (`notification:new`).
- Campana con badge acumulado de no leídas; lista de `/notifications` se refresca al recibir evento si el usuario está en esa vista.
- Reconexión automática del socket al perder conexión.

**Non-Goals:**

- Push móvil nativo, email o WhatsApp.
- Notificaciones a múltiples roles (solo `ownerId` del campeonato).
- Preferencias de suscripción por tipo (fase 2).
- SSE como canal alternativo (WebSocket único).

## Decisions

### 1. Modelo de datos: tabla `notifications`

Sin cambios respecto al diseño original (ver proposal). Índices en `(recipient_id, created_at DESC)` y parcial de no leídas.

### 2. Emisión REST + WebSocket

Tras persistir la notificación, `NotificationService.emit()`:

1. Guarda en DB.
2. Emite por Socket.IO al room `user:{recipientId}` el evento `notification:new` con payload:

```typescript
{
  notification: NotificationDto,  // notificación recién creada
  unreadCount: number               // total no leídas del usuario
}
```

El cliente **no** infiere el contador sumando localmente; usa `unreadCount` del servidor como fuente de verdad.

**Alternativa descartada:** polling cada 30s — latencia innecesaria y carga constante.

### 3. WebSocket: Socket.IO + NestJS Gateway

Dependencias API:

- `@nestjs/websockets`
- `@nestjs/platform-socket.io`
- `socket.io`

Dependencia web: `socket.io-client`.

**Namespace:** `/notifications`

**Autenticación:** token JWT en `auth.token` del handshake (mismo secret que REST). Gateway valida con `JwtService`; conexiones inválidas se rechazan.

**Rooms:** al conectar, unir socket al room `user:{userId}`.

**Gateway:** `NotificationsGateway` en el módulo notifications, inyectado en `NotificationService` para emitir tras crear notificación.

**CORS:** habilitar credenciales en `main.ts` y en el gateway para el origen del frontend.

**Dev proxy:** extender `vite.config.ts`:

```typescript
'/socket.io': { target: apiUrl, ws: true }
```

### 4. API REST (sin cambios de contrato)

Endpoints bajo `/api/v1/notifications` para bootstrap y acciones:

- Carga inicial de contador y listado al montar la app / entrar a `/notifications`.
- Marcar leída(s) vía REST; opcionalmente emitir `notification:read` por WS en fase 2 (no MVP).

### 5. Flujo en el cliente

```
App mount (sesión activa)
  → REST GET unread-count (estado inicial)
  → Socket connect con JWT
  → Escuchar notification:new
       → actualizar unreadCount en contexto global
       → si pathname === /notifications → prepend notification a lista (o refetch página 1)

Click campana
  → navigate('/notifications')
  → REST GET notifications (trae nuevas + históricas paginadas)

En /notifications + notification:new
  → badge campana += unreadCount del evento
  → insertar notificación al tope de la lista visible (sin duplicar por id)
```

**Provider:** `NotificationProvider` envuelve rutas autenticadas; expone `{ unreadCount, connect, disconnect }`.

**Hook:** `useNotifications()` consume el provider; la página `/notifications` usa el mismo contexto + fetch paginado local.

### 6. Tipos de evento de dominio (MVP)

Sin cambios: `championship.created`, `team.registered`, `registration.closed`, `groups.drawn`, `fixture.generated`, `match.result_updated`, `championship.phase_changed`.

### 7. UI según Stitch

- `NotificationBell`: campana + badge numérico (`99+` cap), `onClick` → `/notifications`.
- `NotificationsPage`: lista agrupada Hoy/Ayer/Esta semana; se actualiza en vivo al recibir `notification:new`.
- Panel dropdown del diseño Stitch: **fase 2** (MVP prioriza navegación directa a la página).

## Risks / Trade-offs

| Riesgo | Mitigación |
|---|---|
| Conexión WS caída | Reconexión automática de socket.io; al reconectar, refetch `unread-count` |
| Notificación duplicada en lista | Deduplicar por `notification.id` al prepend |
| Múltiples tabs abiertas | Cada tab recibe el evento; contador consistente vía `unreadCount` del servidor |
| Emisión WS falla pero DB persiste | Log error; cliente recupera al entrar a `/notifications` o reconectar |
| Proxy dev no enruta WS | Configurar `ws: true` en Vite; documentar en `.env.example` |

## Migration Plan

1. Migración `notifications` + módulo REST.
2. Agregar Gateway Socket.IO y dependencias.
3. Hooks en `ChampionshipService` con emisión WS.
4. Frontend: provider + bell + página con listener WS.
5. Verificar en dos pestañas: evento en una actualiza campana en ambas.

Rollback: desactivar gateway; campana queda estática hasta REST manual.

## Open Questions

- ¿Emitir `notification:read` por WS para sincronizar badge entre tabs al marcar leída? → Fase 2; MVP recalcula contador localmente al marcar leída vía REST.
