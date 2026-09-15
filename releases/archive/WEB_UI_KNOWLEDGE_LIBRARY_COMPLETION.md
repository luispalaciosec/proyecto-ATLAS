# ATLAS Web — Knowledge Library WIP — Completado

**Fecha:** 2026-08-14  
**Rama:** `wip/knowledge-library-and-chat-reasoning` @ `820e1ea`  
**Cambio aplicado:** reconciliación de `session-store.ts` (sin commit aún)

---

## 1. Qué se restauró y por qué

### Causa raíz

Al mergear el fix de Conocimiento a `main` (commit `fce1f93`), se eliminaron de `session-store.ts` los métodos de biblioteca/carpetas para no arrastrar código roto. El resto del WIP (`server.ts`, mapeadores, cliente, tests) **siguió referenciándolos**, produciendo 5 errores de typecheck.

### Restauración

Se reintegraron desde la referencia `0c7bf5e` (adaptadas al `session-store.ts` actual):

| Método / cambio | Función |
|-----------------|---------|
| `listKnowledgeDocuments(workspaceKey, folderFilter?)` | Lista documentos agregados por `documentId`, filtra por carpeta |
| `listKnowledgeFolders(workspaceKey)` | Lista carpetas persistidas en `knowledge-folders.json` |
| `createKnowledgeFolder(workspaceKey, folderInput)` | Crea carpeta nueva (409 si duplicada) |
| `#createKnowledgeDocumentId()` | ID estable por upload |
| `uploadKnowledgeDocument(..., folderInput?)` | Acepta carpeta, guarda `documentId` + `folder` en metadata, devuelve ambos |

### Fix preservado

El guard de `searchKnowledge` con query vacía → `total: 0` **permanece intacto** (líneas 290–296 del archivo actual).

### Archivo modificado

- `apps/web/src/session-store.ts` (+66 líneas, 1 archivo)

### Sin sorpresas adicionales (Parte D)

No aparecieron errores extra tras la restauración. Typecheck, build, lint y test pasaron en el primer intento post-fix.

---

## 2. Quality Gate — checkout aislado real

Worktree: `/tmp/verify-wip` (detached @ `820e1ea` + `session-store.ts` corregido)

```bash
git worktree add --detach /tmp/verify-wip HEAD
cp apps/web/src/session-store.ts /tmp/verify-wip/apps/web/src/session-store.ts
cd /tmp/verify-wip
pnpm install --frozen-lockfile
pnpm build && pnpm typecheck && pnpm lint && pnpm test
```

| Gate | Resultado |
|------|-----------|
| **build** | **23/23 OK** |
| **typecheck** | **35/35 OK** (antes: 5 errores en `@atlas/web`) |
| **lint** | **35/35 OK** |
| **test** | **46/46 OK** — `@atlas/web`: **189/189** |

Frozen packages sin diff:

```bash
git diff --name-only packages/core packages/compiler packages/runtime \
  packages/workflow packages/memory packages/retrieval packages/events \
  packages/intelligence packages/sdk
# (vacío)
```

---

## 3. Verificación funcional en vivo

Servidor: `/tmp/verify-wip/apps/web` @ `http://127.0.0.1:4174`  
Memoria aislada: `ATLAS_MEMORY_FILE=/tmp/atlas-verify-live4/.atlas/memory.json`

### 3.1 Health

```
$ curl -s http://127.0.0.1:4174/api/health
{"ok":true}
```

### 3.2 Crear carpeta

```
$ curl -s -X POST http://127.0.0.1:4174/api/knowledge/folders \
  -H 'Content-Type: application/json' \
  -d '{"name":"Comercial","workspace":"default"}'
{"workspace":"default","folders":["General","Comercial"]}
HTTP:201
```

### 3.3 Upload con carpeta

```
$ curl -s -X POST http://127.0.0.1:4174/api/knowledge/upload \
  -F 'file=@.../sample.txt;filename=ventas-prueba.txt' \
  -F 'folder=Comercial' -F 'workspace=default'
{"documentId":"doc.1786714351781.bo11jagf","fileName":"ventas-prueba.txt",
 "folder":"Comercial","chunks":1,"recordIds":["record.cli.1786714351781.jkiumwpx"]}
HTTP:200
```

### 3.4 Listar documentos

```
$ curl -s 'http://127.0.0.1:4174/api/knowledge/documents?workspace=default'
{"workspace":"default","folders":["General","Comercial"],"total":1,
 "documents":[{"documentId":"doc.1786714351781.bo11jagf",
 "fileName":"ventas-prueba.txt","fileType":"txt","folder":"Comercial",
 "chunks":1,"uploadedAt":"2026-08-14T13:32:31.781Z",
 "recordIds":["record.cli.1786714351781.jkiumwpx"]}]}
```

### 3.5 Listar carpetas

```
$ curl -s 'http://127.0.0.1:4174/api/knowledge/folders?workspace=default'
{"workspace":"default","folders":["General","Comercial"]}
```

### 3.6 Filtrar por carpeta

```
$ curl -s 'http://127.0.0.1:4174/api/knowledge/documents?workspace=default&folder=Comercial'
{"workspace":"default","folder":"Comercial","folders":["General","Comercial"],
 "total":1,"documents":[...]}
```

### 3.7 UI — Biblioteca (navegador)

En `/conocimiento` se confirmó:

- Pestañas: **Todas las carpetas · General · Comercial**
- Tarjeta: **ventas-prueba.txt** — `TXT · 1 fragmento · Incorporado el 14 ago 2026, 8:32` — **Carpeta: Comercial**
- Selector de carpeta en upload incluye **Comercial**

### 3.8 UI — Chat reasoning/metrics (navegador)

En `/chat`, al enviar una pregunta:

- Panel en vivo **Razonamiento** con pasos (Analizando…, Consultando conocimiento…, etc.)
- Contador de tiempo **0.1 s** visible tras completar
- Botón **Ver razonamiento** presente en la respuesta del asistente

---

## 4. Estado git (sin commit)

```
 M apps/web/src/session-store.ts   (+66 líneas)
```

**No commit. No push.**

---

## 5. Propuesta de mensaje de commit

```
fix(web): restore knowledge library methods in session-store

Reintegrate listKnowledgeDocuments, listKnowledgeFolders,
createKnowledgeFolder, and folder-aware uploadKnowledgeDocument
removed during main cleanup (fce1f93). Fixes 5 typecheck errors
while preserving empty-query search guard.
```
