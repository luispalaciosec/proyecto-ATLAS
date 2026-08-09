# Fix: typecheck y lint rotos en la raíz del monorepo

**Tipo:** Fix de higiene, no un sprint de producto. No bloquea ninguna funcionalidad — bloquea la confianza en `pnpm run typecheck` y `pnpm run lint` como gates reales.

## Contexto

El pipeline de calidad documentado en `README.md` es:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm build && pnpm test
```

Verificación independiente en una copia limpia del repo (HEAD `a63ed06`) confirmó que **`pnpm run typecheck` y `pnpm run lint` fallan hoy en la raíz**, mientras que `pnpm run build` (23/23) y `pnpm run test` (46/46) sí pasan limpio. Nadie está corriendo el pipeline completo antes de commitear — mismo patrón que causó el ciclo de dependencia no detectado en P2.5.

## Problema 1 — Typecheck roto (`@atlas/llm`)

```
packages/llm/tests/anthropic-provider.test.ts(71,7): error TS2322:
Type 'Mock<(_url: string, init?: RequestInit | undefined) => Promise<Response>>'
is not assignable to type '(input: string | URL | Request, init?: RequestInit | undefined) => Promise<Response>'.
```

Preexistente desde el commit original de P2.1 (`ce7816e`), nunca corregido en los tres commits posteriores que tocaron `@atlas/llm`. El mock de `fetch` en el test tipa su primer parámetro como `string` en vez de `string | URL | Request` (la firma real de `fetch`), lo que ya no es asignable al tipo esperado por `RequestInit`/`fetchImpl` inyectado.

**Fix:** ajustar la firma del mock en `packages/llm/tests/anthropic-provider.test.ts` línea 71 para que coincida con `typeof fetch` (parámetro `input: string | URL | Request`), no restringirlo a `string`. No cambiar el código de producción (`anthropic-provider.ts`) — el problema es solo del tipo del mock en el test.

## Problema 2 — Lint roto (4 archivos, variables sin usar)

```
packages/sdk/src/modules/retrieval-module.ts:5:8       'RetrievalContext' definida pero nunca usada
packages/cli/tests/brand-profile.test.ts:1:35           'readFileSync' definida pero nunca usada
packages/cli/tests/chat-repl.test.ts:7:10                'CliApp' definida pero nunca usada
packages/memory/tests/engine/memory-engine-session.test.ts:17:3   'systemMemoryEngineSessionClock' definida pero nunca usada
```

Deuda preexistente de fases anteriores (ninguno de estos 4 archivos fue tocado por los últimos tres commits). Regla: `@typescript-eslint/no-unused-vars` con excepción solo para nombres que empiecen con `_`.

**Fix, archivo por archivo:**

- `packages/sdk/src/modules/retrieval-module.ts` — eliminar el import/tipo `RetrievalContext` si genuinamente no se usa en el archivo; si se usa solo como tipo en un comentario o firma implícita, revisar si debería usarse explícitamente en vez de eliminarse (no eliminar a ciegas si hay sospecha de que documenta una API pública).
- `packages/cli/tests/brand-profile.test.ts` — eliminar el import `readFileSync` si el test no lo usa.
- `packages/cli/tests/chat-repl.test.ts` — eliminar el import `CliApp` si el test no lo usa.
- `packages/memory/tests/engine/memory-engine-session.test.ts` — eliminar la variable `systemMemoryEngineSessionClock` si no se usa, o prefijarla con `_` si existe a propósito para efectos secundarios/documentación y no debe borrarse.

En los 4 casos: confirmar con una lectura rápida del archivo que remover el import/variable no rompe nada (no hay uso indirecto vía side-effect) antes de borrar.

## Verificación de cierre (obligatoria)

- `pnpm run lint` (raíz) → exit 0, sin errores en ningún paquete.
- `pnpm run typecheck` (raíz) → exit 0, sin errores en ningún paquete.
- `pnpm run build` (raíz) → sigue en 23/23.
- `pnpm run test` (raíz) → sigue en 46/46.
- Confirmar que ninguno de los 4 archivos de test perdió cobertura real (los tests que contenían las variables/imports sin usar deben seguir pasando con la misma cantidad de `it(...)`).

## No negociables

- No tocar código de producción para resolver el problema 1 — es un error de tipo en un mock de test, no en `anthropic-provider.ts`.
- No usar `// eslint-disable` ni `@ts-ignore`/`@ts-expect-error` para silenciar ninguno de los 6 errores — corregir la causa real en cada caso.
- No modificar el comportamiento de ningún test existente, solo su tipado/imports.
- Reportar el resultado de `pnpm run lint` y `pnpm run typecheck` en la raíz (no solo `--filter`) como evidencia de cierre.
