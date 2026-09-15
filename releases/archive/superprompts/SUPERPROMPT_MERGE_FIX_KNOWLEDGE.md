# Super-prompt para Cursor — Mergear el fix ya verificado

Pega esto tal cual en Cursor.

---

## Contexto

El fix de la rama `fix/knowledge-stale-search-and-filter` (hash final `e87c3d0223c3c49e25360dca4443e570be066df0`) ya fue verificado de forma independiente en un `git worktree` completamente aislado (sin nada del working tree local): build 23/23, typecheck 35/35, lint 35/35, test 46/46 (612 tests), y las pruebas funcionales en vivo de ambos bugs (conocimiento desactualizado en el chat, búsqueda de Conocimiento sin filtrar) confirmadas contra un servidor real. Está aprobado para mergear.

## Qué necesito que hagas

1. Verifica que estás parado exactamente en el commit `e87c3d0223c3c49e25360dca4443e570be066df0` de la rama `fix/knowledge-stale-search-and-filter` (no en commits posteriores sin verificar).
2. Haz `git push origin fix/knowledge-stale-search-and-filter`.
3. Actualiza `main` con un fast-forward merge de esa rama (sin rebase, sin squash — mantén los 3 commits tal cual: `0c7bf5e`, `fce1f93`, `e87c3d0`). Si `main` avanzó desde que se creó la rama y el fast-forward no es posible, detente y dime — no hagas merge con conflictos por tu cuenta.
4. Haz `git push origin main`.
5. Borra la rama `fix/knowledge-stale-search-and-filter` tanto local como remota, ya integrada.
6. Después del merge, reconstruye (`pnpm build`) y reinicia el servidor real (`pnpm atlas web` o el comando que uses normalmente) para que quede corriendo con el código ya integrado.
7. Confirma con un `curl` real a `/api/health` que el servidor levantó correctamente después del reinicio.

## Nota sobre el WIP de carpetas/biblioteca

El feature de carpetas/biblioteca (los 4 archivos que quedaron fuera de este commit: `map-knowledge-documents.ts`, `map-knowledge-folders.ts`, `folder.ts`, `knowledge-folders-store.ts`) sigue sin commitear en tu working tree local, tal como lo dejaste. No lo toques en este merge — eso se retoma aparte cuando esté listo, en su propia rama.

## Formato de reporte esperado

- Confirmación de que el fast-forward a `main` se hizo sin conflictos (o aviso si no fue posible).
- Hash de `main` después del push.
- Resultado del `curl /api/health` tras reiniciar el servidor.
- Confirmación de que la rama `fix/knowledge-stale-search-and-filter` fue borrada.
