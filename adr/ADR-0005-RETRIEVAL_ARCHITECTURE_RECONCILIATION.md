---
id: ADR-0005
title: Retrieval Architecture Reconciliation
version: 1.0.0
status: Accepted
owner: Atlas Architecture Board
depends_on:
  - ADR-0002-PLANNING_CONSOLIDATION
  - ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION
  - ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP
created: 2026-08-04
---

# ADR-0005 — Retrieval Architecture Reconciliation

**Status:** Accepted — 2026-08-04

---

## 1. Purpose

El propósito de ADR-0005 es resolver, con autoridad documental, la arquitectura constitucional de Retrieval (Phase 6) antes de que exista implementación de `@atlas/retrieval`. Específicamente, este ADR resuelve:

a) formalmente OI-0005 de `ADR-0004` (colisión Retrieval Provider vs. RetrievalProvider);
b) el estatus documental de la serie `spec/engine/ATLAS-104`/`ATLAS-105`;
c) el pipeline canónico único de Retrieval;
d) ownership y dependency rules definitivos para la Capability Retrieval.

---

## 2. Scope

**Qué modifica ADR-0005:**

- La clasificación arquitectónica de Retrieval y la relación entre las entidades E1–E9 identificadas en la reconciliación previa.
- El estatus de `ATLAS-104-SEARCH_ENGINE` y `ATLAS-105-RETRIEVAL_ENGINE` respecto al set Domain/Intelligence.
- El pipeline canónico de Retrieval.
- Las reglas de dependencia y ownership de paquete para `@atlas/retrieval`.
- El cierre formal de OI-0005.

**Qué NO modifica ADR-0005:**

- Memory (Frozen/Certified — código y contratos, incluyendo `MEMORY-CONTRACT-004` y su implementación). Esta protección aplica a contratos Frozen y código certificado de Memory; no impide señalar inconsistencias en documentos Draft relacionados (ver D7).
- `ADR-0004` (Rules, Open Issues, taxonomía Pipeline Runtime/Agent Runtime ya resueltas).
- `ADR-0002` ni `ADR-0003` — se referencian y se apoya en ellos, pero no se altera su texto ni sus decisiones.

**Qué queda fuera de alcance:**

- Cualquier definición de Sprint 12A/12B/12C/12D — no tienen base documental (confirmado por búsqueda exhaustiva).
- Diseño de clases, interfaces, paquetes o cualquier artefacto de implementación.
- Resolución del patrón general identificado como Riesgo 3 en la reconciliación (posible recurrencia del problema "Provider Intelligence-layer sin anclar a Engine certificado" en Context, Reasoning y Planning) — se registra como Open Issue (OI-0002), no se resuelve en este ADR.
- Cualquier cambio a `@atlas/search` o a la Capability Search en general, más allá de señalar su relación (o falta de ella) con `ATLAS-104`.

---

## 3. Context

`ATLAS_ARCHITECTURE_MASTER.md` §Phase 5 declara Phase 5 (Memory) **Complete** (officially closed after Sprint 11E.2), con seis certificaciones verificadas directamente contra `git tag` y `VERSION.md`.

El mismo documento, §Phase 6, declara: *"Status: Planned. Retrieval introduces selective access to stored knowledge and experiences. Pipeline: Knowledge ↓ Memory ↓ Retrieval."* — Phase 6 no tiene, más allá de esa frase, ninguna descomposición operativa.

Previo a este ADR se ejecutaron dos documentos de trabajo, ya aprobados y no repetidos aquí: (1) una auditoría documental completa de Retrieval (10 preguntas, evidencia/inferencia/opinión separadas), y (2) un documento de reconciliación arquitectónica (inventario E1–E9, clasificación, relaciones, colisiones, duplicidades, riesgos, preguntas abiertas, decision candidates DC1–DC10).

El hallazgo central que motiva este ADR es OI-0005 de `ADR-0004`.

El patrón de trabajo (auditoría documental → reconciliación → ADR) replica el usado para Memory (`ADR-0003`) y para Runtime (`ADR-0004`).

---

## 4. Relationship to Prior ADRs

### ADR-0002 — Planning Consolidation

`ADR-0002` enumera "Retrieval Provider" como uno de cinco prerrequisitos (junto a Memory Provider, Context Builder, Reasoning Engine, Agent Runtime) que deben existir antes de consolidar Planning: *"No se modificará el código de `@atlas/intelligence` hasta completar la implementación de: 1. Memory Provider 2. Retrieval Provider 3. Context Builder..."*

ADR-0005, al resolver qué es y cómo se estructura "Retrieval Provider", avanza directamente uno de los cinco prerrequisitos que ADR-0002 dejó pendientes — sin modificar el texto ni las decisiones de ADR-0002.

### ADR-0003 — Memory Architecture Resolution

