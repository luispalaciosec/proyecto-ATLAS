# Atlas

> **Preservamos el conocimiento. Amplificamos el criterio. Escalamos la inteligencia.**

Atlas es una plataforma de ingeniería del conocimiento. Modela, compila y ejecuta conocimiento organizacional como infraestructura permanente — no como prompts efímeros.

**Versión actual:** `0.1.0-alpha` · **Kernel:** `0.1` (congelado) · **Repositorio:** Milestone 2 completado · **Knowledge:** Sprint 8–9 completados

Ver [`VERSION.md`](./VERSION.md) para el registro oficial de versiones.

---

## Visión

Atlas se divide en dos etapas:

| Etapa | Alcance | Estado |
|-------|---------|--------|
| **Stage 1 — Platform (Kernel)** | Compilación, ejecución, runtime, SDK, CLI | ✅ Completado — v0.1 congelado |
| **Stage 2 — Capabilities** | Knowledge, Memory, Retrieval, Workflow, Agents, Plugins | 🚧 Knowledge en progreso |

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

Especificaciones: [`spec/architecture/`](./spec/architecture/) · [`spec/domain/`](./spec/domain/) · [`spec/engine/`](./spec/engine/) · [`spec/sdk/`](./spec/sdk/)

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
│   └── product/         # Modelo conceptual de producto
├── packages/            # Paquetes npm @atlas/*
│   ├── core/            # Kernel — implementado
│   ├── compiler/        # Kernel — implementado
│   ├── events/          # Kernel — implementado
│   ├── runtime/         # Kernel — implementado
│   ├── sdk/             # Kernel — implementado
│   ├── cli/             # Kernel — implementado
│   ├── knowledge/       # Capability — implementado (v0.2.0)
│   └── …                # 13 stubs Stage 2 (0.0.0)
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
| **Foundation Phase** | ✅ Completada | Specs, monorepo, Kernel v0.1 |
| **Release v0.1.0-alpha** | ✅ Completada | Kernel congelado, RC interno |
| **Milestone 2 — Repository Stabilization** | ✅ Completada | `spec/`, `releases/`, `adr/`, gobernanza ATLAS-012 |
| **Stage 2 — Knowledge** | ✅ Sprint 8–9 | Metamodel, domain, projection → compiler |
| **Stage 2 — Memory** | 🔒 Pendiente | Memory Engine |
| **Stage 2 — Retrieval** | 🔒 Pendiente | Retrieval Engine |
| **Stage 2 — Workflow** | 🔒 Pendiente | Workflow Engine |
| **Stage 2 — Agents** | 🔒 Pendiente | Agent Engine |
| **Stage 2 — Plugins** | 🔒 Pendiente | Plugin System |

Próximo hito: revisión arquitectónica post-Sprint 9.1 (Documentation Alignment).

---

## Licencia

Consultar repositorio para términos de licencia aplicables.
