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
