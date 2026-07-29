## 1. Persistencia y dependencias

- [x] 1.1 Agregar deps API: `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, `bcrypt`, tipos correspondientes
- [x] 1.2 Extender `UserEntity` con `displayName` opcional y migracion
- [x] 1.3 Agregar `ownerId` a `ChampionshipEntity` + migracion e indice
- [x] 1.4 Registrar `UserEntity` en TypeORM feature modules

## 2. Modulo Auth API

- [x] 2.1 Crear `AuthModule` con register/login/me, DTOs y Swagger
- [x] 2.2 Implementar hash bcrypt en register y verify en login
- [x] 2.3 Emitir JWT (sub=userId, email) y `JwtAuthGuard`
- [x] 2.4 Pruebas unitarias basicas de register/login

## 3. Ownership en campeonatos

- [x] 3.1 Exigir auth en create y setear `ownerId`
- [x] 3.2 Agregar `GET /championships` listando solo del usuario
- [x] 3.3 Guard/check de ownership en mutaciones y lecturas de organizador
- [x] 3.4 Actualizar Swagger de championships

## 4. Web Login / Register / Sesion

- [x] 4.1 `AuthContext` con token en localStorage y helper `apiRequest` con Bearer
- [x] 4.2 Paginas `/login` y `/register` con estilo FutbolYa
- [x] 4.3 Rutas protegidas + redirect; header con email/displayName
- [x] 4.4 Home: listar campeonatos desde API (`GET /championships`) en vez de solo localStorage
