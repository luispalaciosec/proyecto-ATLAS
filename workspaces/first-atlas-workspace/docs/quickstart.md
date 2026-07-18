# Inicio rápido

Guía mínima para ejecutar el primer proyecto Atlas funcional.

## Requisitos

- Node.js ≥ 20
- pnpm ≥ 9
- Monorepo Atlas clonado y dependencias instaladas

## Pasos

```bash
# 1. Instalar dependencias (desde la raíz del monorepo)
cd /ruta/a/ATLAS
pnpm install

# 2. Compilar el CLI
pnpm --filter @atlas/cli build

# 3. Entrar al workspace
cd workspaces/first-atlas-workspace

# 4. Validar
pnpm doctor

# 5. Compilar
pnpm compile

# 6. Ejecutar
pnpm run
```

## Demo en un comando

```bash
pnpm --filter @atlas/workspace-first demo
```

## Salida esperada

| Comando | Resultado |
|---------|-----------|
| `atlas doctor` | `Status: HEALTHY` |
| `atlas compile` | `Compilation: SUCCESS`, 3 unidades → 1 artifact |
| `atlas run` | `Execution: SUCCESS`, 1 output |

## Siguiente paso

Leer [GETTING_STARTED.md](../GETTING_STARTED.md) para entender la estructura del proyecto.
