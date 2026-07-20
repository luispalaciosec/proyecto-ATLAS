---
id: RFC-0001
title: Arquitectura Definitiva del Repositorio Atlas
version: 1.0.0
status: superseded
superseded_by: ATLAS-012-REPOSITORY_GOVERNANCE
author: Principal Software Architect Review
date: 2026-07-19
classification: internal
purpose: >
  Definir la estructura definitiva del repositorio Atlas para un horizonte
  de 5–10 años, minimizando deuda técnica y separando especificaciones,
  implementación, documentación y operación del proyecto.
---

# RFC-0001 — Arquitectura Definitiva del Repositorio Atlas

> **Estado: SUPERSEDED** — Reemplazado por [`spec/foundation/ATLAS-012-REPOSITORY_GOVERNANCE.md`](../../../spec/foundation/ATLAS-012-REPOSITORY_GOVERNANCE.md) (aprobado, Milestone 2). Este documento se conserva como registro histórico de la propuesta original. No usar como autoridad estructural.

| Campo | Valor |
|-------|-------|
| **Estado** | ~~Propuesta~~ **Superseded** por ATLAS-012 |
| **Autor** | Revisión Principal Software Architect |
| **Fecha** | 2026-07-19 |
| **Alcance** | Estructura completa del monorepo Atlas (5–10 años) |
| **Autoridad vigente** | `spec/foundation/ATLAS-012-REPOSITORY_GOVERNANCE.md` |

---

## Executive Summary

Atlas tiene una **base conceptual sólida** (Foundation → Domain → Architecture → Engine → SDK) y un **monorepo funcional** con Kernel implementado. Sin embargo, la estructura física del repositorio **ya no refleja su propio modelo de diseño**: hay ~30 entradas en la raíz, carpetas vacías con typos, especificaciones mezcladas con reportes operativos, duplicación `Release/` vs `Releases/`, y un `packages/` plano que no escalará a 200 paquetes.

**Recomendación principal:** reorganizar el repositorio en **cuatro dominios de primer nivel**, no en quince carpetas de especificación sueltas:

```text
ATLAS/
├── spec/          ← QUÉ es Atlas (normativo, estable)
├── decisions/     ← POR QUÉ decidimos (ADRs)
├── proposals/     ← QUÉ proponemos cambiar (RFCs)
├── programs/      ← CÓMO entregamos (releases, sprints, planes)
├── docs/          ← CÓMO se usa (publicación, guías)
├── eng/           ← CÓDIGO (packages, apps, plugins, examples, workspaces)
├── assets/        ← Marca, plantillas no ejecutables
└── [infra raíz]   ← README, VERSION, CI, scripts mínimos
```

**Respuesta directa a la pregunta clave:** sí, las carpetas normativas (`Foundation`, `Architecture`, `Domain`, etc.) **no deben permanecer como raíces independientes a largo plazo**. Deben agruparse bajo `spec/` con sub-taxonomía numerada. `specs/` como nombre plano es un avance, pero **insuficiente por sí solo** — sin subestructura se convierte en otro cajón de sopa a los 1.000 documentos.

**Veredicto:** la organización actual fue adecuada para la Fase Fundacional (0→1). **No es la correcta para 5–10 años.** Requiere reorganización deliberada, no parches incrementales.

---

## 1. Current Repository Analysis

### 1.1 Inventario real de la raíz (estado al 2026-07-19)

