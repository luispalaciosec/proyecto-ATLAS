# Super-prompt para Cursor — El commit del fix está roto si se aísla

Pega esto tal cual en Cursor.

---

## Contexto

Verifiqué de forma independiente el commit `0c7bf5eef7ee39fd2bce7a6f95028ae88c1ddf61` (rama `fix/knowledge-stale-search-and-filter`) en un checkout **realmente limpio** (`git worktree add --detach` sobre ese commit exacto, sin nada del working tree local). Resultado: **no compila**.

`apps/web/src/session-store.ts`, tal como quedó en ese commit, importa 4 archivos que nunca fueron commiteados — existen solo como archivos sueltos (untracked) en el working tree local, no en el historial de git:

```
src/session-store.ts:29 → './presentation/map-knowledge-documents.js'
src/session-store.ts:33 → './presentation/map-knowledge-folders.js'
src/session-store.ts:34 → './lib/knowledge-upload/folder.js'
src/session-store.ts:40 → './lib/knowledge-upload/knowledge-folders-store.js'
```

Error real reproducido (`pnpm build` en el checkout aislado):

```
✘ [ERROR] Could not resolve "./presentation/map-knowledge-documents.js"
✘ [ERROR] Could not resolve "./presentation/map-knowledge-folders.js"
✘ [ERROR] Could not resolve "./lib/knowledge-upload/folder.js"
✘ [ERROR] Could not resolve "./lib/knowledge-upload/knowledge-folders-store.js"
```

`pnpm typecheck` falla igual, con `TS2307: Cannot find module`, en las mismas 4 líneas.

El build/test que reportaste como "23/23 y 612 tests OK en copia limpia" tuvo que haberse ejecutado con el working tree completo (incluyendo esos 4 archivos sueltos), no con un checkout real del commit — porque aislado, no compila. Si alguien clona esta rama desde cero, o corre `git stash`, o hace un `git clone` nuevo, el build se rompe de inmediato.

**Nota importante:** la lógica del fix en sí (la parte de `packages/sdk` — `llm-module.ts` y `memory-module.ts`) sí la verifiqué en aislamiento total y es correcta: 43/43 tests pasan sin depender de nada de `apps/web`. El problema no es la lógica del fix de los bugs — es que el commit quedó incompleto por mezclar cambios de otro feature en curso (biblioteca de documentos / carpetas) que no se llegaron a commitear.

## Qué necesito que hagas

**Opción A (preferida):** Commitea los 4 archivos faltantes junto con sus tests asociados, para que `session-store.ts` tenga todas sus dependencias en el historial de git. Antes de hacerlo, revisa que esos archivos (`map-knowledge-documents.ts`, `map-knowledge-folders.ts`, `folder.ts`, `knowledge-folders-store.ts`) estén completos y no sean WIP a medias — si son parte de un feature de carpetas/biblioteca que todavía no está terminado, dilo explícitamente.

**Opción B (si el feature de carpetas no está listo para commitear):** Separa el commit en dos:
1. Un commit que contenga **solo** el fix de los dos bugs (el prefetch de conocimiento en `llm-module.ts`, el ajuste de `tokenMatchesQuery` en `memory-module.ts`, y el guard de query vacía en `session-store.ts`), sin ninguna referencia a los archivos de carpetas/biblioteca.
2. Deja el feature de carpetas/biblioteca en el working tree sin commitear (como está ahora) para commitearlo aparte cuando esté listo, en su propia rama.

Dime cuál opción aplicaste y por qué.

## Verificación obligatoria antes de reportar terminado

No repitas el error de esta vez: la verificación de "copia limpia" tiene que ser un checkout real y aislado del commit final, no una copia de tu working tree actual. Pasos exactos:

```bash
git worktree add --detach /tmp/verify-final <hash-del-commit-final>
cd /tmp/verify-final
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

Los 4 gates deben pasar **en ese checkout aislado**, sin ningún archivo adicional copiado desde tu working tree. Pega el output real de cada uno (no un resumen tipo "todo pasó").

## Formato de reporte esperado

- Qué opción aplicaste (A o B) y por qué.
- Hash del commit (o commits) final(es).
- Output real de build/typecheck/lint/test corridos en el checkout aislado descrito arriba.
- Confirmación explícita de que `git worktree add --detach` sobre ese hash, en un directorio nuevo, compila sin depender de nada fuera del propio commit.

No hagas push. Cuando termines, aviso y verifico yo de nuevo antes de integrar.
