# CLI Workspace Demo

Demostración del flujo **compilar → ejecutar** usando únicamente el comando `atlas`.

## Qué demuestra

- `atlas doctor` — validación del wiring CLI + workspace
- `atlas compile` — compilación vía `@atlas/sdk`
- `atlas run` — ejecución de artifacts vía `@atlas/sdk`
- Workspace definido en `atlas.workspace.json`
- Sin acceso directo del CLI a paquetes internos del Kernel

## Ejecutar

```bash
pnpm install
pnpm --filter @atlas/cli build
pnpm --filter @atlas/example-cli-workspace demo
```

## Salida esperada

- Doctor: `Status: HEALTHY`
- Compile: `Compilation: SUCCESS`
- Run: `Execution: SUCCESS` con al menos un output
