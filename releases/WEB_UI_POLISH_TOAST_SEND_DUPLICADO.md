# ATLAS Web — Polish: toast, botón enviar, aviso de duplicados en Conocimiento

**Fecha:** 2026-08-16  
**Alcance:** `apps/web/` únicamente  
**Estado:** 🛑 **IMPLEMENTADO — SIN COMMIT (esperando autorización)**

---

## Resumen

Tres mejoras de UX derivadas de uso real:

| # | Problema | Solución |
|---|----------|----------|
| 1 | Toast "Copiado" ilegible (tapado por el composer) | `#status-bar` como toast flotante fijo + auto-ocultar a 2,5 s |
| 2 | Botón enviar parece spinner en reposo | Ícono `Send` más grande, botón menos circular (`border-radius: 10px`) |
| 3 | Subir archivo duplicado no avisa | Modal de confirmación previo + banner persistente post-subida |

**Decisión de diseño (punto 3):** modal **antes** de subir (reutiliza `mountDialogRoot` / `dialog-backdrop` como marcas y cambio de workspace) + banner **después** si el usuario confirma. Así el aviso no se pierde como un toast efímero.

---

## 1. Toast / statusText

### Causa confirmada
`#status-bar` era un `<p role="status">` sin estilo visual, insertado **dentro del layout** (primero después de `<main>`, luego como hijo de `.shell` flex) — aparecía abajo a la izquierda, tapado por el composer, como texto gris pequeño.

### Cambios
- **`shell.ts`:** toast como `#status-bar.app-status-toast` hijo directo de `#app` (**fuera** de `.shell`), no participa en el flex del layout.
- **`app.css`:** notificación fija **arriba-centro** (debajo del header), fondo elevado, borde primario, sombra, tipografía semibold.
- **Auto-ocultar 3,2 s** para todos los mensajes efímeros cuando no hay `chatLoading` / `chatHistoryLoading`.
- **Un solo canal** — todo `patchState({ statusText })` pasa por aquí: Copiado, Pensando, Recuperando, errores de chat, éxito/error de upload, cambio de marca, etc.

### Fuente de verdad
Sigue siendo `statusText` en `app-state.ts` — no se duplicó mecanismo.

---

## 2. Botón enviar

### Verificación
Revisado `setComposerDisabled` en `chat.ts`: alterna correctamente `#chat-send-icon` / `#chat-send-spinner` con `hidden`. No se encontró bug de spinner pegado.

### Cambios (percepción)
- **`icons.ts`:** `ArrowUp` → `Send`, tamaño 20, `strokeWidth: 2.25`.
- **`app.css`:** botón con `border-radius: 10px` (menos “círculo = loader”).

---

## 3. Aviso de conocimiento duplicado (v1)

### Alcance v1
- Heurística por **nombre de archivo** (exacto + “parecido”).
- Usa **`GET /api/knowledge/documents`** existente — sin endpoint nuevo.
- **No** deduplica ni borra — solo informa.

### Heurística “parecido”
Módulo `knowledge-duplicate-file-name.ts`:
- Quita extensión, normaliza separadores.
- Elimina `v1`/`v2`, años de 4 dígitos, fechas comunes, sufijos numéricos finales.
- Compara bases normalizadas en la **misma carpeta**.

Ejemplos cubiertos por tests:
- `lista_precios_2025.pdf` ↔ `lista_precios_2024.pdf`
- `politica_vacaciones_v2.docx` ↔ `politica_vacaciones_v1.docx`
- `manual.txt` ↔ `manual.txt` (exacto)

### Flujo UI
1. Usuario elige archivos → `fetchKnowledgeDocuments(workspace, folder)`.
2. Si hay coincidencia → modal con lista + botones Cancelar / Continuar.
3. Tras subida confirmada → banner `#knowledge-upload-notice` (persistente hasta “Entendido”), **sin** mensaje de éxito normal en `statusText`.

