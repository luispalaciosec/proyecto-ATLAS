---
id: ATLAS-MIGRATION-PLAN-001
title: Repository Migration Plan — Milestone 2 (Repository Stabilization)
version: 1.1.0
status: approved
owner: Atlas Architecture Board
created: 2026-07-19
updated: 2026-07-19
depends_on:
  - ATLAS-002-CONSTITUTION
  - ATLAS-003-PRINCIPLES
  - ATLAS-010-PLATFORM_MAPPING
  - ATLAS-012-REPOSITORY_GOVERNANCE
  - ATLAS-013-NAMING_CONVENTIONS
---

# Repository Migration Plan — Milestone 2

> Fase 1 (análisis) y Fase 2 (plan) completadas. **Plan aprobado el 2026-07-19 con 5 ajustes** (ver §0.1). Versión 1.1.0 incorpora esos ajustes. Listo para ejecución (Fase 3).

---

## 0. Resumen ejecutivo

El repositorio actual organiza las especificaciones normativas en siete carpetas raíz en PascalCase (`Foundation/`, `Architecture/`, `Domain/`, `Engine/`, `SDK/`, `Capabilities/`, `Product/`), mezcla reportes operativos sueltos en la raíz, mantiene una carpeta `Releases/` con contenido heterogéneo, y conserva cinco carpetas vacías (algunas con errores tipográficos). Esto viola:

- **ATLAS-012 §4** (Repository Root) — la raíz solo puede contener el conjunto exacto de entradas permitidas.
- **ATLAS-012 §5** (Specifications) — toda especificación normativa debe vivir bajo `spec/`.
- **ATLAS-013 §4 y §6** (Naming Conventions) — directorios en minúscula, separados por guiones.

Este plan reorganiza el repositorio por **responsabilidad** (Layer 1 Specifications, Layer 2 Implementation, Layer 3 Documentation, Layer 4 Operations, Layer 5 Assets) sin alterar identificadores, versiones, APIs públicas, nombres de paquete ni historial de Git.

Decisiones confirmadas en la ronda de conflictos (ver conversación previa):

1. **ATLAS-011** no existe como documento independiente; ATLAS-012 es la fuente única para la estructura del repositorio.
2. **RFC-0001** se ignora como autoridad estructural (documento `proposed`, no `approved`). Se conserva como registro histórico bajo `docs/`.
3. **Carpetas vacías con typos** (`Agents/`, `Brands/`, `Knowlegde/`, `Organitation/`, `Workflows/`) se eliminan.

### 0.1 Ajustes aprobados sobre la versión 1.0.0 de este plan

La versión inicial (1.0.0) proponía tres puntos abiertos y una reasignación de ID. Tras tu revisión, quedan resueltos así:

1. **`apps/` se conserva.** No se elimina. Permanece como directorio raíz reservado ("Applications SHALL consume the platform"), aunque no figure en la lista explícita de ATLAS-012 §4. Se documenta como excepción pendiente de formalización en una futura revisión de gobernanza.
2. **`tests/` se conserva.** Mismo tratamiento que `apps/`: permanece como placeholder raíz reservado para tests de integración cross-package.
3. **`Product/ATLAS-002-CONCEPTUAL_MODEL.md` se mueve pero NO se renombra.** Se traslada a `spec/product/ATLAS-002-CONCEPTUAL_MODEL.md` conservando su identificador actual `ATLAS-002`. La colisión de identificador con `ATLAS-002-CONSTITUTION` **queda documentada y abierta**, pendiente de una ADR dedicada que defina el namespace `ATLAS-PROD-*` (o el que corresponda) para la serie Product. Esta migración es puramente física (ruta de archivo); no toca frontmatter, identificadores ni contenido del documento.
4. **`pnpm-workspace.yaml` no se modifica todavía.** No se añade `plugins/*` hasta que exista el primer paquete real dentro de `plugins/`. `plugins/` permanece como directorio raíz vacío (solo `README.md`), igual que hoy.
5. **Se añade `adr/` como nuevo directorio raíz**, con `adr/README.md`, para alojar futuras Architecture Decision Records — incluyendo la ADR pendiente sobre la colisión `ATLAS-002` (punto 3). Esto es una **ampliación de la raíz no contemplada literalmente en ATLAS-012 §4**; se registra aquí como decisión explícita del Architecture Board (representado por el usuario en esta sesión) y debe reflejarse como actualización formal de ATLAS-012 §4 en una revisión posterior de ese documento (fuera del alcance de esta migración, que no modifica specs).

