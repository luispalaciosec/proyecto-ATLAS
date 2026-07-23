# Architecture Decision Records (ADR)

Este directorio aloja las decisiones arquitectónicas formales de Atlas ("Architecture Decision Records").

A diferencia de `spec/`, que contiene especificaciones normativas estables, `adr/` documenta **el razonamiento y el contexto** detrás de una decisión puntual: alternativas consideradas, motivación y consecuencias.

Cada ADR debe registrar como mínimo:

- identificador (`ADR-NNNN`)
- título
- estado (`proposed`, `accepted`, `superseded`, `rejected`)
- contexto
- decisión
- consecuencias

## ADR aceptadas

- [`ADR-0001-DOCUMENT_ID_NAMESPACE.md`](./ADR-0001-DOCUMENT_ID_NAMESPACE.md) — Resolución de colisión `ATLAS-002` (Constitution vs Product Conceptual Model). Estado: **accepted**. Renombrado de archivos diferido a milestone futuro.
- [`ADR-0002-PLANNING_CONSOLIDATION.md`](./ADR-0002-PLANNING_CONSOLIDATION.md) — Consolidación Planning/Workflow pospuesta a Sprint 11. Sprint 10F congelado sin refactor. Estado: **accepted**.

## Contexto histórico

La colisión de identificador `ATLAS-002` fue documentada durante el Milestone 2 (Repository Stabilization). Ver `releases/REPOSITORY_MIGRATION_REPORT.md` para el detalle de la migración que originó este directorio.

Este directorio se creó como ampliación de la raíz del repositorio, aprobada explícitamente por el Architecture Board como parte de Milestone 2. Su inclusión formal en `ATLAS-012-REPOSITORY_GOVERNANCE.md §4` queda pendiente de una actualización futura de ese documento.
