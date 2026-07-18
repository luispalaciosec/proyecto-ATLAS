# Atlas

> **Preservamos el conocimiento. Amplificamos el criterio. Escalamos la inteligencia.**

Atlas es una plataforma de ingeniería del conocimiento. Modela, compila y ejecuta conocimiento organizacional como infraestructura permanente — no como prompts efímeros.

**Versión actual:** `0.1.0-alpha` · **Kernel:** `0.1` · **Estado:** Frozen · **Fase Fundacional:** Completada

Ver [`VERSION.md`](./VERSION.md) para el registro oficial de versiones.

---

## Visión

Atlas se divide en dos etapas:

| Etapa | Alcance | Estado |
|-------|---------|--------|
| **Stage 1 — Platform** | Compilación, ejecución, runtime, SDK, CLI | ✅ Completado |
| **Stage 2 — Capabilities** | Knowledge, Memory, Retrieval, Workflow, Agents, Plugins | 🔒 No iniciado |

El Kernel v0.1 es la plataforma estable sobre la que se construirán todas las capacidades futuras.

Documentación fundacional: [`Foundation/`](./Foundation/) · Release oficial: [`Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md`](./Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md)

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
    ├── @atlas/compiler  ← Pipeline de compilación
    ├── @atlas/runtime   ← Ejecución de artifacts
    ├── @atlas/events    ← Eventos de dominio
    └── @atlas/core      ← Primitivas fundacionales
```

**Grafo de dependencias (sin ciclos):**

```text
core → events → compiler → runtime → sdk → cli
```

Especificaciones: [`Architecture/`](./Architecture/) · [`Domain/`](./Domain/) · [`Engine/`](./Engine/) · [`SDK/`](./SDK/)

---

## Estructura del repositorio

```text
ATLAS/
├── Foundation/          # Filosofía, principios, gobernanza
├── Architecture/        # Especificaciones arquitectónicas
├── Domain/              # Modelo de dominio
├── Engine/              # Especificaciones de motores
├── SDK/                 # Especificaciones del SDK
├── Releases/            # Releases oficiales y readiness reports
├── packages/            # Paquetes npm @atlas/*
│   ├── core/            # Kernel — implementado
│   ├── compiler/        # Kernel — implementado
│   ├── events/          # Kernel — implementado
│   ├── runtime/         # Kernel — implementado
│   ├── sdk/             # Kernel — implementado
│   ├── cli/             # Kernel — implementado
│   └── …                # 14 stubs Stage 2 (0.0.0)
├── workspaces/          # Proyectos Atlas de referencia
├── examples/            # Demos técnicas por sprint
├── apps/                # Reservado
├── tools/               # Reservado
└── docs/                # Documentación adicional
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
| **Stage 2 — Knowledge** | 🔒 Próxima | Knowledge Engine (sin iniciar) |
| **Stage 2 — Memory** | 🔒 Pendiente | Memory Engine |
| **Stage 2 — Retrieval** | 🔒 Pendiente | Retrieval Engine |
| **Stage 2 — Workflow** | 🔒 Pendiente | Workflow Engine |
| **Stage 2 — Agents** | 🔒 Pendiente | Agent Engine |
| **Stage 2 — Plugins** | 🔒 Pendiente | Plugin System |

Próximo hito arquitectónico: **Knowledge Capability Layer** (ver Release 001).

---

## Licencia

Consultar repositorio para términos de licencia aplicables.