---

## 1. Estructura objetivo (raíz)

```text
ATLAS/
├── README.md
├── VERSION.md
├── package.json
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
├── turbo.json
├── tsconfig.json
├── tsconfig.base.json
├── eslint.config.js
├── .gitignore
├── .npmrc
├── .nvmrc
├── .prettierrc
├── .prettierignore
├── .changeset/
├── .github/
├── adr/
│   └── README.md
├── spec/
│   ├── foundation/
│   ├── architecture/
│   ├── domain/
│   ├── engine/
│   ├── sdk/
│   ├── capabilities/
│   │   └── knowledge/
│   └── product/
├── packages/                 (sin cambios internos — 20 paquetes @atlas/*)
├── docs/
│   └── proposals/
│       └── rfc/
├── examples/                 (sin cambios)
├── workspaces/                (sin cambios)
├── releases/
├── templates/
├── tools/
├── scripts/
├── plugins/                  (sin cambios — vacío, no wired en pnpm-workspace.yaml todavía)
├── apps/                     (se conserva, sin cambios)
└── tests/                    (se conserva, sin cambios)
```

Eliminados de la raíz: `Foundation/`, `Architecture/`, `Domain/`, `Engine/`, `SDK/`, `Capabilities/`, `Product/`, `Releases/` (renombrada, no eliminada — ver §2), `Agents/`, `Brands/`, `Knowlegde/`, `Organitation/`, `Workflows/`, `proposals/` (raíz — se anida bajo `docs/`), y los cuatro reportes sueltos (`CORE_IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_READINESS_REPORT.md`, `PHASE_0_BOOTSTRAP_REPORT.md`, `INFORME-REVISION-ARQUITECTONICA.md`).

Añadido a la raíz: `adr/` (nuevo, con `README.md`, ver §0.1 punto 5).

Conservados sin cambios (ajuste aprobado, ver §0.1): `apps/`, `tests/`, `plugins/`.

---

## 2. Tabla de movimientos (directorios y archivos)

### 2.1 Especificaciones → `spec/`

| Origen | Destino |
|---|---|
| `Foundation/*.md` (13 archivos, ATLAS-000 a ATLAS-013) | `spec/foundation/*.md` |
| `Architecture/*.md` (7 archivos) | `spec/architecture/*.md` |
| `Domain/*.md` (10 archivos) | `spec/domain/*.md` |
| `Engine/*.md` (11 archivos) | `spec/engine/*.md` |
| `SDK/*.md` (8 archivos) | `spec/sdk/*.md` |
| `Capabilities/Knowledge/*.md` (8 archivos) | `spec/capabilities/knowledge/*.md` |
| `Product/ATLAS-002-CONCEPTUAL_MODEL.md` | `spec/product/ATLAS-002-CONCEPTUAL_MODEL.md` **(solo movimiento físico — identificador `ATLAS-002` se conserva sin cambios, ver §0.1 punto 3 y §5)** |

Reservado para uso futuro, no se crea vacío ahora: `spec/interfaces/`, `spec/organization/` (mencionados en ATLAS-012 §5 como taxonomía típica, sin contenido actual).

### 2.2 Normalización de nombres de archivo (dentro de `spec/`)

| Origen | Destino (mismo identificador, nombre corregido) |
|---|---|
| `Foundation/ATLAS-003—PRINCIPLES.md` (em-dash) | `spec/foundation/ATLAS-003-PRINCIPLES.md` (guion simple) |
| `Architecture/ATLAS-ARCH-002 — PACKAGE_ARCHITECTURE.md` (espacios + em-dash) | `spec/architecture/ATLAS-ARCH-002-PACKAGE_ARCHITECTURE.md` |
| `Architecture/ATLAS-ARCH-003 -COMPILER_ARCHITECTURE.md` (espacio suelto) | `spec/architecture/ATLAS-ARCH-003-COMPILER_ARCHITECTURE.md` |

