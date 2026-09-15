# ATLAS — Terminar el WIP de biblioteca/carpetas + chat-reasoning
# AUDIT (confirmar diagnóstico) → IMPLEMENT → TEST → QA (4 gates reales) → DOCUMENT → STOP

Objetivo de este prompt: dejar la rama `wip/knowledge-library-and-chat-reasoning`
100% verde en los 4 gates (build, typecheck, lint, test) y probada en
vivo, para poder mergearla a `main` — antes de seguir con Excel. La
meta es tener todo terminado en `main` antes de agregar nada nuevo.

============================================================
0. CONTEXTO Y DIAGNÓSTICO YA HECHO
============================================================
Rama: `wip/knowledge-library-and-chat-reasoning`, commit `820e1ea`,
creada desde `main @ e87c3d0`.

```bash
git checkout wip/knowledge-library-and-chat-reasoning
git log --oneline -1   # debe decir 820e1ea
```

Verificación independiente ya realizada (en checkout aislado real, no
en working tree) sobre este commit exacto:

| Gate | Resultado |
|------|-----------|
| build | 23/23 OK |
| lint | 35/35 OK |
| test (vitest) | 189/189 OK |
| **typecheck (tsc)** | **FALLA — 5 errores reales** |

Los tests pasan pero el typecheck NO — porque vitest no hace chequeo de
tipos estricto y no detecta esto. No confíes solo en `test` para decidir
si algo está bien; los 4 gates son obligatorios.

### Causa raíz (ya diagnosticada, no hace falta re-investigarla desde cero)

Hace unos commits, para poder mergear el fix de bugs de Conocimiento a
`main` sin arrastrar código roto, se le pidió a Cursor que quitara de
`session-store.ts` los métodos de biblioteca/carpetas
(`listKnowledgeDocuments`, `listKnowledgeFolders`, `createKnowledgeFolder`)
y el soporte de `folder` en `uploadKnowledgeDocument` (commit `fce1f93`).//
Eso arregló `main` correctamente. Pero el resto del WIP (`server.ts` con
las rutas HTTP, los mapeadores de presentación, los tests, el cliente)
sigue esperando que esos métodos existan — nunca se volvieron a agregar
en ningún lado después de quitarlos.

Los 5 errores de typecheck exactos, todos por esta misma causa:

```
src/server.ts(237,42): Property 'listKnowledgeDocuments' does not exist on type 'SessionStore'.
src/server.ts(250,36): Property 'listKnowledgeFolders' does not exist on type 'SessionStore'.
src/server.ts(263,36): Property 'createKnowledgeFolder' does not exist on type 'SessionStore'.
src/server.ts(304,11): Expected 3 arguments, but got 4.  (uploadKnowledgeDocument llamado con `folder`, que ya no acepta)
src/session-store.ts(354,5): Type is missing properties: documentId, folder  (falta en el tipo de retorno de uploadKnowledgeDocument)
```

### La implementación que faltaba SÍ existe en el historial de git

No hay que reinventarla. Existió en el commit `0c7bf5e` (el intento
original de Cursor, antes de que se separara). Recupérala como
referencia:

```bash
git show 0c7bf5e:apps/web/src/session-store.ts > /tmp/session-store-reference.ts
```

Ahí están las implementaciones originales de:
- `listKnowledgeDocuments(workspaceKey, folderFilter?)`
- `listKnowledgeFolders(workspaceKey)`
- `createKnowledgeFolder(workspaceKey, folderInput)`
- `#createKnowledgeDocumentId()`
- `uploadKnowledgeDocument(...)` extendido con `folder` y devolviendo
  `documentId` + `folder`

============================================================
1. GOBERNANZA
============================================================
NO modificar `packages/*`. Todo el trabajo es en `apps/web/`.

Esta rama SÍ puede tocar `packages/cli` si hace falta para el feature
de chat-reasoning/metrics (ya lo hace: `chat-turn.ts`,
`map-reasoning-steps.ts`) — no es un paquete Frozen formal, pero
trátalo con el mismo cuidado: cambios mínimos, con tests.

============================================================
2. REGLA DE EJECUCIÓN
============================================================
PARTE A — Confirmar el diagnóstico (rápido, no re-auditar desde cero).
↓
PARTE B — Restaurar/reconciliar `session-store.ts` con el resto del WIP.
↓
PARTE C — Correr los 4 gates completos en checkout aislado real.
↓
PARTE D — Si algo más aparece roto (más allá de los 5 errores conocidos),
          arreglarlo también, pero repórtalo — no lo escondas.
↓
PARTE E — Documentar qué se restauró y por qué.
↓
🛑 DETENTE. NO commit adicional automático sin mostrarme el diff primero.
   NO push. NO merges a main.

============================================================
PARTE A — CONFIRMAR DIAGNÓSTICO
============================================================
1. Reproduce el typecheck roto tú mismo para confirmar que ves los
   mismos 5 errores (no asumas que mi reporte es exacto — verifícalo).
2. Revisa `apps/web/src/presentation/map-knowledge-documents.ts` y
   `map-knowledge-folders.ts` (ya existen en el WIP) para confirmar qué
   forma de datos esperan de `SessionStore` — deben ser compatibles con
   lo que restaures.
