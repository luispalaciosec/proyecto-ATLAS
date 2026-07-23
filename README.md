# Atlas

> **Preservamos el conocimiento. Amplificamos el criterio. Escalamos la inteligencia.**

Atlas es una plataforma de ingeniería del conocimiento. Modela, compila y ejecuta conocimiento organizacional como infraestructura permanente — no como prompts efímeros.

**Versión actual:** `0.1.0-alpha` · **Kernel:** `0.1` (congelado) · **Architecture Phase:** Completada · **Current Phase:** Implementation · **Next Sprint:** 11A (Memory Engine)

Ver [`VERSION.md`](./VERSION.md) y [`ATLAS_ARCHITECTURE_MASTER.md`](./ATLAS_ARCHITECTURE_MASTER.md) para el registro oficial.

---

## Visión

Atlas se divide en dos etapas:

| Etapa | Alcance | Estado |
|-------|---------|--------|
| **Stage 1 — Platform (Kernel)** | Core, Compiler, Events, Runtime, SDK, CLI | ✅ Completado — v0.1 congelado |
| **Stage 2 — Capabilities** | Knowledge, Workflow, Planning, Memory, Retrieval, Context, Reasoning, Agents | 🚧 Knowledge, Workflow y Planning implementados; Memory → Sprint 11A |

El Kernel v0.1 es la plataforma estable sobre la que se construyen las capabilities.

Documentación normativa: [`spec/foundation/`](./spec/foundation/) · Gobernanza del repositorio: [`spec/foundation/ATLAS-012-REPOSITORY_GOVERNANCE.md`](./spec/foundation/ATLAS-012-REPOSITORY_GOVERNANCE.md) · Release oficial: [`releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`](./releases/ATLAS-RELEASE-001-KERNEL_v0.1.md)

---

## Arquitectura

```text
Developer
    │
    ▼
@atlas/cli          ← Interfaz humana (solo depende de @atlas/sdk)
    │
    ▼
@atlas/sdk           ← API pública del Kernel
    │
    ├── @atlas/compiler   ← Pipeline de compilación
    ├── @atlas/runtime    ← Ejecución de artifacts
    ├── @atlas/events     ← Eventos de dominio
    ├── @atlas/knowledge  ← Knowledge Capability (proyección → compiler)
    └── @atlas/core       ← Primitivas fundacionales
```

**Grafo de dependencias del Kernel (sin ciclos):**

```text
core → events → compiler → runtime → sdk (+ knowledge) → cli
```

Especificaciones: [`spec/foundation/`](./spec/foundation/) · [`spec/runtime/`](./spec/runtime/) · [`spec/intelligence/`](./spec/intelligence/) · [`spec/memory/`](./spec/memory/) · [`spec/reasoning/`](./spec/reasoning/) · [`spec/architecture/`](./spec/architecture/) · [`spec/domain/`](./spec/domain/) · [`spec/engine/`](./spec/engine/) · [`spec/sdk/`](./spec/sdk/)

---

## Estructura del repositorio

```text
ATLAS/
├── adr/                 # Architecture Decision Records
├── spec/                # Especificaciones normativas (fuente única de verdad)
│   ├── foundation/      # Filosofía, principios, gobernanza
│   ├── architecture/    # Especificaciones arquitectónicas
│   ├── domain/          # Modelo de dominio
│   ├── engine/          # Especificaciones de motores
│   ├── sdk/             # Especificaciones del SDK
│   ├── capabilities/    # Especificaciones de capacidades (p. ej. knowledge/)
│   ├── runtime/         # Runtime specs (Sprint 10A–10D)
│   ├── intelligence/    # Intelligence Layer specs
│   ├── memory/          # Memory Engine specs
│   ├── reasoning/       # Reasoning Engine specs
│   └── product/         # Modelo conceptual de producto
├── ATLAS_ARCHITECTURE_MASTER.md  # Referencia arquitectónica consolidada
├── packages/            # Paquetes npm @atlas/*
│   ├── core/            # Kernel — implementado
│   ├── compiler/        # Kernel — implementado
│   ├── events/          # Kernel — implementado
│   ├── runtime/         # Kernel — implementado
│   ├── sdk/             # Kernel — implementado
│   ├── cli/             # Kernel — implementado
│   ├── knowledge/       # Capability — implementado (v0.2.0, stable)
│   ├── workflow/        # Capability — implementado (v0.1.0, frozen, Sprint 10E)
│   ├── intelligence/    # Capability — Planning (v0.1.0, frozen, Sprint 10F)
│   └── …                # 12 stubs Stage 2 (0.0.0)
├── workspaces/          # Proyectos Atlas de referencia
├── examples/            # Demos técnicas por sprint
├── releases/            # Releases oficiales, readiness reports, migration reports
├── docs/                # Documentación humana + proposals/rfc
├── templates/           # Plantillas reutilizables
├── tools/               # Herramientas de desarrollo
├── scripts/             # Scripts de automatización
├── plugins/             # Extensiones de terceros (reservado)
├── apps/                # Reservado
└── tests/               # Reservado (tests cross-package)
```

