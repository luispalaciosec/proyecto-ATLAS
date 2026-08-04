# ATLAS — MVP Implementation Super-Prompt (para Cursor)

**Para:** Cursor (implementador)
**Rol asignado:** Ingeniero de producto ejecutando un plan ya aprobado — NO arquitecto, NO diseñador de dominio.
**Fecha:** 2026-08-04
**Estado:** **Complete** — Sprints MVP-1 a MVP-6 entregados (2026-08-04). Ver tabla de cierre en `VERSION.md` § MVP Implementation.
**Autoridad de referencia:** `ATLAS_ARCHITECTURE_MASTER.md`, `VERSION.md`, `adr/ADR-0001` a `adr/ADR-0005` (todos Accepted).

---

## 0. Contexto y reglas no negociables

La arquitectura de ATLAS está **congelada**. `ADR-0001` a `ADR-0005` están cerrados, aceptados y no se reabren. Phase 5 (Memory) está certificada. Phase 6 (Retrieval) tiene su arquitectura resuelta en `ADR-0005`.

A partir de ahora el trabajo es **exclusivamente de implementación**, con el objetivo de entregar el primer MVP funcional de ATLAS en el menor tiempo posible.

**Reglas obligatorias para todo el trabajo que sigue:**

1. **No proponer ni crear nuevos ADR, manifiestos, constituciones, modelos de dominio ni documentos de arquitectura**, salvo que durante la implementación aparezca una **contradicción arquitectónica real** entre dos documentos ya aceptados (no una ambigüedad de estilo, no una preferencia). Si eso ocurre: detente, reporta la contradicción exacta con cita de documento y sección, y espera instrucción antes de continuar.
2. **Máxima reutilización de código existente.** Antes de escribir cualquier función nueva, verifica si ya existe en el paquete correspondiente. La mayoría de este plan es *wiring*, no lógica nueva.
3. **No crear nuevas capabilities si una integración es suficiente.** Memory, Workflow y Planning ya están certificados — el trabajo es conectarlos, no rediseñarlos.
4. **No introducir abstracciones nuevas.** Replica exactamente el patrón que ya existe en `packages/sdk/src/modules/compiler-module.ts` y `runtime-module.ts` para cualquier módulo nuevo del SDK.
5. **Un sprint = una funcionalidad ejecutable por un usuario al final.** No se considera cerrado un sprint sin poder correr un comando de CLI real y ver el resultado.
6. **No toques `packages/memory/src/providers/retrieval/`, ni ningún módulo interno de `@atlas/memory` fuera de su `index.ts` público.** Esto está fijado por `ADR-0005` (D2, D3, R2) — es una regla de gobernanza, no una sugerencia de estilo.
7. **Ejecuta un sprint a la vez.** Al terminar cada sprint, entrega un reporte de cierre (archivos creados/modificados, comandos para verificar, resultado de tests) y espera aprobación antes de iniciar el siguiente. Este es el mismo protocolo que se usó para certificar Memory (Sprints 11A–11E.2) — no lo cambies.
8. **Verifica siempre contra el código real antes de reportar como hecho.** No describas algo como "funcionando" sin haber corrido el comando correspondiente y pegado su output real en el reporte de cierre.

---

## 1. Inventario de piezas reutilizables (verificado, no especular)

| Necesitas | Ya existe en | Factory/entry point exacto |
|---|---|---|
| Motor de memoria | `packages/memory/src/index.ts` | `createMemoryEngine(consistencyProvider)` o `createMemoryEngine(store, consistencyProvider)` |
| Compilador de workflows | `packages/workflow/src/workflow-compiler.ts` | `createWorkflowCompiler(...)`, `compileWorkflowDefinition(definition)` |
| Motor de planificación | `packages/intelligence/src/planning-engine.ts` | `createPlanningEngine(options)`, `createGoalNormalizer()`, `compilePlanningResult(result)` |
| Patrón de módulo SDK a replicar | `packages/sdk/src/modules/compiler-module.ts`, `runtime-module.ts` | Clase `XModule` con `constructor(bus, options, workspace)` envolviendo el factory del paquete subyacente |
| Patrón de comando CLI a replicar | `packages/cli/src/commands/run-command.ts`, `compile-command.ts` | Clase implementando `CliCommand`, registra vía `program.command(...)`, usa `container.atlasService` y `container.renderer` |
| Patrón de adaptador (para el único glue nuevo real, Sprint 2) | `packages/sdk/src/modules/compiler-module.ts` línea con `KnowledgeProjectionAdapter` | Ya existe un adaptador Knowledge→Compiler — replica esa idea para Workflow→Compiler |

