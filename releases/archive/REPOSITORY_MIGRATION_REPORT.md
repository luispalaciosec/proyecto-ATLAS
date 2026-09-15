---
id: ATLAS-MIGRATION-REPORT-001
title: Repository Migration Report — Milestone 2 (Repository Stabilization)
version: 1.0.0
status: completed
owner: Atlas Architecture Board
created: 2026-07-19
depends_on:
  - REPOSITORY_MIGRATION_PLAN.md
---

# Repository Migration Report — Milestone 2

Ejecución completa del `REPOSITORY_MIGRATION_PLAN.md` (v1.1.0, aprobado 2026-07-19). Commit de migración: `refactor(repo): reorganize repository per ATLAS-012 governance (Milestone 2)`.

---

## 1. Directorios movidos

| Origen | Destino |
|---|---|
| `Foundation/` (13 archivos) | `spec/foundation/` |
| `Architecture/` (7 archivos) | `spec/architecture/` |
| `Domain/` (10 archivos) | `spec/domain/` |
| `Engine/` (11 archivos) | `spec/engine/` |
| `SDK/` (8 archivos) | `spec/sdk/` |
| `Capabilities/Knowledge/` (8 archivos) | `spec/capabilities/knowledge/` |
| `Product/` (1 archivo) | `spec/product/` |
| `Releases/` (5 archivos) + 4 reportes sueltos de raíz | `releases/` |
| `proposals/` (raíz) | `docs/proposals/` |

Total: **59 archivos** ahora bajo `spec/`, **9 archivos** bajo `releases/`, **1 archivo** bajo `docs/proposals/rfc/`.

## 2. Directorio nuevo creado

| Directorio | Motivo |
|---|---|
| `adr/` (con `README.md`) | Ampliación de la raíz aprobada explícitamente por el Architecture Board (ajuste 5 de la ronda de revisión). Aloja Architecture Decision Records; documenta la ADR pendiente sobre la colisión `ATLAS-002`. |

## 3. Archivos renombrados (identificador preservado, solo nombre de archivo)

| Origen | Destino | Identificador |
|---|---|---|
| `Foundation/ATLAS-003—PRINCIPLES.md` (em-dash) | `spec/foundation/ATLAS-003-PRINCIPLES.md` | `ATLAS-003` (sin cambio) |
| `Architecture/ATLAS-ARCH-002 — PACKAGE_ARCHITECTURE.md` | `spec/architecture/ATLAS-ARCH-002-PACKAGE_ARCHITECTURE.md` | `ATLAS-ARCH-002` (sin cambio) |
| `Architecture/ATLAS-ARCH-003 -COMPILER_ARCHITECTURE.md` | `spec/architecture/ATLAS-ARCH-003-COMPILER_ARCHITECTURE.md` | `ATLAS-ARCH-003` (sin cambio) |

## 4. Movimiento sin reasignación de identificador

`Product/ATLAS-002-CONCEPTUAL_MODEL.md` → `spec/product/ATLAS-002-CONCEPTUAL_MODEL.md`. Movimiento puramente físico; frontmatter intacto. La colisión con `spec/foundation/ATLAS-002-CONSTITUTION.md` **persiste intencionalmente**, pendiente de la ADR documentada en `adr/README.md` (ajuste 3 aprobado por el usuario).

## 5. Referencias Markdown actualizadas

Se corrigieron enlaces en **29 archivos**: `README.md`, `VERSION.md`, `docs/README.md`, los 9 archivos de `releases/`, `spec/foundation/ATLAS-009-GLOSSARY.md`, `docs/proposals/rfc/RFC-0001-repository-architecture.md`, 15 `packages/*/README.md`, `workspaces/first-atlas-workspace/GETTING_STARTED.md`, `examples/README.md`, y los 6 placeholders de raíz (`apps/`, `plugins/`, `templates/`, `tools/`, `tests/`, `scripts/`).

Patrones corregidos: rutas a `Foundation/`, `Architecture/`, `Domain/`, `Engine/`, `SDK/`, `Releases/`, `Capabilities/Knowledge/`, `Product/` → sus equivalentes bajo `spec/` o `releases/`; y ajuste de profundidad relativa (`../`, `../../`, `../../../`) según la nueva ubicación de cada archivo.

## 6. Imports de código

No se encontraron imports de código fuente que referenciaran las rutas de especificación movidas. Las únicas coincidencias detectadas (`packages/compiler/src/contracts/{publisher,generator,compiler-stage-id,artifact}.ts`) son comentarios `@see ATLAS-ARCH-003 §…` que referencian el **identificador** de la especificación, no una ruta de archivo — se dejaron intactos, tal como exige la regla de no modificar código.