`ADR-0003` declara: *"La presente resolución complementa ADR-0002: estabiliza la arquitectura interna de `@atlas/memory` como prerrequisito de la cadena cognitiva Goal → Context → Memory → Retrieval → Reasoning → Planning definida en ADR-0002."*

Bajo la autoridad de ADR-0003, `MEMORY-CONTRACT-004` (RetrievalProvider interno de Memory) quedó Frozen y certificado (`memory-providers-certified`).

ADR-0005 trata esta certificación como una condición de frontera fija: no la reabre, no la renombra, no la reinterpreta. La relación entre esta entidad y la Capability Retrieval se resuelve únicamente desde el lado de la Capability, nunca modificando lo ya certificado por ADR-0003.

### ADR-0004 — Execution Model and Runtime Ownership

`ADR-0004`, OI-0005: *"Cuando se implemente Retrieval deberá revisarse el conflicto terminológico existente... Este ADR únicamente registra el problema. No modifica su nomenclatura."* — delega explícitamente el problema central de este ADR.

`ADR-0004`, Rule 3: *"Agent Runtime depende de: Memory, Retrieval, Context, Reasoning, Pipeline Runtime."*

`ADR-0004` declara explícitamente: *"Este ADR no modifica el comportamiento funcional de: Memory, Retrieval, Context, Reasoning, Planning, SDK, Compiler, Core."*

ADR-0005 formalmente cierra OI-0005 (que ADR-0004 dejó abierto) y hereda sin alterar la Rule 3 (Agent Runtime → Retrieval) como restricción de frontera ya aceptada. ADR-0005 no reabre ninguna otra Rule, Consequence, ni Open Issue de ADR-0004.

---

## 5. Problem Statement

Existe una colisión de nomenclatura formalmente reconocida por `ADR-0004` (OI-0005) entre "Retrieval Provider" (Capability, `INTELLIGENCE-CONTRACT-003`, Approved) y "RetrievalProvider" (interno de Memory, `MEMORY-CONTRACT-004`, Frozen, ya implementado) — sin resolver a la fecha.

Existen al menos cinco colisiones o inconsistencias adicionales, ninguna reconocida por ningún ADR: (i) tres modelos arquitectónicos distintos e incompatibles para "qué es Retrieval" (`DOM-005` como Domain, `INTELLIGENCE-CONTRACT-003` como Provider, `ATLAS-105` como Engine con descomposición interna propia); (ii) "Search Engine" (`ATLAS-104`) sin relación documentada con el paquete Planned `@atlas/search`; (iii) "Retrieval Coordinator", presente en el diagrama de `MEMORY-005` pero ausente de su propio contrato Frozen (`MEMORY-CONTRACT-004`); (iv) "Ranking Engine" definido independientemente en `DOM-005` §20 y en `ATLAS-105` §5, sin referencia cruzada; (v) "Memory Provider" (`INTELLIGENCE-CONTRACT-002`, del cual depende formalmente Retrieval Provider según `INTELLIGENCE-CONTRACT-003` §9) carece de toda implementación, y ningún documento declara su equivalencia con el ya certificado Memory Engine (`MEMORY-CONTRACT-001`).

La serie `spec/engine/ATLAS-104`/`ATLAS-105` posee namespace oficial reconocido por `ADR-0001`, pero no está referenciada en ningún punto de `ATLAS_ARCHITECTURE_MASTER.md`, y su arquitectura interna no coincide con la de `DOM-005`, que sin embargo la sigue citando como documento relacionado (`DOM-005` §30) sin reconciliar su contenido.

No existe ningún documento que descomponga Phase 6 en unidades de trabajo — a diferencia de Phase 5 (Memory), que tuvo Sprints 11A–11E.2 individualmente delimitados antes de iniciar implementación.

Mientras estas colisiones permanezcan sin resolver, cualquier intento de implementar `@atlas/retrieval` carecería de una única fuente de verdad arquitectónica de la cual partir.

---

## 6. Evidence Matrix