| Entrada raíz | Archivos aprox. | Estado |
|--------------|-----------------|--------|
| `Foundation/` | 11 | Activa — specs normativas |
| `Architecture/` | 7 | Activa |
| `Domain/` | 10 | Activa |
| `Engine/` | 11 | Activa |
| `SDK/` | 8 | Activa |
| `Capabilities/` | 9 | Activa (solo Knowledge) |
| `Product/` | 1 | Activa, aislada |
| `Releases/` | 5 | Activa — mezcla releases + sprints + planes |
| `Release/` | 0 | **Vacía / obsoleta** (referencias rotas en docs) |
| `docs/` | 1 | Casi vacía (redirect) |
| `packages/` | ~729 | **Implementación principal** (20 paquetes) |
| `apps/`, `plugins/`, `tools/`, `templates/`, `tests/` | 1 c/u | Placeholders |
| `examples/` | 24 | Demos activas |
| `workspaces/` | 15 | Proyectos de referencia |
| `scripts/` | 3 | Operación CI/dev |
| `Agents/`, `Workflows/`, `Brands/` | 0 | **Placeholders vacíos** |
| `Knowlegde/`, `Organitation/` | 0 | **Typos vacíos** |
| `CORE_IMPLEMENTATION_PLAN.md` | — | Reporte suelto en raíz |
| `IMPLEMENTATION_READINESS_REPORT.md` | — | Reporte suelto en raíz |
| `PHASE_0_BOOTSTRAP_REPORT.md` | — | Reporte suelto en raíz |
| `INFORME-REVISION-ARQUITECTONICA.md` | — | Reporte suelto en raíz |

**Total:** ~30 directorios/archivos conceptuales en raíz + infraestructura JS.

### 1.2 Lo que funciona bien

1. **Taxonomía documental conceptual** — Foundation → Domain → Architecture → Engine → SDK es coherente y pedagógica.
2. **IDs normativos** — `ATLAS-ARCH-002`, `KNOWLEDGE-001`, frontmatter YAML: excelente base para escalar.
3. **Monorepo pnpm + Turbo** — adecuado para 200 paquetes *si* se reestructura `packages/`.
4. **Separación Kernel / Capabilities en código** — `@atlas/core`, `@atlas/compiler` vs `@atlas/knowledge` es correcta.
5. **`workspaces/` y `examples/`** — bien ubicados como consumidores, no como implementación.

### 1.3 Divergencias críticas spec ↔ realidad

| Documento dice | Repositorio hace |
|----------------|------------------|
| ATLAS-ARCH-002: raíz = `apps/`, `packages/`, `docs/`… | 15+ carpetas de spec en raíz |
| ATLAS-000: `Workspace/`, `Apps/` | `workspaces/`, `apps/` (inconsistente) |
| Referencias a `Release/` | Contenido en `Releases/` |
| Stage 2 "no iniciado" en README | `@atlas/knowledge` ya en 0.2.0 |
| `docs/` = documentación oficial | Casi vacío; specs están en raíz |

---

## 2. Problems Found

### P1 — Raíz como namespace plano (deuda estructural)

Cada nueva capability añadirá carpetas en raíz (`Capabilities/Memory/`, `Capabilities/Retrieval/`…). A 10 capabilities + 7 layers de spec = **17+ raíces normativas**. Un nuevo desarrollador no sabe si un archivo va en `Domain/`, `Engine/`, o `Capabilities/`.

### P2 — Confusión ontológica: tres "Knowledge"

| Ubicación | Qué es |
|-----------|--------|
| `../../../spec/domain/ATLAS-DOM-001-KNOWLEDGE_DOMAIN.md` | Spec de dominio |
| `../../../spec/engine/ATLAS-102-KNOWLEDGE_ENGINE.md` | Spec de motor |
| `Capabilities/Knowledge/KNOWLEDGE-*.md` | Spec de capability |
| `packages/knowledge/` | **Implementación** |
| `Knowlegde/` (typo) | Carpeta vacía |

Esto es **aceptable conceptualmente** (son capas distintas), pero **inaceptable físicamente** sin un árbol común que lo haga explícito.

### P3 — Reportes operativos mezclados con especificaciones

`Releases/` contiene hoy:

- Release oficial (`ATLAS-RELEASE-001`)
- Implementation Plan (`KNOWLEDGE_IMPLEMENTATION_PLAN`)
- Sprint integration plan
- Sprint implementation report
- Readiness report

Son **tipos documentales distintos** con ciclos de vida distintos. Mezclarlos impide gobernanza (¿cuál es normativo? ¿cuál es histórico?).

### P4 — Carpetas fantasma y typos