## 7. Enlaces rotos corregidos

Además de los enlaces ya cubiertos en el plan, la validación automatizada (script Python de verificación de enlaces relativos) encontró y corrigió **3 enlaces adicionales** no previstos en el plan original, rotos porque los archivos que los contenían se movieron a `releases/` pero seguían apuntando a `./VERSION.md` / `./README.md` (relativos a la raíz):

- `releases/CORE_IMPLEMENTATION_PLAN.md` → `./VERSION.md` corregido a `../VERSION.md`
- `releases/IMPLEMENTATION_READINESS_REPORT.md` → `./VERSION.md` corregido a `../VERSION.md`
- `releases/IMPLEMENTATION_READINESS_REPORT.md` → `./README.md` corregido a `../README.md`

También se corrigió un enlace roto preexistente (no causado por esta migración) en `spec/foundation/ATLAS-009-GLOSSARY.md`, que referenciaba `Foundation/ATLAS-004_DOMAIN_MODEL.md` (guion bajo incorrecto) cuando el archivo real era `ATLAS-004-DOMAIN_MODEL.md`.

Verificación final: **0 enlaces Markdown rotos** en todo el árbol (`spec/`, `docs/`, `releases/`, `packages/*/README.md`, `workspaces/`), confirmado con un script de verificación de enlaces relativos ejecutado sobre el árbol completo.

## 8. Resultados de validación

El entorno de shell de esta sesión monta el repositorio a través de un puente FUSE que **no permite `unlink`** (borrado de archivos ni de directorios), lo cual bloquea `pnpm install` (necesita crear y borrar un archivo de sondeo). Para validar de forma real, se copió el repositorio ya migrado a un sistema de archivos nativo (`/tmp/atlas-validate`, ext4) y se ejecutó ahí el pipeline completo:

| Comando | Resultado |
|---|---|
| `pnpm install --frozen-lockfile` | ✅ OK (318 paquetes resueltos, lockfile sin cambios) |
| `pnpm build` | ✅ 20/20 tareas exitosas |
| `pnpm typecheck` | ✅ 27/27 tareas exitosas |
| `pnpm lint` | ✅ 27/27 tareas exitosas (solo warnings preexistentes de ESM/CommonJS en `eslint.config.js`, no relacionados con la migración) |
| `pnpm test` | ✅ 40/40 tareas exitosas |

Demos funcionales verificadas end-to-end:

| Demo | Resultado |
|---|---|
| `@atlas/workspace-first demo` | ✅ doctor → compile → run, SUCCESS |
| `@atlas/example-sdk demo` | ✅ SUCCESS |
| `@atlas/example-knowledge-compiler demo` | ✅ SUCCESS |
| `@atlas/example-runtime demo` | ✅ SUCCESS |
| `@atlas/example-cli-workspace demo` | ✅ SUCCESS |
| `@atlas/example-compiler-events demo` | ✅ SUCCESS |
| `@atlas/example-compiler-in-memory demo` | ✅ SUCCESS |

Verificación de historial de Git (`git log --follow`) confirmada sobre una muestra de archivos movidos y renombrados (`ATLAS-002-CONSTITUTION.md`, `ATLAS-ARCH-002-PACKAGE_ARCHITECTURE.md`, `ATLAS-002-CONCEPTUAL_MODEL.md`): el historial previo a la migración se preserva correctamente a través del commit de reorganización.

## 9. Known Issues