| # | Documento | Sección | Afirmación documental | Relevancia para ADR-0005 |
|---|---|---|---|---|
| 1 | `ADR-0004` | OI-0005 | Registra la colisión Retrieval Provider (Capability) vs. RetrievalProvider (interno Memory); no la resuelve | Es el mandato directo que origina este ADR |
| 2 | `ADR-0004` | Rule 3 | "Agent Runtime depende de: Memory, Retrieval, Context, Reasoning, Pipeline Runtime" | Fija la dirección de dependencia Agent Runtime→Retrieval |
| 3 | `ADR-0004` | Pipeline Runtime clause | "Nunca conoce: Agent, Memory, Context, Retrieval, Reasoning..." | Fija que el Kernel no conoce Retrieval |
| 4 | `ADR-0004` | Scope exclusion | "Este ADR no modifica el comportamiento funcional de: Memory, Retrieval, Context..." | Confirma que ADR-0004 dejó a Retrieval funcionalmente intacto |
| 5 | `ADR-0002` | líneas 30-34, 102-106 | Retrieval Provider listado como 1 de 5 prerrequisitos de Planning | Vincula la resolución de este ADR con el desbloqueo de Planning |
| 6 | `ADR-0003` | línea 54 | Memory Engine estabiliza el paso "Memory" de la cadena Goal→Context→Memory→Retrieval→Reasoning→Planning de ADR-0002 | Confirma la posición de Retrieval en la cadena cognitiva, sin definir el mecanismo de consumo |
| 7 | `ADR-0001` | Tabla de namespaces | Serie Engine (`ATLAS-NNN`, 100+) reconocida como namespace oficial, mismo nivel que Domain/Capability | Da legitimidad formal a `ATLAS-104`/`105`, pese a su desconexión del Master doc |
| 8 | `ATLAS_ARCHITECTURE_MASTER.md` | §5 (Layer 5) | Retrieval listado como Capability, junto a Memory/Context/Reasoning/Planning/Agents/Governance | Clasificación gobernante de más alto nivel |
| 9 | `ATLAS_ARCHITECTURE_MASTER.md` | §15.3 | `@atlas/retrieval` — "Architecture Complete" (Planned, sin implementación) | Confirma estado spec-only |
| 10 | `ATLAS_ARCHITECTURE_MASTER.md` | §17 | Retrieval: Specification Complete / Implementation None / Tests None / Status Planned | Estado de implementación oficial |
| 11 | `ATLAS_ARCHITECTURE_MASTER.md` | §24, Phase 6 | "Status: Planned. Pipeline: Knowledge ↓ Memory ↓ Retrieval" | Única descripción roadmap-level existente |
| 12 | `ATLAS_ARCHITECTURE_MASTER.md` | §20 vs §22 | Grafo de dependencia cognitiva presenta dos representaciones no idénticas (entradas paralelas vs. cadena lineal) | Inconsistencia menor de representación, documentada, no resuelta |
| 13 | `DOM-005` | frontmatter, §31, §30 | Status: Draft. Define Retrieval como Domain con mapeo de implementación propio. Cita `ATLAS-105` como documento relacionado vigente | Fuente de la arquitectura interna "Domain" |
| 14 | `INTELLIGENCE-003` | frontmatter, §9 | Status: Approved. Retrieval termina cuando el contexto está listo, no cuando termina la búsqueda | Define el límite de salida de Retrieval |
| 15 | `INTELLIGENCE-CONTRACT-003` | frontmatter, §9 | Status: Approved. Retrieval Provider consume desde "Memory Provider"; nunca interactúa directamente con Reasoning/Planning/Agent Runtime | Define la cadena de consumo formal de la Capability |
| 16 | `INTELLIGENCE-CONTRACT-002` | frontmatter, §9 | Status: Approved. "Memory Provider" suministra a Context Builder, Retrieval Provider, Reasoning Engine, Workflow Engine, Agent Runtime | Es la entidad de la que depende formalmente Retrieval Provider; sin implementación conocida |
| 17 | `MEMORY-005` | Integration diagram | Memory API → Memory Engine → Retrieval Coordinator → Retrieval Provider → Storage Provider | Único documento que menciona "Retrieval Coordinator" |
| 18 | `MEMORY-CONTRACT-004` | frontmatter, §4, §16 | Status: Frozen. Arquitectura: Memory Engine → Retrieval Provider → Storage+Index (sin Coordinator). Dependency Rules: nunca Planning/Reasoning/Runtime/Execution/Workflow/Agent Runtime | Contrato certificado, mayor autoridad que `MEMORY-005` para este punto |
| 19 | `ATLAS-104` | frontmatter, §1, §18 | Status: Draft. Search Engine — "Buscar descubre... Retrieval selecciona". Related Documents cita la serie Engine ATLAS-100-110 | Arquitectura interna paralela, no reconciliada |
| 20 | `ATLAS-105` | frontmatter, §2, §5 | Status: Draft. Retrieval Engine recibe Search Result, produce Retrieval Package; arquitectura interna propia (Candidate Analyzer/Ranking Engine/Policy Evaluator/Conflict Resolver/Budget Optimizer) | Arquitectura interna incompatible con `DOM-005` |
| 21 | `ATLAS-REASONING-CONTRACT-008` | Architecture Constraints | Reasoning Session nunca depende directamente de Retrieval | Confirma que Retrieval no fluye hacia Reasoning directamente |
| 22 | `VERSION.md` | líneas 21-26, 104-106 | Memory certificado (6 tags); ningún tag relacionado con Retrieval existe todavía | Confirma que Retrieval no tiene certificación propia aún |
| 23 | `VERSION.md` | TD-11E-001 | "Resolve before any capability (Retrieval, Agent, etc.) invokes MemoryEngine from parallel executions" | Señal de riesgo de concurrencia relevante para el futuro consumo de Memory por Retrieval |

