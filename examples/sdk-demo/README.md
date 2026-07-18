# SDK Demo

Demostración de la fachada pública del Kernel mediante `@atlas/sdk`.

## Qué demuestra

- Creación de instancia `Atlas`
- Compilación vía `atlas.compiler.compile()`
- Suscripción tipada a `CompilerCompletedEvent` vía `atlas.events.subscribe()`
- Consumo **exclusivo** de `@atlas/sdk` (sin imports directos de core, compiler o events)

## Ejecutar

```bash
pnpm install
pnpm --filter @atlas/example-sdk demo
```

## Salida esperada

- Resultado de compilación `SUCCESS`
- Evento `compiler.completed` recibido por el suscriptor demo
- Al menos un artifact generado
