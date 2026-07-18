# Runtime Demo

Demostración del flujo completo **compilar → ejecutar** usando únicamente `@atlas/sdk`.

## Qué demuestra

- Compilación in-memory vía `atlas.compiler.compile()`
- Ejecución de artifacts vía `atlas.runtime.execute()`
- Eventos `CompilerCompletedEvent`, `RuntimeStartedEvent`, `RuntimeCompletedEvent`
- Consumo **exclusivo** de `@atlas/sdk`

## Ejecutar

```bash
pnpm install
pnpm --filter @atlas/example-runtime demo
```

## Salida esperada

- Compilación `SUCCESS` con al menos un artifact
- Ejecución `SUCCESS` con output del artifact `summary`
- Eventos de compiler y runtime recibidos por suscriptores