---

## 7. Decision Drivers

- **DD1 — Integridad de lo Certificado.** Memory está Frozen/Certified (fila 22). Cualquier resolución candidata se evalúa por si exige o no reabrir código/contratos certificados.
- **DD2 — Coherencia con precedente ADR-0004.** ADR-0004 ya resolvió un problema estructuralmente análogo (ownership Runtime/Workflow/Agent); las decisiones de ADR-0005 se evalúan por su consistencia con ese patrón.
- **DD3 — No generar nueva deuda documental.** Derivada de la fila 12 y de la fila 16: cualquier decisión que resuelva una colisión debe dejar claramente definida su propia cadena de consumo.
- **DD4 — Uso del namespace ya oficial.** Fila 7 (ADR-0001): las decisiones sobre `ATLAS-104`/`105` parten del hecho de que su namespace es legítimo.
- **DD5 — Evidencia suficiente antes de declarar Superseded.** Fila 13 (`DOM-005` §30 cita `ATLAS-105` como vigente): declarar obsolescencia sin abordar esta cita generaría una contradicción documental nueva.
- **DD6 — Owner Constraint** *(no es evidencia, inferencia, ni decisión arquitectónica — es una restricción impuesta directamente por el Owner):* "Debe existir exactamente un pipeline canónico de Retrieval. No se permiten variantes condicionales permanentes."
- **DD7 — Carácter resolutivo del ADR.** Dado que Phase 6 no puede avanzar mientras OI-0005 siga abierto, las Final Decisions se inclinan hacia resolver explícitamente, no hacia posponer, salvo evidencia insuficiente.
- **DD8 — Trazabilidad completa.** Cada Final Decision se cita contra al menos una fila de la Evidence Matrix.

---

## 8. Architectural Principles

- **P1 — Read-Only.** Convergente en `DOM-005` §5, `MEMORY-005` ("Read Only"), `MEMORY-CONTRACT-004` §5 ("Read Only"): Retrieval nunca muta el conocimiento o la memoria que consulta.
- **P2 — Determinism.** Convergente en `DOM-005` §17, `INTELLIGENCE-003` §8, `MEMORY-005` ("Deterministic Behavior"), `MEMORY-CONTRACT-004` §5: mismas entradas producen resultados equivalentes.
- **P3 — Provider/Technology Independence.** Convergente en `DOM-005` §3, `INTELLIGENCE-003` §8, `MEMORY-005`, `MEMORY-CONTRACT-004` §5: Retrieval no depende de una tecnología o proveedor específico.
- **P4 — Explainability.** Convergente en `DOM-005` §21/§25, `INTELLIGENCE-003` §8, `INTELLIGENCE-CONTRACT-003` §11: toda selección debe poder justificarse.
- **P5 — Dirección de dependencia fija.** Filas 2, 3, 6, 15: Retrieval depende de Memory, nunca al revés; Runtime (Kernel) nunca depende de Retrieval; solo Agent Runtime (Capability) lo consume.
- **P6 — Retrieval termina en Context.** Fila 14 (`INTELLIGENCE-003` §9): Retrieval nunca entrega respuestas ni razona; su producto final es Context.
- **P7 — Capability autopropietaria.** Fila 8 (Master §5: "Each capability owns a single domain"): Retrieval no está subordinada a Memory pese a consumirla.

Los principios P1–P7 quedan incorporados como fundamento de las Final Decisions D1–D10 y de las Dependency Rules R1–R8, sin constituir decisiones independientes adicionales.

---

## 9. Final Decisions

### D1 — Clasificación de Retrieval

**Decisión:** Retrieval se clasifica formalmente como **Capability** (Layer 5), modelada internamente vía **Domain** (`DOM-005`) y expuesta externamente vía **Provider contract** (`INTELLIGENCE-CONTRACT-003`). Estas tres clasificaciones no compiten entre sí — son capas complementarias del mismo objeto arquitectónico, replicando el patrón Capability→Domain→Provider ya validado en Memory.

**Fundamento:** filas 8, 13, 15; DD2.

### D2 — No-colisión entre Retrieval Provider (E2) y RetrievalProvider interno de Memory (E3)

**Decisión:** Se declaran formalmente como componentes **no equivalentes y no relacionados**. No se renombra, fusiona ni modifica ninguno de los dos. Cierra **OI-0005** de `ADR-0004`.

**Fundamento:** DD1; fila 15 muestra que E2 consume documentalmente de "Memory Provider" (E9), no de E3; fila 18 confirma que E3 "nunca bypasea el Memory Engine".

### D3 — Prohibición de acoplamiento directo

**Decisión:** La futura `@atlas/retrieval` tiene prohibido importar o depender de `packages/memory/src/providers/retrieval/` (E3) o de cualquier módulo interno de `@atlas/memory`. Todo consumo de Memory por parte de Retrieval ocurre exclusivamente a través de la API pública de Memory Engine.

