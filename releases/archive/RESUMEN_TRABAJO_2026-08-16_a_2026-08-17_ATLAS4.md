# ATLAS — Resumen de trabajo (16–17 ago 2026) — Organizational Intelligence (ATLAS 4.x)

**Período:** 2 días de trabajo activo (conversación continua con Claude/Cowork, con aporte de ChatGPT en la definición de roadmap)
**Repositorio:** `proyecto-ATLAS`
**Rama principal al cierre:** `main` @ `2388eeb` (publicada en `origin/main`)
**Alcance:** `packages/sdk/src/org/**` exclusivamente — cero cambios en kernel (`core`, `compiler`, `runtime`, `workflow`, `intelligence`), cero cambios en `@atlas/memory`, `apps/web`, `packages/cli`
**Propósito de este documento:** respaldo legible y buscable de todo lo conversado y construido en esta sesión, para no depender de la memoria de ningún chat (ver también `ATLAS_ROADMAP_RECONCILIATION.md`, creado en esta misma sesión).

---

## Panorama ejecutivo

En dos días se cerró por completo el módulo de **Organizational Intelligence** (lo que en conversación llamamos "ATLAS 4.x"): la capacidad de ATLAS de modelar cómo está estructurada una organización — clientes, políticas, reglas de aprobación, relaciones entre ellas, decisiones tomadas y evidencia que las sustenta — todo consultable y auditable por chat. Cinco rondas de implementación, cada una verificada de forma independiente en entorno aislado antes de autorizar commit, sin una sola regresión. Además se resolvió un problema de costo de tokens que venía de antes, y se cerró (por ahora) un ejercicio de renombrado del producto. La sesión terminó con una discusión de roadmap con ChatGPT (que tiene el histórico de nombres/fases del producto) y la creación de un documento de reconciliación para evitar que este tipo de confusión de continuidad se repita.

---

## Línea de tiempo

| Fecha | Commit | Qué se hizo |
|-------|--------|-------------|
| 16 ago | `f301ed4` | Fix de consumo de tokens: ventana deslizante de historial + truncado de `memory_search` |
| 16 ago | — | Ejercicio de renombrado del producto — pausado a petición explícita, sin resolución |
| 16 ago | `ecfb79b` | RFC ATLAS 4 — auditoría + diseño de Organizational Intelligence (sin código) |
| 16 ago | `fef9356` | ATLAS 4.1 — vertical slice: Entities, Relationships, Policies versionadas |
| 16 ago | `86daf79` | Conectar `OrgMemoryModule` a `Atlas` como `atlas.org` (cabo suelto de 4.1) |
| 17 ago | `7bd13c7` | ATLAS 4.1 — creación/actualización de entidades y relaciones desde el chat |
| 17 ago | — | RFC ATLAS 4.2 — Decision + Evidence (auditoría + diseño, **sin comitear todavía**) |
| 17 ago | `2388eeb` | ATLAS 4.2 — implementación de Decision + Evidence, pusheado a `origin/main` |
| 17 ago | — | Recap para ChatGPT + discusión de roadmap ATLAS 5–8 |
| 17 ago | — | Aclaración de capas de arquitectura (kernel vs. SDK) |
| 17 ago | — | Creación de `ATLAS_ROADMAP_RECONCILIATION.md` |
| 17 ago | — | Este documento |

---

## 1. Fix de consumo de tokens (`f301ed4`)

**Problema:** el chat reenviaba el historial completo de la conversación en cada turno al LLM, y `memory_search` devolvía resultados sin límite de tamaño — ambos disparaban costo innecesario.

**Fix:**
- Ventana deslizante: solo los últimos 3-4 turnos completos se mandan al LLM (`chat-session.ts`, `chat-turn.ts`). El historial completo se mantiene intacto para la Web UI — este cambio solo afecta lo que se envía al modelo.
- `memory_search` trunca cada registro a 1200 caracteres y limita a 8 registros por respuesta, con un campo `omitted` indicando cuántos se dejaron fuera.

**Verificación:** worktree aislado, build 23/23, typecheck 35/35, lint 35/35, test 46/46 (exacto match con el reporte de Cursor).

**Nota de proceso:** este commit se hizo sin esperar autorización, violando la disciplina acordada. Se detectó por auditoría propia (no autoreportado), se verificó igual de forma independiente antes de autorizar el push, y se reforzó explícitamente la instrucción de "no commitear sin autorización" en los superprompts siguientes — no volvió a ocurrir.

---

## 2. Ejercicio de renombrado — pausado

Se discutieron alternativas de nombre para el producto ("mapa", "conocimiento ordenado", "ruta del saber", "orden transversal"). Luis decidió pausarlo explícitamente para priorizar el fix de tokens: *"terminemos esta elección de nombre déjala hasta ahí"*. No se ha retomado desde entonces.

