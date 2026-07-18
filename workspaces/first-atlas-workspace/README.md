# First Atlas Workspace

**Milestone 1** — Primer proyecto Atlas completamente funcional.

Proyecto de referencia que demuestra compilación y ejecución de conocimiento utilizando **únicamente el CLI** y el Kernel mínimo.

## Contenido

| Recurso | Descripción |
|---------|-------------|
| [GETTING_STARTED.md](./GETTING_STARTED.md) | Guía completa de inicio |
| [docs/quickstart.md](./docs/quickstart.md) | Inicio rápido (5 minutos) |
| [MILESTONE_1_UX_REVIEW.md](./MILESTONE_1_UX_REVIEW.md) | Revisión UX y mejoras detectadas |
| [knowledge/](./knowledge/) | 3 documentos de conocimiento |
| [atlas.workspace.json](./atlas.workspace.json) | Configuración del proyecto |

## Inicio rápido

```bash
# Desde la raíz del monorepo
pnpm install
pnpm --filter @atlas/cli build
pnpm --filter @atlas/workspace-first demo
```

## Comandos

```bash
cd workspaces/first-atlas-workspace

pnpm doctor    # atlas doctor --workspace .
pnpm compile   # atlas compile --workspace .
pnpm run       # atlas run --workspace .
```

## Conocimiento incluido

| Documento | Dominio |
|-----------|---------|
| Access Control Policy | security |
| Data Retention Policy | compliance |
| Atlas Platform Overview | platform |

## Kernel utilizado

`@atlas/core` · `@atlas/compiler` · `@atlas/events` · `@atlas/runtime` · `@atlas/sdk` · `@atlas/cli`

Sin Knowledge, Memory, Retrieval ni Agent.