---

## Quick start

### Requisitos

- Node.js ≥ 20
- pnpm ≥ 9

### Instalación

```bash
git clone <repo-url> atlas
cd atlas
pnpm install
pnpm build
```

### Pipeline de calidad

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

### Flujo oficial del Kernel

```bash
# Compilar el CLI
pnpm --filter @atlas/cli build

# Desde un workspace Atlas
atlas doctor
atlas compile
atlas run
```

---

## Workspaces

| Workspace | Descripción |
|-----------|-------------|
| [`workspaces/first-atlas-workspace/`](./workspaces/first-atlas-workspace/) | **Milestone 1** — primer proyecto Atlas funcional end-to-end |

```bash
pnpm --filter @atlas/workspace-first demo
```

Guía completa: [`workspaces/first-atlas-workspace/GETTING_STARTED.md`](./workspaces/first-atlas-workspace/GETTING_STARTED.md)

---

## Demos

| Demo | Comando |
|------|---------|
| First Atlas Workspace | `pnpm --filter @atlas/workspace-first demo` |
| SDK facade | `pnpm --filter @atlas/example-sdk demo` |
| Knowledge → Compiler (Sprint 9) | `pnpm --filter @atlas/example-knowledge-compiler demo` |
| Runtime | `pnpm --filter @atlas/example-runtime demo` |
| CLI workspace | `pnpm --filter @atlas/example-cli-workspace demo` |
| Compiler events | `pnpm --filter @atlas/example-compiler-events demo` |
| Compiler in-memory | `pnpm --filter @atlas/example-compiler-in-memory demo` |

Índice: [`examples/README.md`](./examples/README.md)

---

## Roadmap

| Fase | Estado | Contenido |
|------|--------|-----------|
| **Architecture Phase** | ✅ Completada | Specs (119), ADRs, Runtime/Workflow/Planning congelados |
| **Foundation Phase** | ✅ Completada | Specs, monorepo, Kernel v0.1 |
| **Release v0.1.0-alpha** | ✅ Completada | Kernel congelado, RC interno |
| **Milestone 2 — Repository Stabilization** | ✅ Completada | `spec/`, `releases/`, `adr/`, gobernanza ATLAS-012 |
| **Stage 2 — Knowledge** | ✅ Sprint 8–9 | Metamodel, domain, projection → compiler |
| **Stage 2 — Runtime** | ✅ Sprint 10A–10D | Execution, Lifecycle, State, Pipeline Engine (frozen) |
| **Stage 2 — Workflow** | ✅ Sprint 10E | Workflow Definition System (frozen) |
| **Stage 2 — Planning** | ✅ Sprint 10F | Cognitive Planning Engine (frozen) |
| **Stage 2 — Memory** | 🚧 Sprint 11A | Memory Engine — **próximo sprint** |
| **Stage 2 — Retrieval** | 🔒 Pendiente | Retrieval Engine |
| **Stage 2 — Context / Reasoning** | 🔒 Pendiente | Context Builder, Reasoning Engine |
| **Stage 2 — Agents / Plugins** | 🔒 Pendiente | Agent Engine, Plugin System |

**Current Phase:** Implementation · **Próximo hito:** Sprint 11A — `@atlas/memory`

---

## Licencia

Consultar repositorio para términos de licencia aplicables.