Ningún identificador (`ATLAS-003`, `ATLAS-ARCH-002`, `ATLAS-ARCH-003`) cambia — solo el nombre de archivo, conforme a ATLAS-013 §2.3 ("File names may evolve. Identifiers never change").

### 2.3 Implementación (sin cambios estructurales)

| Origen | Destino |
|---|---|
| `packages/` (20 paquetes, código, tests, dist, README, CHANGELOG) | `packages/` — **sin mover, sin renombrar** |

### 2.4 Documentación → `docs/`

| Origen | Destino |
|---|---|
| `proposals/rfc/RFC-0001-repository-architecture.md` | `docs/proposals/rfc/RFC-0001-repository-architecture.md` |
| `docs/README.md` (contenido actualizado) | `docs/README.md` |

### 2.4bis Nuevo directorio de gobernanza — `adr/`

| Acción | Detalle |
|---|---|
| Crear `adr/README.md` (nuevo archivo, no es un movimiento) | Explica el propósito del directorio: Architecture Decision Records de Atlas. Debe mencionar explícitamente que la primera ADR pendiente es la resolución de la colisión de identificador `ATLAS-002` (Constitution vs Product Conceptual Model, ver §5). |

Este directorio es una ampliación de la raíz aprobada explícitamente por el Architecture Board (§0.1 punto 5) y no proviene de ningún archivo existente.

### 2.5 Operaciones → `releases/`

| Origen | Destino |
|---|---|
| `Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md` | `releases/ATLAS-RELEASE-001-KERNEL_v0.1.md` |
| `Releases/KNOWLEDGE_IMPLEMENTATION_PLAN.md` | `releases/KNOWLEDGE_IMPLEMENTATION_PLAN.md` |
| `Releases/RELEASE_READINESS_REPORT.md` | `releases/RELEASE_READINESS_REPORT.md` |
| `Releases/SPRINT9_IMPLEMENTATION_REPORT.md` | `releases/SPRINT9_IMPLEMENTATION_REPORT.md` |
| `Releases/SPRINT9_KNOWLEDGE_COMPILER_INTEGRATION.md` | `releases/SPRINT9_KNOWLEDGE_COMPILER_INTEGRATION.md` |
| `CORE_IMPLEMENTATION_PLAN.md` (raíz) | `releases/CORE_IMPLEMENTATION_PLAN.md` |
| `IMPLEMENTATION_READINESS_REPORT.md` (raíz) | `releases/IMPLEMENTATION_READINESS_REPORT.md` |
| `PHASE_0_BOOTSTRAP_REPORT.md` (raíz) | `releases/PHASE_0_BOOTSTRAP_REPORT.md` |
| `INFORME-REVISION-ARQUITECTONICA.md` (raíz) | `releases/INFORME-REVISION-ARQUITECTONICA.md` |
| `REPOSITORY_MIGRATION_PLAN.md` (este documento) | `releases/REPOSITORY_MIGRATION_PLAN.md` (al cerrar Milestone 2) |
| `REPOSITORY_MIGRATION_REPORT.md` (a generar tras ejecución) | `releases/REPOSITORY_MIGRATION_REPORT.md` |

> Nota Git: `git status` muestra que `Release/` → `Releases/` ya se inició manualmente (dos archivos aparecen como `D` en `Release/` y `??` en `Releases/`). Este plan asume `Releases/` como estado actual real y completa la migración de forma consistente; no se requiere acción adicional sobre `Release/` (ya no existe en el árbol de trabajo).

### 2.6 Eliminaciones — carpetas vacías / no autorizadas por ATLAS-012 §4

| Directorio | Justificación |
|---|---|
| `Agents/` | Vacía, typo/placeholder no listado en §4 |
| `Brands/` | Vacía, no listado en §4 |
| `Knowlegde/` | Vacía, typo de "Knowledge", no listado en §4 |
| `Organitation/` | Vacía, typo de "Organization", no listado en §4 |
| `Workflows/` | Vacía, no listado en §4 |
| `Capabilities/.DS_Store`, `proposals/.DS_Store` | Basura de macOS, ya cubierta por `.gitignore`, se limpia del working tree |