`Agents/`, `Workflows/`, `Brands/`, `Knowlegde/`, `Organitation/` — reservas sin contenido que **degradan la confianza** en la estructura. En un repo de "ingeniería del conocimiento", esto es especialmente dañino.

### P5 — `packages/` plano no escala

20 paquetes hoy. A 200:

- Imposible navegar alfabéticamente
- Sin frontera visual Kernel / Capabilities / Integrations / Infra
- Turbo/pnpm seguirán funcionando, pero **humanos y ownership de equipos fallarán**

### P6 — Sin hogar para ADR/RFC

No existe `adr/` ni `rfc/`. Las decisiones viven dispersas (`../../../spec/foundation/ATLAS-007-DECISION_MODEL.md`, enmiendas AMD-001 en planes de sprint, informes sueltos). A escala multi-equipo esto es insostenible.

### P7 — `docs/` subutilizado

La documentación publicable debería vivir (o generarse) en `docs/`. Hoy es un stub que apunta a la raíz — señal de que **la separación spec/publicación nunca se formalizó**.

### P8 — Product / Brands / Organization mal anclados

- **Product** (`ATLAS-002-CONCEPTUAL_MODEL.md`) es spec de producto, no implementación — correcto en naturaleza, incorrecto como raíz peer de `packages/`.
- **Brands** — activo de marketing/diseño, no arquitectura de software.
- **Organization** — estructura de equipos/procesos; pertenece a gobernanza interna o repo separado, no al árbol técnico principal.

---

## 3. Clasificación absoluta de carpetas actuales

Leyenda: **K** = conocimiento normativo · **I** = implementación · **D** = documentación publicable · **O** = operación del proyecto · **A** = activos · **∅** = vacío/eliminar

| Carpeta / archivo | K | I | D | O | A | Clasificación definitiva |
|-------------------|---|---|---|---|---|--------------------------|
| `Foundation/` | ✓ | | | | | Spec normativa → `spec/00-foundation/` |
| `Architecture/` | ✓ | | | | | Spec normativa → `spec/01-architecture/` |
| `Domain/` | ✓ | | | | | Spec normativa → `spec/02-domain/` |
| `Capabilities/` | ✓ | | | | | Spec normativa → `spec/03-capabilities/` |
| `Engine/` | ✓ | | | | | Spec normativa → `spec/04-engines/` |
| `SDK/` | ✓ | | | | | Spec normativa → `spec/05-interfaces/sdk/` |
| `Product/` | ✓ | | | | | Spec producto → `spec/06-product/` |
| `Agents/` | ∅ | | | | | Eliminar placeholder; spec futura bajo `spec/03-capabilities/agent/` |
| `Workflows/` | ∅ | | | | | Idem |
| `Knowlegde/` | ∅ | | | | | **Eliminar** (typo) |
| `Organitation/` | ∅ | | | | | **Eliminar**; org → `docs/internal/` o repo aparte |
| `Brands/` | | | | | ∅ | → `assets/brand/` cuando exista contenido |
| `Releases/` | | | | ✓ | | → `programs/releases/` |
| `Release/` | | | | ∅ | | Eliminar (duplicado obsoleto) |
| `docs/` | | | ✓ | | | Docs publicables → `docs/public/`, `docs/internal/` |
| `packages/` | | ✓ | | | | → `eng/packages/{kernel,capabilities,integrations,infra}/` |
| `apps/` | | ✓ | | | | → `eng/apps/` |
| `plugins/` | | ✓ | | | | → `eng/plugins/{official,community}/` |
| `examples/` | | ✓ | | | | → `eng/examples/` |
| `workspaces/` | | ✓ | | | | → `eng/workspaces/` |
| `tools/` | | ✓ | | | | → `eng/tools/` |
| `scripts/` | | ✓ | | ✓ | | Mantener en raíz (mínimo) o `eng/scripts/` |
| `templates/` | | | | | ✓ | → `assets/templates/` |
| `tests/` | | ✓ | | | | Cross-integration → `eng/tests/` |
| `.github/` | | | | ✓ | | Raíz (infra) |
| `.changeset/` | | | | ✓ | | Raíz (infra) |
| `README.md`, `VERSION.md` | | | ✓ | ✓ | | Raíz |
| `*IMPLEMENTATION*.md` (raíz) | | | | ✓ | | → `programs/plans/` o `programs/reports/` |
| `INFORME-REVISION*.md` | | | | ✓ | | → `programs/reports/` |
| `node_modules/`, `.pnpm-store/` | | | | | | Infra local (gitignored) |