**Fundamento:** consecuencia directa de D2; DD1; principio de Single Entry Point ya establecido por ADR-0003.

### D4 — Relación entre Retrieval y la interfaz pública de Memory

**Decisión:** Retrieval consume Memory exclusivamente a través de la interfaz pública certificada de Memory (`MEMORY-CONTRACT-001`, Frozen). Ningún componente de Retrieval accede a implementaciones internas de la Capability Memory.

**Decisión:** La implementación concreta que satisface dicha interfaz es responsabilidad exclusiva de la Capability Memory. ADR-0005 no define ni necesita definir qué componente interno la realiza.

**Evidencia:** ningún documento revisado (filas 6 y 16) declara explícitamente que Memory Engine (`MEMORY-CONTRACT-001`) satisface o equivale a Memory Provider (`INTELLIGENCE-CONTRACT-002`). `ADR-0003` línea 54 usa el término genérico "Memory" al describir la cadena cognitiva de `ADR-0002`, no el identificador formal "Memory Provider".

**Decisión:** En consecuencia, ADR-0005 **no declara** esa equivalencia. No la afirma, no la niega, no la asume.

**Decisión:** ADR-0005 no autoriza ni requiere la creación de una segunda implementación de `INTELLIGENCE-CONTRACT-002`. Qué componente satisface formalmente ese contrato queda fuera del alcance resolutivo de esta decisión.

**Inferencia:** la relación entre `INTELLIGENCE-CONTRACT-002` (Memory Provider) y `MEMORY-CONTRACT-001` (Memory Engine) permanece como cuestión documental abierta. Esto no bloquea D2/D3, pero se registra formalmente como Open Issue (OI-0001).

**Fundamento:** filas 6, 16, 18; DD1; DD3; compatible sin fricción con `ADR-0003`, `MEMORY-CONTRACT-001`, `MEMORY-CONTRACT-004` e `INTELLIGENCE-CONTRACT-002`.

### D5 — Estatus de `ATLAS-104` / `ATLAS-105`

**Decisión:** Se preservan como referencia conceptual válida (en particular, la distinción Search-descubre vs. Retrieval-selecciona), pero su **arquitectura interna queda declarada no autoritativa**. `DOM-005` pasa a ser la única arquitectura interna autoritativa de Retrieval. No se declaran obsoletos en su totalidad.

**Fundamento:** DD4 (namespace oficial, fila 7); DD5 + fila 13 (`DOM-005` §30 los cita como relacionados); DD7.

### D6 — Ranking Engine (E7 vs. E8)

**Decisión:** Se retiene `DOM-005` §20 (E7) como el servicio canónico de ranking. `ATLAS-105` §5 (E8) queda no autoritativo, consecuencia directa de D5.

**Fundamento:** consecuencia lógica de D5; DD3.

### D7 — Retrieval Coordinator (E6)

**Decisión:** Se declara que E6 no existe como componente válido. El diagrama de integración de `MEMORY-005` (Draft, fila 17) queda señalado como inconsistente frente a `MEMORY-CONTRACT-004` (Frozen, fila 18), que no lo contempla. Se recomienda corregir el diagrama de `MEMORY-005` para eliminar la referencia — esto es una corrección documental de un documento Draft, no una reapertura de Memory certificado.

**Fundamento:** regla de precedencia ya usada por `ADR-0003` ("1. ADRs aceptados 2. Specs Frozen 3. Specs Draft"); fila 18 prevalece sobre fila 17; DD1.

### D8 — Pipeline canónico único

**Decisión:** Se adopta como único pipeline oficial de Retrieval:

```
Retrieval Request
        ↓
Memory Access  (vía la interfaz pública certificada de Memory, per D4)
        ↓
Candidate Retrieval
        ↓
Ranking
        ↓
Filtering / Selection
        ↓
Retrieval Result
        ↓
Context
```

Excluye explícitamente la etapa "Search Result" de `ATLAS-105`, consistente con D5.

**Fundamento:** filas 11, 14; DD6 (Owner Constraint); D5; D4.

### D9 — Ownership de Retrieval

**Decisión:** Retrieval (Capability) es **autopropietaria** — no subordinada a Memory ni a Runtime. Su única dependencia ascendente obligatoria es Memory (vía Memory Engine, D4). Su único consumidor de la familia Runtime es Agent Runtime (heredado de ADR-0004 Rule 3, sin modificación).

**Fundamento:** fila 8; filas 2, 3 (heredadas sin cambio per §4).

### D10 — Package Ownership

**Decisión:** `@atlas/retrieval` es el único hogar futuro de Retrieval Provider (E2) y de todo componente derivado de `DOM-005`. `packages/memory/src/providers/retrieval/` permanece exclusivamente como implementación privada de E3, sin exportación, per D2/D3.