**`apps/` y `tests/` se conservan** (ajuste aprobado, §0.1 puntos 1–2). No se eliminan en esta migración, pese a no figurar en la lista explícita de ATLAS-012 §4. Quedan registrados como excepción documentada, pendiente de formalización en una futura actualización de gobernanza.

Si en el futuro se necesitan más capacidades de este tipo, deberán introducirse mediante el proceso de gobernanza de ATLAS-012 §17 (justificación arquitectónica + revisión + aprobación del Architecture Board).

---

## 3. Referencias Markdown a actualizar

| Archivo | Línea(s) | Referencia actual | Nueva referencia |
|---|---|---|---|
| `README.md` (raíz) | 24 | `Foundation/`, `Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md` | `spec/foundation/`, `releases/ATLAS-RELEASE-001-KERNEL_v0.1.md` |
| `README.md` (raíz) | 51 | `Architecture/`, `Domain/`, `Engine/`, `SDK/` | `spec/architecture/`, `spec/domain/`, `spec/engine/`, `spec/sdk/` |
| `README.md` (raíz) | árbol de estructura del repositorio (sección "Estructura del repositorio") | árbol completo desactualizado | reemplazado por el árbol de §1 de este plan |
| `VERSION.md` | 19, 53 | `Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md` | `releases/ATLAS-RELEASE-001-KERNEL_v0.1.md` |
| `IMPLEMENTATION_READINESS_REPORT.md` → `releases/IMPLEMENTATION_READINESS_REPORT.md` | 10, 26 | `Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md` | `ATLAS-RELEASE-001-KERNEL_v0.1.md` (ruta relativa, mismo directorio) |
| `CORE_IMPLEMENTATION_PLAN.md` → `releases/CORE_IMPLEMENTATION_PLAN.md` | 12, 23, 24, 32 | `Releases/…`, `Engine/ATLAS-100-ENGINE.md`, `Domain/ATLAS-DOM-000-DOMAIN_REVIEW.md` | `ATLAS-RELEASE-001-KERNEL_v0.1.md` (relativo), `../spec/engine/ATLAS-100-ENGINE.md`, `../spec/domain/ATLAS-DOM-000-DOMAIN_REVIEW.md` |
| `spec/foundation/ATLAS-009-GLOSSARY.md` | 449, 451 | `Foundation/ATLAS-001-MANIFESTO.md`, `Foundation/ATLAS-006-GOVERNANCE.md` | `ATLAS-001-MANIFESTO.md`, `ATLAS-006-GOVERNANCE.md` (relativo, mismo directorio) |
| `spec/foundation/ATLAS-009-GLOSSARY.md` | 481 | `Foundation/ATLAS-004_DOMAIN_MODEL.md` **(enlace roto — guion bajo incorrecto, el archivo real es `ATLAS-004-DOMAIN_MODEL.md`)** | `ATLAS-004-DOMAIN_MODEL.md` (corregido) |
| `INFORME-REVISION-ARQUITECTONICA.md` → `releases/…` | 265, 266, 310, 463–466 | `SDK/…`, `Domain/…`, `Foundation/…`, `Architecture/…`, `Engine/…` | rutas equivalentes bajo `../spec/…` |
| `PHASE_0_BOOTSTRAP_REPORT.md` → `releases/…` | 725 | `Foundation/ATLAS-000-README.md` | `../spec/foundation/ATLAS-000-README.md` |
| `releases/ATLAS-RELEASE-001-KERNEL_v0.1.md` | 12 | `Releases/RELEASE_READINESS_REPORT.md` | `RELEASE_READINESS_REPORT.md` (relativo) |
| `releases/KNOWLEDGE_IMPLEMENTATION_PLAN.md` | 43, 44 | `Engine/ATLAS-102-KNOWLEDGE_ENGINE.md`, `Domain/ATLAS-DOM-001-KNOWLEDGE_DOMAIN.md` | `../spec/engine/…`, `../spec/domain/…` |
| `releases/RELEASE_READINESS_REPORT.md` | 10, 155 | `Releases/ATLAS-RELEASE-001-KERNEL_v0.1.md` | `ATLAS-RELEASE-001-KERNEL_v0.1.md` (relativo) |
| `docs/README.md` | 15 (y contenido completo) | `Foundation/`, `Architecture/`, `Domain/`, `Engine/`, `SDK/` | reescrito para apuntar a `../spec/foundation/`, `../spec/architecture/`, `../spec/domain/`, `../spec/engine/`, `../spec/sdk/` |
| `docs/proposals/rfc/RFC-0001-repository-architecture.md` | 111, 112, 145 | `Domain/…`, `Engine/…`, `Foundation/…` | `../../../spec/domain/…`, `../../../spec/engine/…`, `../../../spec/foundation/…` |
| `packages/cli/README.md` | 9, 10 | `SDK/ATLAS-201-SDK_CLI.md`, `SDK/ATLAS-202-SDK_TYPESCRIPT.md` | `../../spec/sdk/ATLAS-201-SDK_CLI.md`, `../../spec/sdk/ATLAS-202-SDK_TYPESCRIPT.md` |
| `packages/core/README.md` | 10, 11 | `Engine/ATLAS-100-ENGINE.md`, `Domain/ATLAS-DOM-000-DOMAIN_REVIEW.md` | `../../spec/engine/…`, `../../spec/domain/…` |
| `packages/events/README.md` | 9, 10 | `SDK/ATLAS-204-SDK_EVENTS.md`, `Engine/ATLAS-100-ENGINE.md` | `../../spec/sdk/…`, `../../spec/engine/…` |
| `packages/runtime/README.md` | 9, 10, 11 | `Domain/ATLAS-DOM-009-RUNTIME_DOMAIN.md`, `SDK/ATLAS-204-SDK_EVENTS.md`, `SDK/ATLAS-202-SDK_TYPESCRIPT.md` | `../../spec/domain/…`, `../../spec/sdk/…`, `../../spec/sdk/…` |
| `packages/sdk/README.md` | 9, 10 | `SDK/ATLAS-200-SDK_OVERVIEW.md`, `SDK/ATLAS-202-SDK_TYPESCRIPT.md` | `../../spec/sdk/…` |
| `workspaces/first-atlas-workspace/GETTING_STARTED.md` | 154, 155 | `SDK/ATLAS-201-SDK_CLI.md`, `SDK/ATLAS-202-SDK_TYPESCRIPT.md` | `../../spec/sdk/…` |
| `apps/README.md`, `plugins/README.md`, `templates/README.md`, `tools/README.md`, `tests/README.md`, `scripts/README.md` | — | `Architecture/ATLAS-ARCH-002 — PACKAGE_ARCHITECTURE.md` (ruta y nombre desactualizados) | `../spec/architecture/ATLAS-ARCH-002-PACKAGE_ARCHITECTURE.md` (los seis archivos se conservan y se actualizan — `apps/` y `tests/` ya no se eliminan, ver §0.1) |