1. **Colisión de identificador `ATLAS-002`** (Constitution vs Product Conceptual Model) — persiste intencionalmente. Documentada en `adr/README.md` como ADR pendiente.
2. **`apps/`, `tests/` y `plugins/*` en `pnpm-workspace.yaml`** — se dejaron sin cambios por decisión explícita del usuario, aunque `apps/` y `tests/` no figuran en la lista literal de ATLAS-012 §4. Pendiente de formalización en una futura revisión de gobernanza.
3. **`adr/` no está reflejado aún en ATLAS-012 §4** — su creación fue aprobada por el Architecture Board durante esta migración, pero el texto de `ATLAS-012-REPOSITORY_GOVERNANCE.md` no se modificó (fuera de alcance: esta migración no edita especificaciones). Se recomienda una actualización formal de ese documento en un ciclo posterior.
4. **Limitación de entorno — imposibilidad de borrar archivos/directorios en el mount de esta sesión.** El puente FUSE de este sandbox no permite `rm`/`rmdir` bajo ninguna circunstancia (verificado con pruebas aisladas). Esto significa que quedan en el árbol de trabajo, **fuera del control de versiones** (git no rastrea directorios vacíos), los siguientes artefactos que deben eliminarse manualmente en tu Mac:
   - Directorios ahora vacíos: `Agents/`, `Brands/`, `Knowlegde/`, `Organitation/`, `Workflows/`, `Foundation/`, `Architecture/`, `Domain/`, `Engine/`, `SDK/`, `Capabilities/` (incluyendo `Capabilities/Knowledge/`), `Product/`, `releases/releases_staging/`, `docs/proposals/proposals/`.
   - Archivos sueltos de macOS: `.DS_Store` (raíz), `Capabilities/.DS_Store`, `docs/proposals/proposals/.DS_Store`.
   - Archivos de prueba creados durante el diagnóstico de esta sesión: `_probe_file.txt`, `_probe2.txt`, `_probe_dir/`, `_tmp_21_*` (dos archivos temporales de pnpm).
   - Aproximadamente 60 archivos `.fuse_hidden*` dispersos por el árbol — artefactos generados por el propio puente FUSE cada vez que una edición en el lugar (`perl -i`, `sed -i`) intentó reemplazar un archivo existente. Son inofensivos (no están en git) pero conviene limpiarlos.

   **Instrucciones para limpieza manual** (ejecutar en Terminal de macOS, dentro de la carpeta del repositorio):

   ```bash
   cd /Users/luispalacios/ATLAS
   find . -name ".fuse_hidden*" -delete
   find . -name ".DS_Store" -delete
   rm -rf Agents Brands Knowlegde Organitation Workflows \
          Foundation Architecture Domain Engine SDK Capabilities Product \
          releases/releases_staging docs/proposals/proposals \
          _probe_file.txt _probe2.txt _probe_dir _tmp_21_*
   git status --short
   ```

   Estos directorios y archivos **no están rastreados por Git** (o ya fueron vaciados por el commit de migración), por lo que borrarlos no afecta el historial ni requiere un nuevo commit — es limpieza pura del árbol de trabajo. Después de ejecutar el bloque anterior, `git status --short` debería mostrar el árbol de trabajo limpio (sin archivos sin seguimiento relevantes).

5. **Nota técnica — `releases/` vs `Releases/` en sistemas de archivos case-insensitive.** macOS (APFS, configuración por defecto) es case-insensitive pero case-preserving. Durante la migración, `Releases/` y `releases/` resultaron ser el mismo directorio físico en este entorno. Git ahora rastrea consistentemente todo el contenido bajo la ruta en minúsculas `releases/` (confirmado en `git status`, `git log` y en el commit final), que es lo que importa para control de versiones, CI y herramientas (case-sensitive). El nombre mostrado en Finder podría no reflejar inmediatamente la nueva capitalización hasta que se sincronice, pero esto no afecta la corrección del repositorio.

## 10. Ignored Historical Proposals

Por decisión explícita del usuario, `proposals/rfc/RFC-0001-repository-architecture.md` (status `proposed`, no aprobado) se ignoró como autoridad estructural para esta migración. Su estructura propuesta (`eng/`, `decisions/`, `programs/`) difiere de la aplicada aquí, que sigue estrictamente `ATLAS-012-REPOSITORY_GOVERNANCE.md` (status `approved`). El RFC se conserva íntegro como registro histórico en `docs/proposals/rfc/`.

## 11. Estadísticas del repositorio

| Métrica | Valor |
|---|---|
| Archivos bajo `spec/` | 59 |
| Paquetes en `packages/` | 20 (todos `@atlas/*`, sin cambios de nombre) |
| Demos en `examples/` | 7 |
| Archivos en `releases/` | 11 (9 históricos + este reporte + el plan) |
| Archivos renombrados (identificador preservado) | 3 |
| Documentos con referencias corregidas | 29 |
| Enlaces rotos corregidos | 4 (3 nuevos por el movimiento + 1 preexistente) |
| Commits de la migración | 1 (`refactor(repo): reorganize repository per ATLAS-012 governance`) |
| Tamaño del repositorio (sin `node_modules`/`.git`) | ~166 MB |

---

**Estado final: Milestone 2 (Repository Stabilization) — completado.** El repositorio conforma la estructura definida por `ATLAS-012-REPOSITORY_GOVERNANCE.md`, con las excepciones documentadas explícitamente en la sección 9 y aprobadas por el Architecture Board durante esta migración.