**Fundamento:** consecuencia directa de D2, D3, D9.

---

## 10. Component Ownership Matrix

| Componente | Clasificación | Owner | Documento gobernante | Estatus | Decisión que lo fija |
|---|---|---|---|---|---|
| Retrieval (Capability) | Capability | Autopropietaria | Master §5 | Planned | D1, D9 |
| Retrieval Domain | Domain | Retrieval | `DOM-005` | Draft — autoritativa para arquitectura interna | D1, D5 |
| Retrieval Provider (E2) | Provider (Capability-level) | Retrieval | `INTELLIGENCE-CONTRACT-003` | Approved, sin implementar | D1, D2 |
| RetrievalProvider interno (E3) | Internal Provider | **Memory** (no Retrieval) | `MEMORY-CONTRACT-004` | Frozen, Certified, implementado | D2, D3 |
| Memory Provider (E9) | Provider (Capability-level) | **To Be Determined** — *Resolution deferred (per D4)* | `INTELLIGENCE-CONTRACT-002` | Approved — realización no determinada | D4 |
| Memory Engine | Interfaz pública certificada | Memory | `MEMORY-CONTRACT-001` | Frozen, Certified | D4 — es la interfaz que Retrieval consume |
| `ATLAS-104` (Search Engine) | Referencia conceptual, no autoritativa | Ninguno (sin owner operativo) | `ATLAS-104` | Draft, parcialmente superada | D5 |
| `ATLAS-105` (Retrieval Engine) | Referencia conceptual, no autoritativa | Ninguno | `ATLAS-105` | Draft, parcialmente superada | D5 |
| Ranking (servicio) | Servicio, parte de Retrieval Domain | Retrieval | `DOM-005` §20 | Draft, canónico | D6 |
| Ranking Engine (`ATLAS-105` §5) | — | — | `ATLAS-105` | No autoritativo | D6 |
| Retrieval Coordinator (E6) | Componente inexistente | N/A | señalado para corrección en `MEMORY-005` | Inconsistencia a corregir | D7 |
| Agent Runtime | Consumidor Runtime-layer de Retrieval | Agent Runtime | `ADR-0004` Rule 3 | Heredado sin modificación | D9 |
| Pipeline Runtime (Kernel) | Nunca depende de Retrieval | N/A | `ADR-0004` | Heredado sin modificación | D9 |

---

## 11. Canonical Retrieval Pipeline

```
Retrieval Request
        ↓
Memory Access  (vía la interfaz pública certificada de Memory, per D4)
        ↓
Candidate Retrieval
        ↓
Ranking
        ↓
Filtering / Selection
        ↓
Retrieval Result
        ↓
Context
```

| Etapa | Responsabilidad |
|---|---|
| Retrieval Request | Representa intención, no implementación |
| Memory Access | Lectura exclusivamente vía Memory Engine (D4); nunca escritura (P1) |
| Candidate Retrieval | Obtención del conjunto de candidatos posibles, sin evaluación de relevancia final |
| Ranking | Ordenamiento por relevancia, explicable (P4) |
| Filtering / Selection | Aplicación de restricciones, determinística (P2) |
| Retrieval Result | Salida trazable, justificable (P4) |
| Context | Punto terminal — Retrieval nunca genera respuestas ni razona (P6) |

---

## 12. Dependency Rules

- **R1.** Retrieval SHALL consumir Memory exclusivamente vía la interfaz pública de Memory Engine. *(D3, D4)*
- **R2.** Retrieval SHALL NOT importar, referenciar, ni depender de ningún módulo interno de Memory, incluyendo RetrievalProvider interno (E3). *(D2, D3)*
- **R3.** Retrieval SHALL NOT depender de Pipeline Runtime (Kernel). *(heredado sin modificación de `ADR-0004`)*
- **R4.** Agent Runtime MAY depender de Retrieval; Retrieval SHALL NOT depender de Agent Runtime ni de ningún componente Runtime-layer. *(D9, heredado de `ADR-0004` Rule 3)*
- **R5.** Retrieval SHALL NOT depender directamente de Reasoning, Planning ni Workflow. *(fila 21; `INTELLIGENCE-CONTRACT-003` §9)*
- **R6.** Retrieval SHALL treat `DOM-005` as the canonical internal architectural reference. *(D5, D6)*
- **R7.** Retrieval SHALL terminar en Context; SHALL NOT producir respuestas finales, razonar, ni construir prompts. *(P6, D8)*
- **R8.** Las operaciones de Retrieval SHALL ser read-only, determinísticas y explicables. *(P1, P2, P4)*

---

## 13. Package Ownership