**Comentarios de código fuente** (no son rutas de archivo, no requieren cambio): `packages/compiler/src/contracts/{publisher,generator,compiler-stage-id,artifact}.ts` referencian `@see ATLAS-ARCH-003 §…` como identificador de especificación, no como ruta. Se conservan sin modificación.

---

## 4. Actualizaciones de configuración

| Archivo | Cambio |
|---|---|
| `pnpm-workspace.yaml` | **Sin cambios** (ajuste aprobado, §0.1 punto 4). Se mantiene `packages/*`, `apps/*`, `tools/*`, `examples/*`, `workspaces/*`. No se añade `plugins/*` hasta que exista el primer paquete real en `plugins/`. |
| `tsconfig.json` | Sin cambios — la referencia `./packages/core` no se ve afectada. |
| `turbo.json` | Sin cambios. |
| `.github/workflows/ci.yml` | Sin cambios — no referencia rutas de specs. |
| `.gitignore` | Sin cambios — `.DS_Store` ya está cubierto. |

---

## 5. Identificador `ATLAS-002` — movimiento sin reasignación (pendiente de ADR)

`Product/ATLAS-002-CONCEPTUAL_MODEL.md` → `spec/product/ATLAS-002-CONCEPTUAL_MODEL.md`

- **Movimiento puramente físico.** Frontmatter (`id: ATLAS-002`, `title`, `version`, `status`, `phase`, `category`, `owner`, `last_updated`) permanece sin cambios.
- La colisión de identificador con `Foundation/ATLAS-002-CONSTITUTION.md` (ahora `spec/foundation/ATLAS-002-CONSTITUTION.md`) **sigue existiendo tras esta migración** y queda registrada como hallazgo abierto, no como defecto introducido por la migración.
- Se crea `adr/README.md` (§2.4bis) mencionando explícitamente esta colisión como la primera ADR pendiente del repositorio.
- No se detectaron referencias externas a `ATLAS-002-CONCEPTUAL_MODEL` en otros documentos (verificado por búsqueda global) — no hay enlaces adicionales que actualizar por este movimiento.
- `REPOSITORY_MIGRATION_REPORT.md` documentará esta colisión bajo "Known Issues", con referencia a `adr/README.md`.