---

## 4. ¿Raíces independientes o `spec/`?

### Pregunta 1 — ¿Es correcto mantener Foundation, Architecture, Domain, etc. como carpetas de primer nivel?

**Respuesta: No, a largo plazo.**

### Alternativa A — Mantener raíces actuales (status quo)

**Pros:** cero migración.

**Contras:** empeora linealmente con cada capability; imposible aplicar ownership por equipo; links rotos multiplicados.

**Veredicto:** ❌ Rechazada para horizonte 5–10 años.

### Alternativa B — Un solo `specs/` plano

**Pros:** una sola puerta de entrada.

**Contras:** 1.000 archivos en un nivel; pierdes la pedagogía de capas; conflictos de naming.

**Veredicto:** ⚠️ Mejor que hoy, insuficiente solo.

### Alternativa C — `spec/` con taxonomía numerada (recomendada)

```text
spec/
├── 00-foundation/       # Identidad, principios, glosario
├── 01-architecture/     # ARCH-*
├── 02-domain/           # DOM-*
├── 03-capabilities/     # KNOWLEDGE-*, MEMORY-*, …
│   ├── knowledge/
│   ├── memory/
│   └── …
├── 04-engines/          # ENGINE-*
├── 05-interfaces/       # SDK, CLI, REST, GraphQL
│   ├── sdk/
│   ├── cli/
│   └── api/
└── 06-product/          # Modelo conceptual de producto
```

**Pros:**

- Un solo lugar para "dónde va la spec"
- Orden pedagógico preservado (números)
- Escala a 50 capabilities sin tocar la raíz
- Espejo natural con `eng/packages/capabilities/<name>/`

**Contras:** migración one-time; actualizar links.

**Veredicto:** ✅ **Recomendada.**

### Alternativa D — Multi-repo (spec repo + code repo)

**Pros:** separación dura.

**Contras:** Atlas pierde "single source of truth" unificado; version skew spec↔code; peor DX para Sprints pequeños.

**Veredicto:** ❌ Prematura. Monorepo es correcto **si** se estructura bien internamente.

### Justificación técnica

La raíz de un monorepo debe responder **una pregunta por carpeta de primer nivel**. Hoy la raíz responde simultáneamente:

- ¿Qué es Atlas? (Foundation, Domain…)
- ¿Dónde está el código? (packages)
- ¿Qué entregamos? (Releases)
- ¿Qué reservamos para el futuro? (Agents, Brands…)

Eso viola el **Single Responsibility Principle aplicado al filesystem**. Agrupar bajo `spec/` restaura una pregunta por dominio raíz.

---

## 5. Evaluación: carpetas redundantes o mal ubicadas

### Brands, Product, Organization

| Carpeta | ¿Raíz independiente? | Veredicto |
|---------|----------------------|-----------|
| **Product** | No | → `spec/06-product/`. Es definición de oferta, no código. |
| **Brands** | No | → `assets/brand/`. Es identidad visual, no arquitectura. |
| **Organization** | No | → `docs/internal/organization/` o repositorio `atlas-org` separado si crece (HR, equipos, procesos). **Nunca** peer de `packages/`. |

### Otras redundancias

| Problema | Acción recomendada |
|----------|-------------------|
| `Release/` vs `Releases/` | Consolidar en `programs/releases/` |
| `Knowlegde/` vs `Capabilities/Knowledge/` vs `packages/knowledge/` | Eliminar typo; mantener spec y código en rutas espejo |
| Reportes en raíz vs `Releases/` | Mover a `programs/plans/` y `programs/sprints/reports/` |
| `docs/` vacío vs specs en raíz | Specs → `spec/`; guías → `docs/public/` |