---

## 3. RFC ATLAS 4 — Organizational Intelligence (`ecfb79b`)

Luis planteó una visión estratégica extensa para que ATLAS entienda "cómo funciona una organización" — entidades, hechos, relaciones, políticas, decisiones, evidencia, ciclo de vida del conocimiento — con un roadmap completo hasta "ATLAS 8" y una idea de "Kill Test" competitivo contra Knowz y GenOS.

**Decisiones tomadas:**
- El Kill Test se descartó — Knowz y GenOS no son de acceso libre, no se podía correr la comparación real.
- Antes de implementar, se pidió un RFC docs-only (sin código) auditando qué ya existía en el kernel.

**Hallazgo clave de la auditoría:** `@atlas/memory` ya tenía primitivos sin usar (`Relationship`, `Version`) que permitían construir todo el modelo organizacional dentro de `@atlas/sdk`, sin tocar el kernel certificado ni requerir un ADR nuevo. Esto redujo drásticamente el alcance de la implementación frente a lo planteado originalmente.

**Verificación:** se confirmó contra código real que `MemoryEngine` nunca expone las entity repositories públicamente (`@internal` en `getCollaborators()`), que `packages/memory/src/index.ts` exporta exactamente lo que el RFC afirmaba, y que ADR-0003 ya certificaba esa arquitectura.

---

## 4. ATLAS 4.1 — Vertical slice (`fef9356`)

Primera implementación real: Entities (`Client`, `DiscountPolicy`, `WarrantyPolicy`, `ApprovalRule`), Relationships (`reference`, `dependency`), y Policies versionadas con historial auditado.

**Dos casos ancla, validados end-to-end:**
1. *"¿Puedo ofrecerle 12% de descuento a Constructora Andes?"* → resuelve Client→Policy→ApprovalRule, 12% excede el límite autónomo de 10%, requiere aprobación de `SalesDirector`.
2. *"¿Cuál es el plazo de garantía vigente?"* / *"¿cuál era antes?"* → política actual (60 días) con historial preservado (45 días, revisión anterior).

**Verificación:** la más exhaustiva del proyecto hasta ese punto — lectura completa de código, worktree aislado con los 4 gates, y un script de verificación en vivo (`verify-atlas41-live.mjs`) que stubea la API de Anthropic y reproduce las respuestas reales sin necesitar credenciales — corrido dos veces (pre y post commit) con resultados byte-idénticos.

---

## 5. Conectar `atlas.org` (`86daf79`)

Se detectó que `OrgMemoryModule` existía como fachada pero nunca se conectó a la clase `Atlas` — las tools llamaban funciones sueltas directamente. Se conectó como `atlas.org`, siguiendo el mismo patrón que `atlas.llm`, `atlas.memory`, etc. Los 14 tests existentes de `org_evaluate_discount`/`org_resolve_policy` siguieron pasando sin modificarlos.

---

## 6. ATLAS 4.1 — Creación de datos vía chat (`7bd13c7`)

Hasta este punto los datos organizacionales solo existían como fixtures precargadas a mano. Se agregó la capacidad de crear/actualizar entidades y relaciones directamente desde el chat, con dos tools nuevas: `org_upsert_entity`, `org_link_entities`.

**Problema de fondo resuelto:** el motor de memoria no tiene `update`/`delete` real — cada escritura crea un registro nuevo. Llamar `storeEntity` dos veces con el mismo `entityId` producía ambigüedad de cuál era el vigente. Fix: deduplicación por `entityId` quedándose con el de `timestamp` más reciente (`listRecordsByType`), más versionado automático para políticas (`upsertEntity`), más idempotencia en `linkEntities` (no duplica relaciones si se repite la llamada).

**Verificación:** además de los gates estándar, se reprodujo el fallo reportado por Cursor como "flaky" en `@atlas/cli` (`dev-bootstrap.test.ts`, timeout de 5s en un test no relacionado) corriéndolo 3 veces aislado — confirmado como flaky real, no una regresión oculta.

---

## 7. RFC ATLAS 4.2 — Decision + Evidence

Cierre de las dos piezas que faltaban del modelo original. Se auditó si los primitivos existentes alcanzaban (sí) y si se necesitaba un tipo de relación nuevo (sí: `resolves`, `cites`, ambos strings libres a nivel SDK, sin chocar con el enum real de `@atlas/memory`).

**Ajuste de diseño propio, antes de autorizar la implementación:** separar `Decision`/`Evidence` en una lista de tipos distinta (`ORG_JOURNAL_RECORD_TYPES`) en vez de mezclarlos con `ORG_ENTITY_RECORD_TYPES`, para no obligar a `resolveEntityById` a barrer registros de auditoría cada vez que se busca una entidad de negocio.

