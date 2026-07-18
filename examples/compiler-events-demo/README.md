# Compiler Events Demo

Demostración de desacoplamiento Kernel mediante `@atlas/events`.

## Qué demuestra

- `InMemoryEventBus` con suscripción tipada
- `@atlas/compiler` publicando `CompilerCompletedEvent` al finalizar `compile()`
- Despacho **síncrono** in-memory
- Sin colas, persistencia ni transporte externo

## Ejecutar

```bash
pnpm install
pnpm --filter @atlas/example-compiler-events demo
```

## Salida esperada

- Resultado de compilación `SUCCESS`
- Evento `compiler.completed` recibido por el suscriptor demo