### Fuera de alcance (v2 — no implementado)
**Detección semántica por contenido** al subir: buscar conocimiento relacionado por tema/carpeta y llamada LLM corta comparando resumen del nuevo documento vs fragmentos existentes.

**Por qué no ahora:** costo y latencia en cada upload, falsos positivos, decisión de producto mayor.

**Qué haría falta:** pipeline de resumen al subir + retrieval por tema + prompt de comparación + UI de conflicto semántico (no solo por nombre).

---

## Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `client/components/shell.ts` | Toast flotante + auto-clear |
| `client/styles/app.css` | Estilos toast, send button, banner duplicados |
| `client/lib/icons.ts` | Ícono Send |
| `client/lib/knowledge-duplicate-file-name.ts` | **Nuevo** — heurística |
| `client/pages/knowledge.ts` | Modal + banner duplicados |
| `client/app.ts` | `bindKnowledgeDialogRoot` |
| `i18n/es.ts` | Textos modal/banner |
| `tests/client/knowledge-duplicate-file-name.test.ts` | **Nuevo** — unit |
| `tests/client/knowledge.test.ts` | 3 casos: nuevo / exacto / parecido |

`packages/*`: **sin diff**.

---

## Quality Gate — `/tmp/verify-ui-fixes`

```bash
git worktree add --detach /tmp/verify-ui-fixes HEAD
rsync -a apps/web/ /tmp/verify-ui-fixes/apps/web/
cd /tmp/verify-ui-fixes
pnpm install --frozen-lockfile
pnpm build && pnpm typecheck && pnpm lint && pnpm test
```

| Gate | Resultado |
|------|-----------|
| **build** | `Tasks: 23 successful, 23 total` |
| **typecheck** | `Tasks: 35 successful, 35 total` |
| **lint** | `Tasks: 35 successful, 35 total` |
| **test** | `Tasks: 46 successful, 46 total` — `@atlas/web`: **215/215** |

---

## Verificación funcional

Servidor: `/tmp/verify-ui-fixes` @ `http://127.0.0.1:4177`

### Health
```
$ curl -s http://127.0.0.1:4177/api/health
{"ok":true}
```

### Bundle incluye los fixes
```
$ grep -c 'status-bar--visible' apps/web/dist/public/assets/index-*.js
1
$ grep -c 'uploadDuplicateNoticeTitle' apps/web/dist/public/assets/index-*.js
2
```

### Tests de regresión (transcripts)

**Toast "Copiado"** — `tests/client/chat.test.ts`:
```
expect(getState().statusText).toBe('Copiado');
```
+ shell aplica `status-bar--visible` y auto-clear a 2,5 s.

**Duplicados** — `tests/client/knowledge.test.ts`:
- `shows a normal success message for a new file name` → `statusText` contiene nombre; banner oculto.
- `shows a duplicate confirmation dialog... exact file name` → modal visible; tras Continuar → banner "Conocimiento actualizado"; **no** mensaje "Se incorporó…" en statusText.
- `detects a similar file name...` → modal menciona `lista_precios_2024.pdf`; banner visible post-subida.

**Heurística** — `tests/client/knowledge-duplicate-file-name.test.ts`: 5/5 OK.

### Upload API (backend sin cambios)
```
POST /api/knowledge/upload  documento-nuevo-ui.txt  → 200 OK
GET  /api/knowledge/documents?folder=General       → total: 1
POST /api/knowledge/upload  documento-nuevo-ui.txt  → 200 OK (segundo registro paralelo — esperado; aviso es solo UI)
```

---

## Propuesta de commit (NO ejecutada)

```
fix(web): polish status toast, send icon, and duplicate upload notice

Show statusText as a fixed toast with auto-dismiss, clarify the chat send
button at rest, and warn before/after uploading knowledge files whose names
match or resemble existing documents in the same folder.
```

---

*Esperando autorización para commit. Sin push.*