3. Revisa `apps/web/src/lib/knowledge-upload/folder.ts` y
   `knowledge-folders-store.ts` (ya existen en el WIP) — son las
   utilidades de las que depende `session-store.ts` para manejar
   carpetas. Confirma que siguen siendo coherentes con lo que vas a
   restaurar.
4. Reporta en 3-5 líneas si el diagnóstico de la sección 0 es exacto o
   si encontraste algo adicional, antes de tocar código.

============================================================
PARTE B — RESTAURAR session-store.ts
============================================================
Usando `/tmp/session-store-reference.ts` (commit `0c7bf5e`) como
referencia, reintegra en el `session-store.ts` ACTUAL de esta rama
(que ya tiene el fix de `searchKnowledge` con el guard de query vacía —
no lo pierdas):

1. `listKnowledgeDocuments(workspaceKey, folderFilter?)`
2. `listKnowledgeFolders(workspaceKey)`
3. `createKnowledgeFolder(workspaceKey, folderInput)`
4. `#createKnowledgeDocumentId()`
5. Extender `uploadKnowledgeDocument` para aceptar `folder` como
   parámetro y devolver `documentId` + `folder` en la respuesta.

Importante: no es un copy-paste ciego. El `session-store.ts` actual de
esta rama ya tiene el fix de conocimiento desactualizado (el guard de
`searchKnowledge` con query vacía). Verifica que ese fix se mantenga
intacto después de reintegrar los métodos de biblioteca — no lo
pises sin querer.

============================================================
PARTE C — QUALITY GATE (4 gates, checkout aislado real)
============================================================
No lo corras en tu working tree con cambios sueltos — usa un checkout
aislado:

```bash
git worktree add --detach /tmp/verify-wip HEAD
cd /tmp/verify-wip
pnpm install --frozen-lockfile
pnpm build
pnpm typecheck
pnpm lint
pnpm test
```

Los 4 deben pasar. `typecheck` es el que más importa — es el que estaba
fallando. Pega el output real de los 4 comandos.

Confirma también:
```bash
git diff --name-only packages/core packages/compiler packages/runtime packages/workflow packages/memory packages/retrieval packages/events packages/intelligence packages/sdk
```
Debe estar vacío (nada de eso debe cambiar en esta rama).

============================================================
PARTE D — SI HAY MÁS SORPRESAS
============================================================
Si al restaurar los métodos aparecen más errores de typecheck, tipos
inconsistentes entre `map-knowledge-documents.ts` /
`map-knowledge-folders.ts` y lo que devuelve `session-store.ts`, o
tests que fallan por esta reconciliación — arréglalos, pero
repórtalos explícitamente en el resumen final. No los arregles en
silencio sin mencionarlos.

============================================================
PARTE E — VERIFICACIÓN FUNCIONAL EN VIVO
============================================================
Desde el checkout aislado de la Parte C, levanta el servidor real y
prueba en vivo (no solo tests automatizados):

1. `curl http://127.0.0.1:4173/api/health` → `{"ok":true}`
2. Sube un documento a una carpeta nueva vía
   `POST /api/knowledge/upload` con `folder` en el body.
3. `GET /api/knowledge/documents?workspace=...` → debe listar el
   documento con su `folder`.
4. `GET /api/knowledge/folders?workspace=...` → debe listar la carpeta
   creada.
5. Repite el escenario de UI si es más rápido: abre Conocimiento en el
   navegador, sube un documento a una carpeta, confirma que aparece en
   el listado.
6. Confirma que el chat-reasoning/metrics (lo otro que trae este WIP)
   sigue funcionando: haz una pregunta en Conversación y confirma que
   el desplegable "Ver razonamiento" y el contador de tokens aparecen
   como antes.

Pega transcripts/output reales de esto, no un resumen.

============================================================
PARTE F — DOCUMENTACIÓN
============================================================
Actualiza o crea `releases/WEB_UI_KNOWLEDGE_LIBRARY_COMPLETION.md` con:
- qué se restauró y por qué (referencia a este documento);
- los 4 gates con sus números reales;
- la verificación funcional en vivo;
- cualquier sorpresa encontrada en la Parte D.

============================================================
CRITERIO DE ÉXITO
============================================================
1. `typecheck` pasa (0 errores) — el gate que antes fallaba.
2. build, lint, test siguen en verde.
3. El fix de conocimiento desactualizado (prefetch, búsqueda) sigue
   intacto y sin regresión.
4. Biblioteca de documentos y carpetas funciona de verdad (subir,
   listar, filtrar por carpeta) — probado en vivo, no solo con tests.
5. Chat-reasoning/metrics sigue funcionando — probado en vivo.
6. `packages/*` (Frozen) sin cambios.
7. Nada de esto se commiteó automáticamente sin mostrarme el diff antes.

============================================================
FINAL
============================================================
NO hagas commit sin mostrarme antes qué vas a commitear.
NO hagas push.
NO toques `main` ni la rama `feature/excel-knowledge`.

Al terminar, entrega el resumen con los 4 gates, la verificación en
vivo, y una propuesta de mensaje de commit. Queda detenido esperando
mi autorización.