---

## 2. Sprints

### Sprint 1 — ATLAS recuerda

**Objetivo funcional:** un usuario guarda y busca información vía CLI, en la misma sesión de proceso.

**Paquetes afectados:**
- `packages/sdk`: nuevo `packages/sdk/src/modules/memory-module.ts` (clase `MemoryModule`, mismo patrón que `CompilerModule`); agregar `@atlas/memory` a `packages/sdk/package.json` dependencies; exponer `memory: MemoryModule` en `packages/sdk/src/atlas/atlas.ts`.
- `packages/cli`: nuevos comandos `atlas memory store --content "<texto>"` y `atlas memory search --query "<texto>"` en `packages/cli/src/commands/`, registrados igual que los comandos existentes.

**Criterios de aceptación:**
- `atlas memory store --content "hola mundo"` devuelve un id de registro.
- `atlas memory search --query "hola"` devuelve ese registro.
- `packages/memory` no se modifica — solo se consume su `index.ts` público.
- Tests existentes de `@atlas/memory` siguen pasando sin cambios.

**Riesgos:** definir qué `ConsistencyProvider` usa `MemoryModule` por defecto — revisa cómo `createMemoryEngine` resuelve el caso sin store explícito (`createInMemoryProviderStack()`).

**Dependencias:** ninguna.

**Tiempo estimado:** 1–2 días.

---

### Sprint 2 — De un Goal a una ejecución real

**Objetivo funcional:** un usuario escribe un objetivo en texto y ATLAS lo traduce a un workflow real, lo compila y lo ejecuta — reemplazando el generador de prueba hardcodeado que usa `atlas run` hoy (`#createSummaryGenerator()` en `atlas-service.ts`).

**Paquetes afectados:**
- `packages/sdk`: nuevo `PlanningModule` (envuelve `createPlanningEngine`, `createGoalNormalizer`) y nuevo `WorkflowModule` (envuelve `createWorkflowCompiler`/`compileWorkflowDefinition`); agregar `@atlas/workflow` y `@atlas/intelligence` a dependencies.
- `packages/cli`: nuevo comando `atlas plan --goal "<texto>"`.

**Criterios de aceptación:**
- `atlas plan --goal "hacer X"` produce un `WorkflowDefinition` real (no el summary-generator).
- Ese workflow se compila y ejecuta reusando `CompilerModule`/`RuntimeModule` ya existentes.
- El comando muestra el resultado real de ejecución, con el mismo formato que `atlas run` hoy.

**Riesgos — leer con atención:** este sprint contiene el único trabajo genuinamente nuevo de todo el MVP: un adaptador pequeño que traduzca la salida de `WorkflowCompiler` (`PipelineDefinition`) al formato `CreateCompilationUnitParams` que `Compiler` espera. **No diseñes esto desde cero** — replica exactamente el patrón que ya usa `KnowledgeProjectionAdapter` dentro de `compiler-module.ts` para convertir `KnowledgeObject[]` en unidades de compilación. Es el mismo problema con otro tipo de entrada.

**Dependencias:** ninguna técnica real; se recomienda hacerlo después de Sprint 1 solo por orden de entrega.

**Tiempo estimado:** 3–5 días.

---

### Sprint 3 — ATLAS recuerda lo que hace

**Objetivo funcional:** cada ejecución del Sprint 2 se guarda automáticamente en Memory.

**Paquetes afectados:** solo `packages/sdk` — glue entre el flujo de `atlas plan` (Sprint 2) y `MemoryModule` (Sprint 1). No se toca ningún paquete de dominio.

**Criterios de aceptación:**
- Después de `atlas plan --goal "X"`, `atlas memory search --query "X"` encuentra el registro de esa ejecución.
- Repetir con un segundo goal distinto y confirmar que ambos quedan buscables por separado.

**Riesgos:** ninguno técnico relevante.

**Dependencias:** Sprint 1 + Sprint 2, cerrados y verificados.

**Tiempo estimado:** 1 día.

---

### Sprint 4 — Memoria persistente real

**Objetivo funcional:** lo que ATLAS recuerda sobrevive a reiniciar el proceso.

**Paquetes afectados:** nuevo Storage Provider concreto en `packages/memory/src/providers/storage/`, implementando `ATLAS-MEMORY-CONTRACT-002` (Storage Provider). Resuelve `TD-11D-001` (deuda técnica ya aceptada en `VERSION.md`).