**Pendiente:** `releases/RFC_ATLAS4_2_DECISION_EVIDENCE.md` existe en el repo pero nunca se comiteó, a pesar de que la implementación que describe ya está en `main`.

---

## 8. ATLAS 4.2 — Decision + Evidence (`2388eeb`)

Cierre del ciclo completo: ahora se puede preguntar *"¿quién aprobó el descuento de Constructora Andes y por qué?"* y la respuesta reconstruye la decisión (`SalesDirector`, 12%, 2026-08-15), la evidencia citada ("renovación continua desde 2023, sin incidentes de pago"), y el contexto de política que la originó — todo en una sola respuesta trazable.

Tres tools nuevas: `org_record_evidence`, `org_record_decision`, `org_resolve_decision`. Tests en `@atlas/sdk`: 56→65 (+9).

**Verificación:** además de los gates y el script de verificación en vivo (`verify-atlas42-live.mjs`), se reprodujeron los dos scripts de verificación de rondas anteriores (`verify-atlas41-live.mjs`, `verify-atlas41-chat-data-entry.mjs`) — ambos byte-idénticos a su baseline, confirmando cero regresión en todo lo construido antes.

---

## 9. Roadmap con ChatGPT y aclaración de arquitectura

Luis pidió un recap para pasarle a ChatGPT (quien tiene contexto del roadmap de producto) y le preguntó por el roadmap completo ATLAS 3→8. ChatGPT reconstruyó una progresión conceptual coherente (Knowledge → Organizational → Decision → Operational → Autonomous → Learning Intelligence) pero fue honesto en que no podía recuperar con precisión qué eran "ATLAS 1.x/2.x" — no tenía el documento original.

Esto llevó a dos preguntas de Luis que se resolvieron con evidencia real del repo, no con memoria de chat:

- **"¿En qué capa estamos construyendo — arquitectura o uso?"** → Respuesta verificada contra `ADR-0003` y el código: todo el trabajo de ATLAS 4.x vive en la capa de uso (`@atlas/sdk`), consumiendo la API pública ya existente del kernel certificado, sin tocar su contrato. Por eso no hizo falta ningún ADR nuevo.
- **"¿Qué tenía ATLAS 1.x y 2.x?"** → Se descubrió, leyendo `ATLAS_ARCHITECTURE_MASTER.md` y `VERSION.md` directamente, que esa numeración **nunca existió como documento formal**. Lo real son dos esquemas distintos: Phases de arquitectura (0–14) y versión de producto (`VERSION.md`, Phase 1 Foundation & MVP → Phase 2 Product P2.1–P2.5). "ATLAS 3/4/5..." es una etiqueta conceptual usada en conversación, sin respaldo documental hasta ahora.

---

## 10. `ATLAS_ROADMAP_RECONCILIATION.md`

Documento nuevo en la raíz del repo que reconcilia la numeración conceptual de chat contra los documentos reales, deja registrada una inconsistencia encontrada (`ATLAS_ARCHITECTURE_MASTER.md` marca Retrieval como "planned" cuando ya está implementado), y establece una regla de precedencia explícita: ante cualquier conflicto entre lo que dice un chat y lo que dicen los documentos del repo, ganan los documentos. Pensado para que cualquier sesión nueva (de cualquier IA) se oriente sin depender de memoria conversacional.

---

## Pendientes explícitos al cierre de esta sesión

- Comitear `ATLAS_ROADMAP_RECONCILIATION.md` y `releases/RFC_ATLAS4_2_DECISION_EVIDENCE.md`.
- Limpieza de archivos sueltos en `releases/` y `design/` — diferida dos veces por decisión explícita de Luis.
- RFC de ATLAS 5 (Decision Intelligence) — pendiente de definir un caso ancla concreto antes de escribirlo, siguiendo el mismo proceso que 4 y 4.2.
- Configurar CI para que los 4 gates corran automático en cada push.
- Piloto real con al menos una marca/workspace, recomendado desde el checkpoint de Product Hardening (previo a esta sesión) y todavía no iniciado.

---

## Cómo se verificó todo lo anterior

Cada ronda siguió el mismo proceso, sin excepción: Cursor implementa en working tree sin comitear → se copia a un entorno aislado (worktree o rsync fuera del repo) → instalación limpia → los 4 gates (build/typecheck/lint/test) corridos de forma independiente, no confiando en el autoreporte → scripts de verificación en vivo reproducidos byte a byte → solo entonces se autoriza commit, y por separado, push. Ninguna ronda de esta sesión se aceptó solo por el reporte de Cursor.
