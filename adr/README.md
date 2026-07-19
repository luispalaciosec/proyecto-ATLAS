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

## ADR pendiente conocida

**Colisión de identificador `ATLAS-002`.** Dos documentos distintos usan actualmente el mismo identificador:

- `spec/foundation/ATLAS-002-CONSTITUTION.md`
- `spec/product/ATLAS-002-CONCEPTUAL_MODEL.md`

Por decisión explícita durante la migración de Milestone 2 (Repository Stabilization), el documento de Product **se movió físicamente** a `spec/product/` pero **conservó su identificador `ATLAS-002` sin reasignar**, a la espera de que esta ADR defina el namespace correcto para la serie de especificaciones de Product (por ejemplo, `ATLAS-PROD-*`) antes de renombrar el identificador.

Ver `releases/REPOSITORY_MIGRATION_REPORT.md` para el detalle completo de la migración que originó este directorio.

Este directorio se creó como ampliación de la raíz del repositorio, aprobada explícitamente por el Architecture Board como parte de Milestone 2. Su inclusión formal en `ATLAS-012-REPOSITORY_GOVERNANCE.md §4` queda pendiente de una actualización futura de ese documento.
