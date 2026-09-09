## Why

El header de FutbolYa ya muestra un icono de campana, pero no existe un centro de notificaciones ni persistencia de eventos del torneo. Los organizadores deben entrar manualmente a cada sección para enterarse de inscripciones, resultados y cambios de fase. Hace falta un sistema que avise en tiempo útil sobre hitos operativos del campeonato.

## What Changes

- Implementar UI de notificaciones según diseño Stitch (panel desplegable en header + página "Centro de Notificaciones").
- Persistir notificaciones por usuario con estado leído/no leído, categoría y enlace de contexto.
- Emitir notificaciones automáticas cuando ocurren eventos de dominio relevantes.
- Exponer API REST para listar, filtrar, marcar como leídas y obtener contador de no leídas.
- Canal WebSocket autenticado (Socket.IO) para push en tiempo real al navegador conectado.
- Integrar badge de no leídas en el icono de campana del `AppShell`; click navega a `/notifications`.
- Actualización instantánea del contador en campana y de la lista cuando el usuario está en la página de notificaciones.

## Capabilities

### New Capabilities

- `notifications`: Centro de notificaciones in-app, persistencia, API de consulta/lectura y generación automática ante eventos del campeonato.

### Modified Capabilities

- Ninguna. Los eventos se enganchan en servicios existentes sin cambiar requisitos funcionales de campeonato, fixture o equipos.

## Impact

- **API NestJS**: nuevo módulo `notifications`, entidad `Notification`, migración PostgreSQL, servicio emisor, controlador REST bajo `/api/v1/notifications` y `NotificationsGateway` WebSocket (Socket.IO).
- **Dominio existente**: hooks en `ChampionshipService` (create, createTeam, closeRegistration, drawGroups, generateFixture, updateMatchResult, avance de fase).
- **Web**: `NotificationBell` con badge, página `/notifications`, `NotificationProvider` con cliente Socket.IO, reconexión y sincronización de estado vía eventos + REST.
- **Infra dev**: proxy WebSocket en Vite hacia la API.
- **Diseño**: pantalla Stitch `Centro de Notificaciones y Panel Desplegable` en proyecto `Plataforma de Torneos FutbolYa` (screen `99dd47bc88844bc4a7e884815e176d88`).