**Crítica directa:** reservar raíces vacías (`Agents/`, `Workflows/`, `Brands/`) "por si acaso" **es un antipatrón**. En Atlas, las capabilities futuras deben nacer en `spec/03-capabilities/<name>/` cuando haya contenido, no como carpetas fantasma.

---

## 6. Recommended Repository Architecture (definitiva)

Estructura objetivo para un proyecto que crecerá durante 5–10 años:

```text
ATLAS/
│
├── README.md                          # Mapa del repositorio
├── VERSION.md                         # Registro de versión de producto
├── CONTRIBUTING.md
├── GOVERNANCE.md                      # Reglas del repo (resumen ejecutivo)
│
├── spec/                              # NORMATIVO — qué es Atlas
│   ├── 00-foundation/
│   ├── 01-architecture/
│   ├── 02-domain/
│   ├── 03-capabilities/
│   │   └── <capability>/
│   │       └── KNOWLEDGE-001-*.md
│   ├── 04-engines/
│   ├── 05-interfaces/
│   └── 06-product/
│
├── decisions/                         # ADRs — por qué decidimos
│   └── adr/
│       └── ADR-0001-projection-layer.md
│
├── proposals/                         # RFCs — propuestas en revisión
│   └── rfc/
│       └── RFC-0001-repository-architecture.md
│
├── programs/                          # ENTREGA — temporal, histórico
│   ├── releases/                      # ATLAS-RELEASE-*
│   ├── sprints/
│   │   ├── plans/                     # SPRINT9_*_INTEGRATION.md
│   │   └── reports/                   # SPRINT9_IMPLEMENTATION_REPORT.md
│   └── plans/                         # *_IMPLEMENTATION_PLAN.md
│
├── docs/                              # PUBLICACIÓN — cómo usar Atlas
│   ├── public/                        # Externa, web, partners
│   ├── internal/                      # Onboarding, runbooks, org
│   └── generated/                     # Salida de compiladores doc (futuro)
│
├── eng/                               # IMPLEMENTACIÓN
│   ├── packages/
│   │   ├── kernel/                    # core, compiler, events, runtime
│   │   ├── capabilities/              # knowledge, memory, retrieval…
│   │   ├── integrations/              # sdk, cli, rest, graphql
│   │   └── infra/                     # plugin, publisher, validation
│   ├── apps/
│   ├── plugins/
│   │   ├── official/
│   │   └── community/                 # third-party boundary clara
│   ├── tools/
│   ├── examples/
│   ├── workspaces/
│   └── tests/                         # integración cross-package
│
├── assets/                            # NO código, NO spec normativa
│   ├── brand/
│   └── templates/
│
├── scripts/                           # bootstrap CI mínimo
├── .github/
├── .changeset/
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

### Espejo spec ↔ código (regla de oro)

```text
spec/03-capabilities/knowledge/KNOWLEDGE-003-OBJECT_MODEL.md
        ↕ (trazabilidad por ID)
eng/packages/capabilities/knowledge/
        ↕
@atlas/knowledge
```

### Kernel boundary (sin cambio conceptual)

```text
eng/packages/kernel/
  core → events → compiler → runtime
eng/packages/integrations/
  sdk → (depende kernel + capabilities)
  cli → (depende sdk)
