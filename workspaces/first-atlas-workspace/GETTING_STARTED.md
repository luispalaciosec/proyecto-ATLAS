# Getting Started — First Atlas Workspace

Esta guía explica cómo utilizar el primer proyecto Atlas completamente funcional con el Kernel mínimo actual.

## Qué es este proyecto

`first-atlas-workspace` es un proyecto Atlas de referencia que demuestra el flujo completo:

```text
Conocimiento → Compilación → Ejecución
```

Utiliza **únicamente** los componentes oficiales del Kernel:

| Componente | Rol |
|------------|-----|
| `@atlas/core` | Primitivas compartidas |
| `@atlas/compiler` | Pipeline de compilación |
| `@atlas/events` | Eventos de dominio in-memory |
| `@atlas/runtime` | Ejecución de artifacts |
| `@atlas/sdk` | API pública del Kernel |
| `@atlas/cli` | Interfaz de línea de comandos |

No se requiere Knowledge Engine, Memory, Retrieval ni Agent.

---

## Estructura del workspace

```text
first-atlas-workspace/
├── atlas.workspace.json      # Definición del proyecto y unidades de compilación
├── config/
│   └── atlas.config.json     # Configuración recomendada (referencia)
├── knowledge/                # Documentos de conocimiento (canónicos, legibles)
│   ├── policies/
│   └── concepts/
├── docs/
│   └── quickstart.md         # Inicio rápido
├── scripts/
│   └── demo.sh               # Demo reproducible
├── .atlas/                   # Reservado para artefactos futuros
├── GETTING_STARTED.md        # Esta guía
└── package.json              # Scripts npm para el CLI
```

### `atlas.workspace.json`

Archivo principal que el CLI lee hoy. Define:

- `name` — identificador del workspace
- `environment` — `memory` (Kernel actual)
- `units[]` — unidades de compilación con `id`, `origin`, `checksum`, `version`, `source`, `metadata`

Cada unidad corresponde a un documento en `knowledge/`.

### `knowledge/`

Contiene los documentos de conocimiento del proyecto en formato JSON legible. Representan el contenido que un proyecto Atlas real mantendría bajo control de versiones.

### `config/atlas.config.json`

Configuración recomendada según SDK-201. **El CLI de Milestone 1 no la carga aún** — existe como convención y referencia para evolución futura.

---

## Flujo de trabajo del usuario

### 1. Crear o clonar un proyecto Atlas

Copiar la estructura de `workspaces/first-atlas-workspace/` como plantilla.

### 2. Definir conocimiento

Añadir documentos en `knowledge/` y registrar unidades equivalentes en `atlas.workspace.json`.

### 3. Validar el entorno

```bash
atlas doctor --workspace .
```

Verifica:

- Wiring del CLI con `@atlas/sdk`
- Validez de `atlas.workspace.json`

### 4. Compilar

```bash
atlas compile --workspace .
```

El Compiler procesa las unidades, construye el grafo de conocimiento y genera artifacts (p. ej. `summary`).

### 5. Ejecutar

```bash
atlas run --workspace .
```

Compila y ejecuta los artifacts mediante el Runtime in-memory.

---

## Comandos disponibles

| Comando | Descripción |
|---------|-------------|
| `atlas doctor [--workspace <path>]` | Diagnóstico del CLI y workspace |
| `atlas compile [--workspace <path>] [--json]` | Compilar unidades |
| `atlas run [--workspace <path>] [--json]` | Compilar y ejecutar |
| `atlas version` | Versión del CLI |
| `atlas help` | Ayuda |

---

## Demo reproducible

Desde la raíz del monorepo:

```bash
pnpm install
pnpm --filter @atlas/cli build
pnpm --filter @atlas/workspace-first demo
```

O desde el directorio del workspace:

```bash
cd workspaces/first-atlas-workspace
pnpm demo
```

---

## Limitaciones conocidas (Milestone 1)

El Kernel mínimo opera **in-memory**. No hay:

- Carga automática de `knowledge/` → unidades
- Persistencia de artifacts en `.atlas/`
- Filesystem discovery en el Compiler
- Red, bases de datos, LLMs

Estas limitaciones están documentadas en `MILESTONE_1_UX_REVIEW.md` con mejoras propuestas.

---

## Referencias

- [Inicio rápido](./docs/quickstart.md)
- [Revisión UX y mejoras](./MILESTONE_1_UX_REVIEW.md)
- `../../spec/sdk/ATLAS-201-SDK_CLI.md`
- `../../spec/sdk/ATLAS-202-SDK_TYPESCRIPT.md`
