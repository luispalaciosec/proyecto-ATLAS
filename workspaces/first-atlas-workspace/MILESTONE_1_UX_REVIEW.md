# Milestone 1 — Revisión de experiencia de usuario

**Proyecto:** `first-atlas-workspace`  
**Fecha:** 2026-07-18  
**Alcance:** Kernel mínimo + CLI (sin nuevos paquetes)

---

## Resumen ejecutivo

El flujo **doctor → compile → run** funciona de extremo a extremo usando solo el comando `atlas`. Un usuario puede clonar el workspace, ejecutar la demo y obtener compilación y ejecución exitosas con tres unidades de conocimiento.

La experiencia es **funcional pero manual** en la gestión de unidades. El mayor gap entre un "proyecto real" y la implementación actual es la duplicación entre archivos en `knowledge/` y el campo `source` en `atlas.workspace.json`.

---

## Flujo evaluado

| Paso | Comando | Resultado | UX |
|------|---------|-----------|-----|
| 1 | Clonar + `pnpm install` | OK | Requiere build previo del CLI |
| 2 | `atlas doctor` | HEALTHY | Claro y rápido |
| 3 | `atlas compile` | SUCCESS (3 units → 1 artifact) | Salida legible; falta detalle de artifacts |
| 4 | `atlas run` | SUCCESS (1 output) | Compila+ejecuta; no muestra contenido del output |
| 5 | `atlas version` | OK | Informa versión CLI y facade SDK |
| 6 | `atlas help` | OK | Commander estándar |

---

## Fortalezas detectadas

1. **Separación CLI / Kernel** — El CLI delega correctamente; mensaje de doctor lo confirma.
2. **Workspace JSON simple** — Formato comprensible para definir unidades.
3. **Exit codes** — Errores de configuración vs compilación distinguibles.
4. **Demo reproducible** — Un comando ejecuta el flujo completo.
5. **Estructura de carpetas** — `knowledge/`, `config/`, `.atlas/` preparan evolución sin rediseño.

---

## Mejoras detectadas (priorizadas)

### P0 — Bloquean experiencia de proyecto real

| ID | Mejora | Contexto |
|----|--------|----------|
| **M1-01** | **`atlas init`** — Scaffold de workspace | No existe comando para crear proyecto; el usuario debe copiar manualmente |
| **M1-02** | **Discovery de `knowledge/`** | Unidades duplicadas en `atlas.workspace.json`; archivos en `knowledge/` no se cargan automáticamente |
| **M1-03** | **Build del CLI como prerequisito** | `pnpm --filter @atlas/cli build` necesario antes de `atlas`; no hay bin precompilado en install |

### P1 — Fricción significativa

| ID | Mejora | Contexto |
|----|--------|----------|
| **M1-04** | **Cargar `config/atlas.config.json`** | Archivo existe pero CLI lo ignora; precedencia SDK-201 no implementada |
| **M1-05** | **Validación checksum origen ↔ source** | `checksum` y `origin` son declarativos; no se verifica contra archivos |
| **M1-06** | **Salida enriquecida de compile/run** | Usuario no ve artifacts ni outputs sin `--json` limitado |
| **M1-07** | **`compile` vs `run` redundante en percepción** | `run` recompila siempre; no hay artifacts cacheados en `.atlas/` |

### P2 — Calidad y consistencia

| ID | Mejora | Contexto |
|----|--------|----------|
| **M1-08** | **Convención de eventos v0.2 (E1)** | `compiler.completed` vs `atlas.compiler.completed` — ya registrado en events README |
| **M1-09** | **`atlas doctor` validación estructural** | Doctor no verifica alineación `knowledge/` ↔ `atlas.workspace.json` |
| **M1-10** | **Campo `kind` explícito en CompilationUnit (C3)** | Se usa `metadata.kind`; mejora ya registrada en compiler README |
| **M1-11** | **`--verbose` global** | Especificado en SDK-201; no implementado |
| **M1-12** | **Documentar `--json` schema estable** | Salida JSON útil pero sin contrato versionado |

### P3 — Futuro (post-Milestone)

| ID | Mejora | Contexto |
|----|--------|----------|
| **M1-13** | Persistencia de artifacts en `.atlas/` | Runtime in-memory no deja rastro |
| **M1-14** | `atlas watch` | Recompilación incremental |
| **M1-15** | Plantilla en `templates/atlas-workspace/` | Formalizar scaffold fuera de copiar ejemplo |

---

## Recomendación post-Milestone

Antes de implementar Knowledge, Memory o Retrieval, se recomienda abordar **M1-01** (`atlas init`) y **M1-02** (discovery mínimo de unidades desde `knowledge/`) para que un workspace deje de requerir duplicación manual.

---

## Criterios de aceptación Milestone 1

| Criterio | Estado |
|----------|--------|
| Workspace de ejemplo con estructura recomendada | ✅ |
| Documentos de conocimiento mínimos | ✅ (3 documentos) |
| `atlas doctor` funcional | ✅ |
| `atlas compile` funcional | ✅ |
| `atlas run` funcional | ✅ |
| Solo CLI (sin SDK directo en flujo usuario) | ✅ |
| Getting Started + quickstart | ✅ |
| Demo reproducible | ✅ |
| Revisión UX + lista de mejoras | ✅ |
| Sin nuevos paquetes Kernel | ✅ |

---

**Milestone 1 listo para revisión.**
