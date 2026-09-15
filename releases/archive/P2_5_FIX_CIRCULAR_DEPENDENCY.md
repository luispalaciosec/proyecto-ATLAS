# P2.5 — Corrección: Dependencia circular @atlas/cli ↔ @atlas/web

**Tipo:** Fix puntual, no un nuevo sprint. P2.5 no se cierra hasta que este fix esté aplicado y reverificado.

## Contexto

P2.5 (Web UI) fue implementado y reportado como completo. La extracción de `chat-turn.ts`, el servidor Express (`apps/web/src/server.ts`), el `SessionStore`, y el fix del build de `packages/cli` (doble `--clean`) están todos correctos y verificados — `@atlas/cli` 69/69 y `@atlas/web` 7/7 pasan.

Pero hay un problema que ni los tests de `--filter` ni el reporte original detectaron.

## Problema (verificado, reproducible)

`packages/cli/package.json` ahora depende de `@atlas/web` (agregado para que `web-command.ts` pueda resolver la ruta del servidor en WEB-4). Al mismo tiempo, `apps/web/package.json` depende de `@atlas/cli` (necesario para reusar `chat-turn.ts` y compañía).

Eso es una **dependencia circular real** entre dos paquetes del workspace. El comando estándar para construir todo el monorepo falla por completo:

```
$ pnpm run build   # (invoca turbo run build en la raíz)

WARNING  Circular package dependency detected: @atlas/web, @atlas/cli
x Cyclic dependency detected: @atlas/cli#build -> @atlas/web#build -> @atlas/cli#build
ELIFECYCLE  Command failed with exit code 1.
```

Mismo resultado con `turbo run test --filter=@atlas/cli --filter=@atlas/web`.

**Por qué no se detectó antes:** el script `test` de `apps/web/package.json` es `"pnpm --filter @atlas/cli build && vitest run"` — construye `@atlas/cli` manualmente por fuera del grafo de Turbo antes de correr sus propios tests. Eso hace que `pnpm --filter @atlas/web test` (y cualquier verificación que use `--filter` en vez del build de raíz) pase en aislamiento sin nunca exponer el ciclo. `pnpm run build`/`pnpm run test` en la raíz sí lo exponen, porque ahí Turbo intenta resolver el grafo completo de dependencias.

## Hallazgo secundario, relacionado

`resolveWebServerPath()` en `packages/cli/src/commands/web-command.ts` ya tiene un fallback que no depende de `require.resolve('@atlas/web/...')`:

```ts
} catch {
  return join(
    fileURLToPath(new URL('../../../../apps/web/dist/server.js', import.meta.url)),
  );
}
```

Ese fallback tiene un error de conteo: usa 4 niveles de `../`, pero debería ser 3. Verificado directamente: el build real de `packages/cli` genera `packages/cli/dist/atlas.js` como archivo único dentro de `dist/` (no en un subdirectorio). Desde ahí, la ruta a la raíz del repo es `dist/ → cli/ → packages/ → raíz` — exactamente 3 niveles, no 4.

Hoy este bug está dormido porque el fallback casi nunca se ejecuta (el `require.resolve` primario funciona mientras exista la dependencia declarada). Pero se vuelve el único mecanismo de resolución una vez que se aplique el fix de abajo, así que hay que corregirlo en el mismo cambio.

## Fix requerido

1. **`packages/cli/package.json`** — eliminar `@atlas/web` de `dependencies`. `packages/cli` no debe depender de `apps/web` bajo ninguna circunstancia; es un paquete de plataforma, `apps/web` es un consumidor (ver `apps/README.md`: "Applications SHALL consume the platform. They never implement it.").

2. **`packages/cli/src/commands/web-command.ts`** — en `resolveWebServerPath()`, eliminar el intento vía `require.resolve('@atlas/web/package.json')` (ya no hay dependencia declarada que lo respalde) y dejar como único mecanismo la resolución relativa por filesystem, corrigiendo el conteo de niveles:

```ts
export function resolveWebServerPath(): string {
  return fileURLToPath(new URL('../../../apps/web/dist/server.js', import.meta.url));
}
```

   (3 niveles de `../`, no 4. `createRequire` ya no seria necesario en este archivo si no se usa en ningún otro lado — confirmar y quitar el import si queda sin uso.)

3. **Verificar el path en runtime, no solo en teoría.** Después de un build real (`pnpm --filter @atlas/cli build` y `pnpm --filter @atlas/web build`), confirmar que `packages/cli/dist/atlas.js` existe y que, ejecutando `node packages/cli/dist/atlas.js web` (o el comando `atlas web` ya instalado), el path resuelto apunta efectivamente a `apps/web/dist/server.js` y el servidor arranca. No basta con que el conteo de `../` sea matemáticamente correcto — confirmarlo ejecutando.

## Verificación de cierre (obligatoria antes de reportar)

- `pnpm run build` en la **raíz** del repo debe terminar en exit code 0, sin warnings de dependencia circular.
- `pnpm run test` en la **raíz** del repo debe terminar en exit code 0.
- `pnpm --filter @atlas/cli test` → debe seguir en 69/69.
- `pnpm --filter @atlas/web test` → debe seguir en 7/7.
- `atlas web` (ejecutado desde el build real, no desde ts-node/dev) debe arrancar el servidor sin error de path.
- Confirmar que `packages/cli/package.json` ya no lista `@atlas/web` en ninguna sección (`dependencies`, `devDependencies`, ni `peerDependencies`).

## No negociables (heredados de P2.5, siguen aplicando)

- No tocar la lógica de `chat-turn.ts`, `server.ts`, `session-store.ts` — esto es exclusivamente un fix de packaging/resolución de rutas.
- No modificar tests existentes que ya pasan.
- Reportar el resultado exacto de `pnpm run build` y `pnpm run test` en la raíz (no solo `--filter`) como evidencia de cierre.