---

## 6. Ajustes resueltos por el usuario (histórico de la revisión)

Los tres puntos abiertos de la versión 1.0.0 de este plan quedaron resueltos así (ver detalle en §0.1):

1. `apps/` y `tests/` — **se conservan**, no se eliminan.
2. `pnpm-workspace.yaml` — **no se modifica**; `plugins/*` se añadirá cuando exista el primer paquete real en `plugins/`.
3. Ubicación `spec/capabilities/knowledge/` para los documentos `KNOWLEDGE-00X` — **confirmada implícitamente** (no se objetó; se mantiene tal como se propuso en la versión 1.0.0).

Adicionalmente, se aprobaron dos ajustes no contemplados en la versión 1.0.0: no renombrar `ATLAS-002-CONCEPTUAL_MODEL.md` (§5) y crear `adr/` (§2.4bis).

---

## 7. Plan de validación post-migración

Tras ejecutar los movimientos, se correrá en este orden:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

Y verificación funcional específica:

- `pnpm --filter @atlas/cli build` (CLI)
- `pnpm --filter @atlas/workspace-first demo` (workspace de referencia)
- `pnpm --filter @atlas/example-sdk demo`
- `pnpm --filter @atlas/example-knowledge-compiler demo`
- `pnpm --filter @atlas/example-runtime demo`
- `pnpm --filter @atlas/example-cli-workspace demo`
- `pnpm --filter @atlas/example-compiler-events demo`
- `pnpm --filter @atlas/example-compiler-in-memory demo`
- Verificación de enlaces Markdown rotos en todo el árbol (`spec/`, `docs/`, `releases/`, `packages/*/README.md`, `workspaces/`)
- `git log --follow` sobre una muestra de archivos movidos, para confirmar que el historial se preserva (se usará `git mv` en cada movimiento, nunca copiar + borrar)

---

## 8. Estrategia de ejecución

1. `git mv` de cada archivo/directorio de especificación hacia `spec/<capa>/` (preserva historial), incluyendo `Product/ATLAS-002-CONCEPTUAL_MODEL.md` → `spec/product/ATLAS-002-CONCEPTUAL_MODEL.md` **sin tocar frontmatter**.
2. Renombrado de los 3 archivos con nombres no conformes (§2.2), también vía `git mv`.
3. Creación de `adr/README.md` (nuevo, §2.4bis).
4. `git mv` de `Releases/*` → `releases/*` y de los 4 reportes sueltos de raíz → `releases/`.
5. `git mv` de `proposals/` → `docs/proposals/`.
6. `git rm -r` de las 5 carpetas vacías con typos (`Agents/`, `Brands/`, `Knowlegde/`, `Organitation/`, `Workflows/`) y limpieza de `.DS_Store`. **`apps/` y `tests/` no se tocan.**
7. Actualización de todas las referencias listadas en §3.
8. `pnpm-workspace.yaml` — **sin cambios** (§4).
9. Ejecución del plan de validación (§7).
10. Generación de `REPOSITORY_MIGRATION_REPORT.md` con el detalle real de lo ejecutado, y `git mv` final de ambos documentos (`REPOSITORY_MIGRATION_PLAN.md`, `REPOSITORY_MIGRATION_REPORT.md`) hacia `releases/`.

---

**Plan aprobado el 2026-07-19 con los ajustes de §0.1.** Procediendo a ejecución.
