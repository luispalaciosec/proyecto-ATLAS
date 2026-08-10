# ATLAS Web — Subida de documentos a Conocimiento (Piloto)

**Fecha:** 2026-08-10  
**Tipo:** Fix bloqueante de piloto — ingestión mínima de archivos  
**Base:** `aeea5f5` — chat `.env` + errores legibles  
**Alcance:** `apps/web/` únicamente

---

## VEREDICTO AUDITORÍA

### **PASS** — implementado según spec mínima

| Requisito spec | Estado |
|----------------|--------|
| `POST /api/knowledge/upload` multipart | **OK** |
| Formatos PDF/DOCX/PPTX/TXT/MD | **OK** |
| Extensión inválida → `400` mensaje claro | **OK** |
| Texto vacío → `422` mensaje claro | **OK** |
| Chunking 6000 chars + `recordType: document` | **OK** |
| UI drag-and-drop + validación cliente | **OK** |
| Sin cambios en `packages/*` | **OK** |
| Horizon 2 (reglas, conflictos, OCR, conectores) | **Fuera de alcance** ✓ |

---

## 1. Problema

El piloto solo podía incorporar conocimiento vía chat (`memory_store` con texto). Manuales, presentaciones y procesos en PDF/DOCX/PPTX no eran subibles — bloqueante para uso real.

---

## 2. Solución

### Backend

- Ruta **`POST /api/knowledge/upload`** (`multipart/form-data`: `file`, `workspace` opcional).
- **`multer`** memory storage, límite **`MAX_UPLOAD_BYTES = 15MB`**.
- Extracción:
  - **PDF** → `pdf-parse`
  - **DOCX** → `mammoth.extractRawText`
  - **PPTX** → `jszip` + lectura `ppt/slides/slideN.xml` + strip XML (`a:t`)
  - **TXT/MD** → UTF-8 directo
- **`chunkText()`** — fragmentos ≤6000 chars, preferencia `\n\n` / `\n` / espacio.
- Persistencia vía `session.client.memory.storeContent` con metadata de upload.
- Errores tipados **`KnowledgeUploadError`** (400/422) + `formatAtlasError` para 500.

### Frontend

- Zona **Subir documento** en `/conocimiento` (botón + drag-and-drop).
- Validación de extensión antes del upload.
- Estado de carga + mensaje de éxito en barra de estado (`statusText`).
- Re-búsqueda automática si había consulta activa.

### Dependencias nuevas (`apps/web` only)

| Paquete | Uso |
|---------|-----|
| `multer` | Parse multipart |
| `pdf-parse` | Texto PDF nativo (sin OCR) |
| `mammoth` | Texto DOCX |
| `jszip` | PPTX como OOXML zip — sin binarios nativos, build simple |

---

## 3. Archivos

| Archivo | Rol |
|---------|-----|
| `src/lib/knowledge-upload/constants.ts` | Límites, extensiones, mensajes |
| `src/lib/knowledge-upload/chunk-text.ts` | Fragmentación |
| `src/lib/knowledge-upload/extract-text.ts` | Extracción por tipo |
| `src/lib/knowledge-upload/upload-errors.ts` | Errores HTTP tipados |
| `src/session-store.ts` | `uploadKnowledgeDocument()` |
| `src/server.ts` | Ruta upload + multer |
| `src/client/pages/knowledge.ts` | UI upload |
| `src/client/api/client.ts` | `uploadKnowledgeDocument()` |
| `src/presentation/map-knowledge.ts` | Label `Documento` |
| `tests/fixtures/*` | Fixtures TXT/MD + helpers DOCX/PPTX |
| `tests/knowledge-upload.test.ts` | Unit extracción/chunking |
| `tests/server.test.ts` | Integración upload + search |

---

## 4. Verificación

```bash
pnpm --filter @atlas/web test      # 165/165 PASS (+13 vs base 152)
pnpm --filter @atlas/web typecheck
pnpm --filter @atlas/web lint
pnpm run build
```

Casos cubiertos:

- Extracción TXT, MD, DOCX, PPTX (+ PDF vía mock de `pdf-parse` en unit test)
- Upload TXT → búsqueda por keyword del fixture
- `.xlsx` → `400` con mensaje claro
- Texto vacío (mock) → `422` con mensaje OCR/scaneado
- UI: zona upload, upload exitoso refresca búsqueda

### Smoke manual

1. `pnpm --filter @atlas/web build && pnpm atlas web`
2. Marca **Geeks** → `/conocimiento`
3. Subir PDF/DOCX/PPTX real con texto seleccionable
4. Buscar palabra clave del documento → debe aparecer como **Documento**
5. Preguntar en `/chat` sobre el contenido → LLM debe encontrarlo vía `memory_search`

---

## 5. Governance

- **No** cambios en Kernel ni Certified packages.
- **No** OCR, reglas estructuradas, conflictos, conectores externos.
- PDF escaneado → error explícito 422 (comportamiento esperado).

---

## 6. Limitaciones aceptadas

| Tema | Notas |
|------|-------|
| PDF escaneado | Sin OCR en esta vuelta |
| PPTX | Solo texto en slides XML; sin notas del presentador ni tablas complejas |
| Búsqueda | Sigue siendo substring (`includes`); upload no mejora ranking semántico |
| Duplicados | Re-subir mismo archivo crea registros nuevos |

---

## 7. Respuesta API ejemplo

```json
{
  "fileName": "Manual_Comercial_Geeks.pdf",
  "chunks": 4,
  "recordIds": ["record.cli....", "..."]
}
```

Metadata por fragmento: `source: upload`, `fileName`, `fileType`, `chunkIndex`, `totalChunks`, `uploadedAt`.