```

### Consideraciones explícitas del diseño

| Elemento | Ubicación | Razón |
|----------|-----------|-------|
| Kernel | `eng/packages/kernel/` | Núcleo congelado, ownership platform team |
| Capabilities | `eng/packages/capabilities/` | Crecimiento principal Stage 2 |
| Plugins | `eng/plugins/community/` | Frontera legal/técnica con terceros |
| SDK | `eng/packages/integrations/sdk/` | Fachada, no dominio |
| Runtime | `eng/packages/kernel/runtime/` | Parte del Kernel |
| Workspaces | `eng/workspaces/` | Proyectos consumidores, no plataforma |
| Releases | `programs/releases/` | Hitos de producto, no specs |
| ADRs | `decisions/adr/` | Decisiones irreversibles documentadas |
| RFCs | `proposals/rfc/` | Propuestas antes de norma |

---

## 7. Governance Rules

### 7.1 Qué puede existir en la raíz

| Permitido | Prohibido |
|-----------|-----------|
| `README.md`, `VERSION.md`, `CONTRIBUTING.md`, `GOVERNANCE.md` | Specs sueltas (`*.md` normativos) |
| Infra monorepo (`package.json`, `pnpm-workspace.yaml`, `turbo.json`, tsconfig) | Reportes de sprint/release |
| `.github/`, `.changeset/`, `scripts/` (mínimo) | Carpetas vacías "reservadas" |
| Directorios de primer nivel del modelo (`spec/`, `eng/`, `docs/`, `programs/`, `decisions/`, `proposals/`, `assets/`) | Typos (`Knowlegde/`) |
| | Implementación suelta fuera de `eng/` |

### 7.2 Qué documentos pertenecen a cada carpeta

| Tipo | Ubicación | Ciclo de vida | Ejemplo |
|------|-----------|---------------|---------|
| **Spec normativa** | `spec/**` | Lenta, versionada | `ATLAS-ARCH-003` |
| **ADR** | `decisions/adr/` | Inmutable una vez aceptado | `ADR-0009-projection-adapter` |
| **RFC** | `proposals/rfc/` | Propuesta → aceptada/rechazada | Este documento |
| **Implementation Plan** | `programs/plans/` | Por capability/fase | `KNOWLEDGE_IMPLEMENTATION_PLAN` |
| **Sprint Plan** | `programs/sprints/plans/` | Por sprint | `SPRINT9_*_INTEGRATION` |
| **Sprint Report** | `programs/sprints/reports/` | Histórico | `SPRINT9_IMPLEMENTATION_REPORT` |
| **Release oficial** | `programs/releases/` | Hitos de producto | `ATLAS-RELEASE-001` |
| **Guía de usuario** | `docs/public/` | Publicación | Getting Started |
| **Runbook interno** | `docs/internal/` | Operación | CI, on-call |
| **Package README** | `eng/packages/**/README.md` | Implementación | API del paquete |
| **CHANGELOG** | junto al paquete | Semver | `@atlas/knowledge/CHANGELOG.md` |

### 7.3 Reglas duras

1. **`spec/` nunca contiene código ejecutable** (salvo snippets en fences).
2. **`eng/` nunca contiene specs normativas** — solo README de implementación y CHANGELOG.
3. **`programs/` nunca es normativo** — es histórico/planificación; no reemplaza `spec/`.
4. **`decisions/adr/` nunca se reescribe** — superseded by new ADR.
5. **Todo documento normativo lleva frontmatter** con `id`, `status`, `owner`, `classification`.
6. **`classification: public|internal|restricted`** gobierna qué puede ir a `docs/public/`.
7. **Nueva capability** = carpeta en `spec/03-capabilities/<name>/` **antes** de paquete en `eng/`.
8. **Plugins de terceros** solo en `eng/plugins/community/` — nunca mezclados con official sin namespace.

### 7.4 Qué carpetas nunca deben contener código

- `spec/`
- `decisions/`
- `proposals/`
- `programs/`
- `docs/public/` (salvo assets estáticos de sitio)
- `assets/brand/`

### 7.5 Qué carpetas nunca deben contener Markdown de especificación normativa

- `eng/`
- `programs/`
- `docs/public/` (solo guías, no norma)
- `assets/`

### 7.6 Convenciones de IDs

| Artefacto | Formato | Ejemplo |
|-----------|---------|---------|
| Spec | `ATLAS-{LAYER}-{NNN}` | `ATLAS-ARCH-003` |
| Capability | `{CAP}-{NNN}` | `KNOWLEDGE-001` |
| ADR | `ADR-{NNNN}` | `ADR-0001` |
| RFC | `RFC-{NNNN}` | `RFC-0001` |
| Sprint report | `SPRINT{N}_*` | `SPRINT9_IMPLEMENTATION_REPORT` |
| Release | `ATLAS-RELEASE-{NNN}` | `ATLAS-RELEASE-001` |

---

## 8. Growth Risks

Supuesto: Atlas tendrá 200+ paquetes, miles de documentos, múltiples equipos, plugins de terceros, capabilities opcionales, documentación pública e interna.

| Riesgo | Con estructura actual | Con estructura propuesta |
|--------|----------------------|--------------------------|
| Onboarding lento | "¿Foundation o Domain o Capabilities?" | "Spec → eng, programs es histórico" |
| Links rotos | `Release/` vs `Releases/` ya ocurre | Un solo `programs/` |
| Ownership difuso | Un equipo "posee" `packages/` entero | Equipos por `eng/packages/capabilities/<x>/` |
| Plugins terceros | Sin frontera | `eng/plugins/community/` + spec de contrato |
| Docs pública vs interna | Mezclada | `classification` + `docs/public\|internal` |
| Duplicación spec | Foundation domain model vs Domain/ | Registro central de IDs + lint de duplicados |
| CI lento (200 pkg) | Turbo sin filtro por dominio | Turbo con filtros por dominio + ownership paths |
| Spec obsoleta vs código | README desactualizado | `VERSION.md` + release notes sincronizados |

### ¿La estructura actual soporta ese crecimiento?

**No**, sin reorganización. El monorepo técnico (pnpm/Turbo) aguanta; la **organización cognitiva y de gobernanza** no.

### Evolución adicional (año 3–5, no urgente hoy)

- **Spec registry machine-readable** (`spec/registry.yaml`) para validar IDs únicos.
- **Doc site generado** desde `spec/` + `docs/public/` (Docusaurus/VitePress).
- **CODEOWNERS** por path: `spec/03-capabilities/knowledge/` → `@atlas/knowledge-team`.
- **Optional packages** en npm con tags `@atlas/capability-*` — filesystem refleja optionalidad.

---

## 9. Alternatives Evaluated

| # | Alternativa | Resultado |
|---|-------------|-----------|
| A | Status quo (raíces independientes) | ❌ Rechazada |
| B | `specs/` plano sin sub-taxonomía | ⚠️ Parcial |
| C | `spec/` taxonomía + `eng/` + `programs/` | ✅ **Recomendada** |
| D | Multi-repo spec/código | ❌ Prematura |
| E | Mover todo a `docs/` | ❌ Confunde normativo con publicación |

---

## 10. Migration Strategy

> **Nota:** Esta estrategia es para ejecución futura, después de aprobar este RFC. No ejecutar durante la pausa actual.

### Fase 0 — Congelación (pausa actual)

- No mover carpetas.
- Aprobar RFC-0001.
- Publicar `GOVERNANCE.md` con reglas resumidas.

### Fase 1 — Limpieza sin movimiento semántico (1–2 días)

- Eliminar carpetas vacías y typos (`Knowlegde/`, `Organitation/`, placeholders vacíos).
- Consolidar `Release/` → destino único en `programs/releases/`.
- Mover MD sueltos de raíz → `programs/plans/` o `programs/reports/`.
- Actualizar links rotos.

### Fase 2 — Crear esqueleto nuevo (1 día)

- Crear `spec/`, `eng/`, `programs/`, `decisions/`, `proposals/` con README índice.
- CI: validar que no se añaden specs nuevas en raíz.

### Fase 3 — Migración spec (1 sprint)

- `git mv Foundation → spec/00-foundation` (etc.)
- Tabla de redirección en README raíz por 1 release.

### Fase 4 — Migración eng (1 sprint)

- `git mv packages → eng/packages` con subcategorías kernel/capabilities/integrations/infra.
- Actualizar `pnpm-workspace.yaml`, paths de Turbo, imports si aplica.

### Fase 5 — Gobernanza continua

- ADR obligatorio para cambios estructurales.
- RFC para capabilities nuevas.
- Lint CI: frontmatter, IDs únicos, no markdown normativo en `eng/`.

**Principio:** migración incremental con compatibilidad de links vía tabla de redirección — no big bang.

---

## 11. Risks

| Riesgo | Mitigación |
|--------|------------|
| Links rotos masivos | Script de migración + redirects 6 meses |
| Confusión temporal dual-path | Fase única corta; no convivencia eterna |
| Costo de migración | 2–3 sprints amortizados vs década de deuda |
| Resistencia "ya funciona" | Documentar costo compuesto actual (P1–P8) |
| Over-engineering | Solo 7 raíces conceptuales + eng; no más profundo |
| Equipos ignoran gobernanza | CI enforcement + CODEOWNERS |

---

## 12. Final Recommendation

1. **Aprobar conceptualmente** la reorganización en `spec/ + eng/ + programs/ + decisions/ + proposals/ + docs/ + assets/`.
2. **Rechazar** mantener 15+ carpetas normativas en raíz.
3. **Aceptar** `spec/` agrupado con taxonomía numerada — **mejor que `specs/` plano**.
4. **Eliminar** placeholders vacíos y typos — no esperar contenido para reservar raíz.
5. **Reubicar** Product → spec, Brands → assets, Organization → docs/internal o repo aparte.
6. **Separar** releases / sprint plans / sprint reports / implementation plans en `programs/`.
7. **Instituir** ADR y RFC como ciudadanos de primer nivel antes del Sprint 10.
8. **Reestructurar** `packages/` en categorías antes de superar ~30 paquetes.

**Conclusión:** la pausa en desarrollo es la decisión arquitectónicamente madura. Atlas ha crecido orgánicamente; estabilizar la estructura ahora evita una deuda que será exponencialmente más cara de pagar con 50+ paquetes y múltiples equipos.

---

## Apéndice A — Respuestas a las preguntas originales

| # | Pregunta | Respuesta |
|---|----------|-----------|
| 1 | ¿Raíces independientes vs `spec/`? | Agrupar bajo `spec/` con sub-taxonomía numerada. Raíces actuales no escalan. |
| 2 | Clasificación de todas las carpetas | Ver sección 3 |
| 3 | Redundancias (Brands, Product, Organization) | Ver sección 5 |
| 4 | Estructura definitiva | Ver sección 6 |
| 5 | Reglas de gobierno | Ver sección 7 |
| 6 | Riesgos de crecimiento | Ver sección 8 — estructura actual **no** soporta escala multi-año sin cambio |
| 7 | Formato RFC | Este documento |

---

## Apéndice B — Mapa de migración rápido (referencia)

| Ubicación actual | Ubicación objetivo |
|------------------|-------------------|
| `Foundation/` | `spec/00-foundation/` |
| `Architecture/` | `spec/01-architecture/` |
| `Domain/` | `spec/02-domain/` |
| `Capabilities/` | `spec/03-capabilities/` |
| `Engine/` | `spec/04-engines/` |
| `SDK/` | `spec/05-interfaces/sdk/` |
| `Product/` | `spec/06-product/` |
| `Releases/` | `programs/releases/` (+ subcarpetas sprints/plans) |
| `packages/` | `eng/packages/{kernel,capabilities,integrations,infra}/` |
| `examples/` | `eng/examples/` |
| `workspaces/` | `eng/workspaces/` |
| `Brands/` | `assets/brand/` |
| Reportes sueltos en raíz | `programs/plans/` o `programs/reports/` |

---

## Apéndice C — Estado del repositorio al momento del análisis

- **Kernel:** v0.1 congelado, implementado en `packages/{core,compiler,events,runtime,sdk,cli}`
- **Knowledge capability:** Sprint 8–9 completados (`@atlas/knowledge@0.2.0`, proyección compiler)
- **Paquetes totales:** 20 en `packages/`
- **Specs normativas:** ~57 archivos en carpetas de spec raíz
- **Problemas activos:** `Release/` vacío con referencias a rutas antiguas; contenido en `Releases/`

---

*Documento generado como parte de la pausa arquitectónica. No implica cambios en el repositorio hasta aprobación y plan de migración explícito.*