| Paquete | Posee | Contrato gobernante | Estatus |
|---|---|---|---|
| `@atlas/retrieval` | Retrieval Provider (E2), artefactos de `DOM-005` | `INTELLIGENCE-CONTRACT-003`, `DOM-005` | Planned |
| `packages/memory/src/providers/retrieval/` | RetrievalProvider interno (E3), privado | `MEMORY-CONTRACT-004` | Frozen, Certified — nunca exportado ni importado por `@atlas/retrieval` |
| `@atlas/memory` (superficie pública / Memory Engine) | Interfaz que `@atlas/retrieval` consume | `MEMORY-CONTRACT-001` | Frozen, Certified |

Ningún paquete tiene asignada la responsabilidad de implementar `INTELLIGENCE-CONTRACT-002` (Memory Provider) — D4 dejó esa pregunta explícitamente abierta (ver OI-0001).

---

## 14. Alternatives Considered

| Decisión afectada | Alternativa considerada | Por qué se rechazó |
|---|---|---|
| D2 | Renombrar RetrievalProvider interno de Memory (E3) para eliminar la colisión léxica | Exige reabrir `MEMORY-CONTRACT-004` (Frozen/Certified) sin beneficio arquitectónico — viola DD1 |
| D4 | Declarar que Memory Engine satisface formalmente Memory Provider | Excede el nivel de evidencia disponible |
| D4 | Exigir la construcción de una implementación separada de Memory Provider antes de autorizar Retrieval | Sin evidencia de necesidad funcional; crearía una capa sin propósito claro — viola DD3 |
| D5 | Declarar `ATLAS-104`/`ATLAS-105` obsoletos en su totalidad | `DOM-005` §30 los cita como relacionados; namespace oficial (`ADR-0001`) — evidencia insuficiente (DD5) |
| D5 | Mantenerlos plenamente vigentes sin reserva | Su arquitectura interna nunca fue reconciliada con `DOM-005`, y el Master doc los ignora totalmente |
| D7 | Formalizar "Retrieval Coordinator" como componente oficial | Violaría la regla de precedencia Frozen > Draft ya usada por `ADR-0003` |
| D8 | Mantener dos pipelines coexistentes (uno DOM-005, otro ATLAS-105) | Rechazada explícitamente por Owner Constraint DD6 |
| General | Posponer ADR-0005 y proceder directo a Sprint 12 | Repetiría el error que motivó `ADR-0004`; OI-0005 exige resolución previa |

---

## 15. Consequences

**Positivas:**
- OI-0005 (`ADR-0004`) queda formalmente cerrado.
- Existe, por primera vez, un pipeline único y no ambiguo para Retrieval (D8).
- La arquitectura interna de Retrieval queda anclada a una referencia canónica (D5/R6).
- Ownership explícito y trazable (Component Ownership Matrix).
- Ningún contrato Frozen/Certificado fue modificado — costo de gobernanza mínimo.

**Negativas / deuda aceptada:**
- La relación Memory Provider (E9) vs. Memory Engine permanece **To Be Determined** (D4) — trasladada a Open Issues.
- `ATLAS-104`/`ATLAS-105` no quedan completamente resueltos: su arquitectura interna es no autoritativa, pero los documentos en sí no se reescriben aquí.
- La inconsistencia de `MEMORY-005` (Retrieval Coordinator) queda señalada, no corregida por este ADR.
- El patrón identificado en D4 podría repetirse en Context/Reasoning/Planning — riesgo fuera de alcance (Scope).

**Qué NO cambia:**
- Memory (contratos, código, certificaciones) permanece intacto.
- `ADR-0002`, `ADR-0003`, `ADR-0004` permanecen sin modificación textual.
- No se crea ningún paquete, clase ni línea de código.
- No se define Sprint 12A–D.

---

## 16. Migration Strategy

No hay migración de código. Existing certified artifacts remain valid without modification. `@atlas/retrieval` permanece en `0.0.0`/bootstrap stub; ningún archivo de `packages/memory` se modifica como parte de este ADR.

Acciones de documentación de seguimiento (no ejecutadas por este ADR):

- **M1.** Corregir `MEMORY-005` (Draft) eliminando el diagrama con "Retrieval Coordinator", alineándolo con `MEMORY-CONTRACT-004` (D7).
- **M2.** Añadir en `ATLAS-104` y `ATLAS-105` una nota de estatus reflejando que su arquitectura interna es no autoritativa frente a `DOM-005` (D5).
- **M3.** Actualizar `DOM-005` §30 para reflejar explícitamente la relación jerárquica con `ATLAS-104`/`ATLAS-105` resuelta en D5.

---

## 17. Open Issues

