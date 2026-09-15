# Spec: subir documentos (PDF/DOCX/PPTX/TXT/MD) a Conocimiento

**Tipo:** Fix de bloqueo real de piloto, no la visión "Knowledge Ingestion + Action Runtime" de ChatGPT. Es la versión mínima: subir un archivo y que su texto quede buscable. Nada de extracción de reglas, nada de detección de conflictos, nada de conectores externos — eso queda documentado aparte como Horizon 2, condicional a señal del piloto.

## Por qué

Hoy la única forma de meter conocimiento a ATLAS es escribiéndolo o pegándolo en el chat (`memory_store` solo acepta texto). Para un piloto real con manuales, presentaciones y documentos de proceso, eso es inmanejable. Sin subir archivos, el piloto no es usable — esto no es una mejora, es un bloqueante.

## Verificado antes de escribir esta spec (no asumido)

- `atlas.memory.storeContent({ content, recordType?, metadata? })` (en `packages/sdk/src/modules/memory-module.ts`) ya acepta `metadata` libre y `recordType` libre (string, sin enum fijo) — no hace falta tocar `@atlas/memory` ni `@atlas/sdk` para taggear el origen del contenido.
- `session.client.memory.storeContent(...)` y `session.client.memory.searchContent(...)` ya se usan hoy desde `apps/web/src/session-store.ts` — el patrón de acceso ya existe, solo hay que reutilizarlo.
- No existe ningún parser de PDF/DOCX/PPTX en el repo hoy (verificado por grep) — hay que agregar dependencias nuevas, solo en `apps/web`.
- El Kernel (`core`, `compiler`, `runtime`, `workflow`, `intelligence`) y Certified (`memory`, `retrieval`) no necesitan ningún cambio para esto. Todo el trabajo es `apps/web`.

## Qué construir

### 1. Backend — `POST /api/knowledge/upload` en `apps/web/src/server.ts`

- `multipart/form-data` con campo `file` + campo opcional `workspace`.
- Usar `multer` (memory storage, no disco) para parsear el upload. Límite de tamaño: **15MB** (constante nombrada, fácil de ajustar).
- Formatos soportados en esta vuelta: `.pdf`, `.docx`, `.pptx`, `.txt`, `.md`. Cualquier otra extensión → `400` con mensaje claro (`"Formato no soportado: .xlsx. Formatos válidos: pdf, docx, pptx, txt, md."`), nunca un intento silencioso ni un 500.
- Extracción de texto por tipo:
  - `.pdf` → `pdf-parse`
  - `.docx` → `mammoth` (`mammoth.extractRawText`)
  - `.pptx` → extraer el zip (`.pptx` es un zip OOXML) y leer texto de `ppt/slides/slideN.xml` (librería tipo `jszip` + strip de tags XML, o una librería dedicada si es más simple — decisión de implementación, pero sin dependencias nativas/binarias que compliquen el build)
  - `.txt` / `.md` → leer buffer como UTF-8 directamente
- Si el texto extraído queda vacío (ej. PDF escaneado sin OCR) → `422` con mensaje explícito: `"No se pudo extraer texto de este archivo (¿es una imagen escaneada?)."` — no fallar en silencio, no guardar un registro vacío.
- Chunking: si el texto extraído supera **6000 caracteres**, partirlo en fragmentos secuenciales (preferentemente en saltos de párrafo `\n\n`, sin cortar a la mitad de una oración cuando sea evitable). Cada fragmento se guarda como un `memory_store` separado.
- Por cada fragmento, llamar:

```ts
await session.client.memory.storeContent({
  content: chunkText,
  recordType: 'document',
  metadata: {
    source: 'upload',
    fileName: originalFileName,
    fileType: extension, // 'pdf' | 'docx' | 'pptx' | 'txt' | 'md'
    chunkIndex: i,
    totalChunks: chunks.length,
    uploadedAt: new Date().toISOString(),
  },
});
```

- Responder `200` con:

```json
{
  "fileName": "Manual_Comercial_Geeks.pdf",
  "chunks": 4,
  "recordIds": ["...", "...", "...", "..."]
}
```

- Errores de extracción (archivo corrupto, librería lanza excepción) → `422` con `formatAtlasError`-style, mensaje legible, nunca `[object Object]` (mismo patrón ya establecido en `WEB_UI_CHAT_ENV_AND_ERROR_DISPLAY_FIX.md`).

### 2. Frontend — página `/conocimiento` (`apps/web/src/client/pages/knowledge.ts`)

- Agregar zona de "Subir documento" (botón + drag-and-drop) arriba del buscador existente.
- Validación client-side de extensión antes de subir (fallo rápido, mismo mensaje que el backend).
- Estado de carga visible mientras se sube/procesa (puede tardar unos segundos con PDFs grandes).
- Éxito → toast/mensaje: `"Se incorporó Manual_Comercial_Geeks.pdf (4 fragmentos guardados)"` + refrescar resultados de búsqueda si hay una búsqueda activa.
- Error → mostrar el mensaje legible del backend (reusar `extractApiErrorMessage`).

### 3. Dependencias nuevas (`apps/web/package.json` únicamente)

- `multer` (+ `@types/multer` en devDeps)
- `pdf-parse`
- `mammoth`
- Librería de extracción PPTX a elección del implementador (justificar brevemente cuál y por qué en el informe de cierre)

## No negociables

- **No** extracción de reglas/políticas estructuradas, **no** detección de conflictos, **no** grafo de conocimiento, **no** motor de razonamiento — eso es Horizon 2, fuera de alcance aquí.
- **No** conectores de acciones externas (Gmail/WhatsApp/CRM/etc.) — fuera de alcance aquí.
- **No** tocar `packages/core`, `packages/compiler`, `packages/runtime`, `packages/workflow`, `packages/intelligence`, `packages/memory`, `packages/retrieval`. Todo el trabajo vive en `apps/web`.
- **No** OCR de PDFs escaneados en esta vuelta — si no hay texto extraíble, error claro, no silencioso.
- Chunking simple por tamaño, **sin** resumen ni NLP.

## Verificación de cierre

- Tests unitarios de extracción por tipo (fixtures pequeños de PDF/DOCX/PPTX/TXT/MD en `apps/web/tests/fixtures/`).
- Test de integración: subir un PDF de prueba vía `POST /api/knowledge/upload`, luego `GET /api/knowledge/search` con una palabra clave del contenido → debe aparecer.
- Test de formato inválido → `400` con mensaje claro, no 500.
- Test de PDF sin texto extraíble (mock) → `422` con mensaje claro.
- Test manual real: Luis sube un PDF o PPTX real de Geeks/Banco Amazonas, pregunta algo del contenido por chat, confirma que ATLAS lo encuentra.
- `pnpm --filter @atlas/web test`, `pnpm run build`, `pnpm run typecheck`, `pnpm run lint` — sin regresiones.
- Reportar conteo de tests nuevo vs. base (152 hoy) como evidencia de cierre, igual que en los hotfixes anteriores.