**Criterios de aceptación:**
- Guardar un registro, matar el proceso CLI, relanzarlo, buscar el mismo registro y encontrarlo.

**Decisión de implementación (elige la opción, no ambas):** para el MVP, usa un store basado en **archivo JSON en disco** — no SQLite. Es más rápido de entregar, cero dependencias nuevas, y `MEMORY-CONTRACT-002` no exige ninguna tecnología específica. Migrar a SQLite después es un cambio aislado al Storage Provider, no rompe nada por encima.

**Riesgos:** ninguno significativo con la opción JSON.

**Dependencias:** ninguna de los sprints anteriores — puede paralelizarse con Sprint 2.

**Tiempo estimado:** 2–3 días.

---

### Sprint 5 — ATLAS usa lo que recuerda

**Objetivo funcional:** al plantear un goal parecido a uno anterior, ATLAS recupera memoria relevante y la usa como contexto antes de planificar.

**Paquetes afectados:**
- `packages/retrieval/src/`: primera implementación real (hoy es `export {}`). Implementa **únicamente** el pipeline ya fijado en `ADR-0005` D8: `Retrieval Request → Memory Access → Candidate Retrieval → Ranking → Filtering/Selection → Retrieval Result → Context`.
- `packages/sdk`: nuevo `RetrievalModule`, enganchado antes de `PlanningModule` en el flujo de `atlas plan`.

**Criterios de aceptación:**
- Ranking puede ser tan simple como "más reciente primero" o coincidencia de palabras clave — **no se requiere ningún algoritmo sofisticado para el MVP.**
- Ejecutar dos goals similares y verificar (por log o output) que el segundo tuvo acceso a memoria del primero.
- Debe consumir Memory **exclusivamente** vía la API pública de `MemoryEngine` (`packages/memory/src/index.ts`). Prohibido tocar `packages/memory/src/providers/retrieval/` — regla fijada en `ADR-0005` (D2, D3, R2), no negociable.

**Riesgos:** la tentación de implementar la arquitectura completa de `DOM-005` (estrategias, servicios, eventos). No lo hagas — cualquier implementación naive que respete las etapas del pipeline es suficiente para el MVP. Refinar el ranking es trabajo post-MVP.

**Dependencias:** Sprint 1 y Sprint 3 (necesita memoria real que recuperar).

**Tiempo estimado:** 3–4 días.

---

### Sprint 6 — Chat

**Objetivo funcional:** conversación multi-turno en vez de comandos sueltos.

**Paquetes afectados:** `packages/cli` — nuevo comando `atlas chat` (REPL simple). Reutiliza `MemorySession` (ya certificada, `CONTRACT-005`, Sprint 11E.1/11E.2) como portador de estado — **no construyas Context como capability nueva**, no es necesario para esto.

**Criterios de aceptación:**
- `atlas chat` abre una sesión, acepta varios goals seguidos, mantiene el mismo `session_id` entre turnos, y cada turno tiene acceso a la memoria acumulada de turnos previos vía Sprint 5.

**Riesgos:** bajo — es capa de UX sobre trabajo ya hecho.

**Dependencias:** Sprints 1–5, todos cerrados y verificados.

**Tiempo estimado:** 2–3 días.

---

## 3. Explícitamente fuera de este plan

No implementes, no diseñes, no menciones en tus reportes: Agent Runtime, Context como capability completa, Reasoning, Governance, ninguno de los paquetes stub restantes (`graph`, `ontology`, `plugin`, `publisher`, `prompt`, `search`, `validation`, `context-planner`), ni ninguna versión de Retrieval más allá del pipeline mínimo del Sprint 5. Si algo de esto parece "necesario" para resolver un sprint, detente y repórtalo en vez de construirlo — probablemente significa que hay una forma más simple de resolver el sprint sin esa pieza.

## 4. Protocolo de reporte por sprint

Al cerrar cada sprint, entrega:

1. **Archivos creados/modificados** (lista exacta de paths).
2. **Comando(s) para verificar** el criterio de aceptación, con su output real pegado.
3. **Resultado de la suite de tests** (`pnpm test` o equivalente del paquete afectado) — no reportes "tests pasan" sin haberlos corrido.
4. **Cualquier desviación** de este plan (por qué, y qué alternativa tomaste).
5. **Confirmación explícita** de que no se tocó ningún ADR, ningún contrato Frozen, ni `packages/memory/src/providers/retrieval/`.

No avances al siguiente sprint sin que este reporte sea revisado.

---

**Fin del super-prompt. Empieza por el Sprint 1.**