- **OI-0001.** Relación entre Memory Provider (`INTELLIGENCE-CONTRACT-002`) y Memory Engine (`MEMORY-CONTRACT-001`) — explícitamente dejada abierta por D4. *Trigger: cuando exista necesidad funcional real de instanciar Memory Provider como componente independiente.*
- **OI-0002.** Posible recurrencia del patrón identificado en D4 en Context, Reasoning o Planning — fuera de alcance de este ADR. *Trigger: antes de iniciar Phase 7 (Context) o cualquier ADR futuro sobre ownership de Context/Reasoning/Planning.*
- **OI-0003.** Relación entre `ATLAS-104` y el paquete Planned `@atlas/search` — no determinada por D5. *Trigger: al iniciar la planificación arquitectónica de `@atlas/search`.*
- **OI-0004.** Ejecución de las acciones de documentación M1–M3. *Trigger: antes de que un lector externo consulte `MEMORY-005`/`ATLAS-104`/`ATLAS-105` sin el contexto de este ADR.*
- **OI-0005** *(numeración propia de ADR-0005)*. Si la distinción conceptual Search→Retrieval debe eventualmente materializarse en `@atlas/search`, o si permanece como principio sin implementación asociada.

---

## 18. Validation Rules

- **V1.** Ningún archivo bajo `packages/retrieval/` puede importar de `packages/memory/src/providers/` (deriva de R2).
- **V2.** Ningún archivo bajo `packages/memory/src/providers/retrieval/` puede exportarse desde `packages/memory/src/index.ts` (deriva de D2/D3).
- **V3.** Toda referencia a "Retrieval Provider" en documentación nueva debe desambiguar explícitamente entre `INTELLIGENCE-CONTRACT-003` (Capability) y `MEMORY-CONTRACT-004` (interno) — prohibido el término desnudo (deriva de D2).
- **V4.** Cualquier cambio al pipeline de Retrieval debe referenciar explícitamente D8; no se permiten pipelines alternativos coexistentes (deriva de DD6/D8).
- **V5.** Retrieval implementations SHALL preserve the canonical pipeline defined in D8 and SHALL expose observable architectural boundaries between each pipeline stage.

---

## 19. Superseded Statements

- **S1.** La arquitectura interna operativa de `ATLAS-105` §5 (Candidate Analyzer, Evidence Collector, Ranking Engine, Policy Evaluator, Conflict Resolver, Budget Optimizer, Retrieval Resolver) queda **Superseded** como arquitectura interna de Retrieval, reemplazada por `DOM-005` (D5, D6). El documento `ATLAS-105` **no** queda Superseded en su totalidad — su valor conceptual se preserva.
- **S2.** The internal decomposition of `ATLAS-104` (Search Engine) is no longer authoritative for Retrieval architecture (D5, D8 excluye la etapa "Search Result"). El documento `ATLAS-104` **no** queda Superseded en su totalidad.
- **S3.** El diagrama de integración de `MEMORY-005` que incluye "Retrieval Coordinator" queda **Superseded** por `MEMORY-CONTRACT-004` (D7), por precedencia Frozen > Draft.

Ningún otro documento (Memory Engine, Memory Provider, `DOM-005`, `INTELLIGENCE-CONTRACT-002/003`, `ADR-0002/0003/0004`) queda Superseded ni modificado.

---

## 20. Future Work

- Definir la descomposición de Phase 6 en unidades de trabajo ejecutables — pospuesto hasta después de la aceptación de este ADR.
- Evaluar sistemáticamente si el patrón de OI-0002 aplica a Context, Reasoning y Planning, antes de que cada una de esas fases inicie.
- Ejecutar M1–M3.
- Si se decide construir `@atlas/search`, someterla a su propia auditoría/reconciliación documental antes de cualquier ADR relacionado.

---

## 21. References

`ATLAS_ARCHITECTURE_MASTER.md` · `VERSION.md` · `ADR-0001-DOCUMENT_ID_NAMESPACE.md` · `ADR-0002-PLANNING_CONSOLIDATION.md` · `ADR-0003-MEMORY_ARCHITECTURE_RESOLUTION.md` · `ADR-0004-EXECUTION-MODEL-AND-RUNTIME-OWNERSHIP.md` · `spec/domain/ATLAS-DOM-005-RETRIEVAL_DOMAIN.md` · `spec/engine/ATLAS-104-SEARCH_ENGINE.md` · `spec/engine/ATLAS-105-RETRIEVAL_ENGINE.md` · `spec/intelligence/ATLAS-INTELLIGENCE-003-RETRIEVAL.md` · `spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-002-MEMORY_PROVIDER.md` · `spec/intelligence/contracts/ATLAS-INTELLIGENCE-CONTRACT-003-RETRIEVAL_PROVIDER.md` · `spec/memory/ATLAS-MEMORY-005-RETRIEVAL.md` · `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-001-MEMORY_ENGINE.md` · `spec/memory/contracts/ATLAS-MEMORY-CONTRACT-004-RETRIEVAL_PROVIDER.md` · `spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-007-RESULT_PROVIDER.md` · `spec/reasoning/contracts/ATLAS-REASONING-CONTRACT-008-REASONING_SESSION.md`

---

Status: **Accepted**
