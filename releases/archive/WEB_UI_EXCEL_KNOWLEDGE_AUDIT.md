# ATLAS Web — Excel Knowledge Ingestion — Auditoría técnica (Parte A)

**Fecha:** 2026-08-14  
**Rama auditada:** `feature/excel-knowledge`  
**Commit base:** `e87c3d0223c3c49e25360dca4443e570be066df0`  
**Alcance:** soporte `.xls` / `.xlsx` como fuente de Conocimiento (sin Motion System)  
**Estado:** 🛑 **AUDITORÍA COMPLETA — ESPERAR AUTORIZACIÓN ANTES DE IMPLEMENTAR**

---

## 0. Verificación de baseline (ejecutada al inicio)

```bash
git branch --show-current   # feature/excel-knowledge
git log --oneline -1        # e87c3d0 Restore upload server test to pre-library expectations.
git status                  # limpio salvo untracked: design/, releases/*.md
```

- Rama WIP `wip/knowledge-library-and-chat-reasoning` @ `820e1ea` **no inspeccionada ni mezclada**.
- Baseline funcional de referencia: build 23/23, typecheck 35/35, lint 35/35, test 46/46 (`@atlas/web` 172/172).

---

## 1. Pipeline actual de Knowledge (estado real en `main` @ `e87c3d0`)

### 1.1 Diagrama

```text
Browser (Conocimiento)
  knowledge.ts
    · file picker + drag & drop
    · validación cliente: SUPPORTED_UPLOAD_EXTENSIONS
    · fases UX: uploading → reading → indexing → available (XHR + timers cliente)
  client.ts
    · POST multipart /api/knowledge/upload (campo `file`, opcional `workspace`)
      ↓
Express (server.ts)
    · multer memoryStorage, límite 15MB (MAX_UPLOAD_BYTES)
    · NO valida MIME — solo tamaño y presencia de archivo
    · handleKnowledgeUploadError → JSON { error } humano (400/422)
      ↓
SessionStore.uploadKnowledgeDocument (session-store.ts)
    · resolveSupportedExtension(fileName)  ← lista blanca en constants.ts
    · extractTextFromBuffer(buffer, ext, fileName)
    · assertExtractedText (rechaza vacío → 422)
    · chunkText(text)  ← max 6000 chars, cortes en párrafos/líneas/espacios
    · por cada chunk:
        atlas.memory.storeContent({
          content: chunkText,
          recordType: 'document',
          metadata: { source, fileName, fileType, chunkIndex, totalChunks, uploadedAt }
        })
      ↓
@atlas/sdk MemoryModule.storeContent (FROZEN — no tocar)
    · content: { text: string }
    · metadata libre (merge con namespaceId, workspace, source)
    · persistencia JSON por workspace (memory.json)
      ↓
Recuperación
    · Búsqueda UI: GET /api/knowledge/search → searchKnowledge → memory.searchContent
      → matchesContentQuery (sdk, corregido en e87c3d0)
    · Chat: LlmModule.prefetchKnowledgeForGoal (sdk, corregido en e87c3d0)
      → inyecta bloque fresco en system prompt cada turno
      ↓
Conversación
    · POST /api/chat → executeChatTurn → llm.ask con historial + prefetch
```

### 1.2 Aislamiento por Marca

- `SessionStore.getOrCreate(workspaceKey)` crea un `Atlas` distinto por marca.
- Marcas: `paths.memoryFilePath` bajo `.atlas/workspaces/<slug>/memory.json`.
- Default: `.atlas/memory.json`.
- Patrón de tests existente: `server.test.ts` → `isolates knowledge search between brand workspaces`, `isolates brand memory across workspaces over HTTP`.

### 1.3 Formatos soportados hoy

| Extensión | Parser | Ubicación |
|-----------|--------|-----------|
| pdf | pdf-parse | `extract-text.ts` |
| docx | mammoth | `extract-text.ts` |
| pptx | JSZip + strip XML | `extract-text.ts` |
| txt, md | UTF-8 plain | `extract-text.ts` |
| **xls, xlsx** | **rechazados** | tests esperan `undefined` / 400 |

Lista blanca: `apps/web/src/lib/knowledge-upload/constants.ts`  
Duplicada en cliente: `knowledge.ts` → `SUPPORTED_UPLOAD_EXTENSIONS`

### 1.4 Metadata actual por documento subido

```typescript
metadata: {
  source: 'upload',
  fileName: string,
  fileType: extension,      // 'pdf' | 'docx' | ...
  chunkIndex: number,
  totalChunks: number,
  uploadedAt: ISO string,
}
```

`storeContent` en sdk **acepta `recordType` y `metadata` arbitrarios** — confirmado en `packages/sdk/src/modules/memory-module.ts` líneas 154–167. **No hace falta modificar sdk** para añadir `sheetName`, `sheetIndex`, `rowRange`, `totalSheets`, etc.

### 1.5 Versionado / reemplazo

- **No existe** borrado ni reemplazo atómico de un documento.
- Subir el mismo `fileName` dos veces crea **registros adicionales** (nuevos `recordId`, nuevo `uploadedAt`).
- El chat prioriza conocimiento **fresco por prefetch** en cada turno; si v2 contiene términos más específicos o más registros coincidentes, tenderá a reflejar datos nuevos — pero **no hay deduplicación por fileName**.
- Comportamiento Excel debe **replicar el actual** (B10): subir v1 → preguntar → subir v2 → preguntar; test obligatorio.

### 1.6 UI de Conocimiento en `main` (gap B12)

En `main` @ `e87c3d0`, la página Conocimiento tiene:

- Upload (dropzone + progreso)
- Búsqueda + resultados (`map-knowledge.ts`)
- **No hay biblioteca/listado persistente** de documentos (eso vive en WIP `820e1ea`, fuera de scope).

Implicación para B12 del prompt:

- Tras subir Excel, el usuario lo ve en: mensaje de éxito del upload, búsqueda en Conocimiento, y respuestas de chat.
- El mockup `📊 Ventas 2026.xlsx · Excel · 4 hojas` **requiere UI de biblioteca** que no está en `main`.
- **Propuesta Parte B:** en esta fase, cumplir B12 con:
  1. Mensaje de éxito enriquecido (`Ventas 2026.xlsx · Excel · N hojas · M fragmentos`).
  2. Tarjetas de búsqueda con `typeLabel: Documento` y snippet que incluya nombre de hoja.
  3. **No** implementar biblioteca completa (pertenece al WIP aparte).
- Si el producto exige listado tipo biblioteca ya, habría que **autorizar merge previo del WIP** o un slice mínimo de listado — fuera del alcance acordado de solo Excel.

### 1.7 Fases de upload (honestidad B11)

Las fases `reading` / `indexing` en `client.ts` son **timers del cliente** (`setTimeout` 350ms / 1100ms), no reflejan progreso real del servidor. El servidor procesa síncronamente en un solo request.

Para Excel:

- Mantener las mismas fases (consistencia UX).
- Enriquecer mensaje final con datos **reales** devueltos por el API (`sheetCount`, `chunks`).
- Opcional: fase `reading` → copy específico “Leyendo hojas de cálculo…” (i18n).
- **No** inventar sub-fases por hoja sin streaming real.

---

## 2. Dependencias existentes

Búsqueda en `apps/web/package.json` y lockfile:

| Librería | Presente | Uso actual |
|----------|----------|------------|
| xlsx / sheetjs | **No** | — |
| exceljs | **No** | — |
| jszip | Sí | pptx |
| mammoth | Sí | docx |
| pdf-parse | Sí | pdf |

**Conclusión:** hay que añadir **una** dependencia nueva en `@atlas/web` únicamente.

---

## 3. Propuesta técnica — Excel en el mismo Knowledge System

### 3.1 Principio

Excel → **texto estructurado normalizado** → **chunking con contexto de hoja** → **mismos `storeContent` / búsqueda / chat** que PDF/DOCX. No crear endpoints, stores ni UI paralelos.

### 3.2 Librería recomendada: **`xlsx` (SheetJS Community Edition)**

| Criterio | `xlsx` (SheetJS CE) | `exceljs` |
|----------|---------------------|-----------|
| Licencia | Apache-2.0 | MIT |
| `.xlsx` | Sí | Sí |
| `.xls` (BIFF legacy) | Sí | No |
| Uso en Node/servidor | Sí (`read(buffer)`) | Sí |
| Mantenimiento | Amplio ecosistema | Activo, más pesado |
| Tamaño | Moderado | Mayor |
| Valores calculados / fechas | `cell.v`, `cell.w`, SSF | Similar |

**Elección:** `xlsx` — única opción madura que cubre **ambos** `.xls` y `.xlsx` en una dependencia, alineado con el prompt.

Instalación prevista: `pnpm add xlsx --filter @atlas/web` (solo `apps/web`).

### 3.3 Parser (B2)

Nuevo módulo propuesto: `apps/web/src/lib/knowledge-upload/extract-excel.ts`

Responsabilidades:

1. `read(buffer, { type: 'buffer', cellDates: true, cellNF: true, cellText: true })`
2. Iterar `workbook.SheetNames` en orden.
3. Por hoja: detectar fila de headers (heurística: primera fila no vacía con ≥2 celdas con texto).
4. Emitir filas como texto estructurado, p. ej.:

```text
[Hoja: Ventas Q1]
Headers: Cliente | Producto | Monto | Fecha

Fila 1: Cliente=Farmacias del Oriente | Producto=Plan Premium | Monto=150000 | Fecha=2026-07-15
Fila 2: ...
```

5. Separador entre hojas: `\n\n---\n\n` + banner `[Hoja: …]` (nunca mezclar sin etiqueta).

Tipos de celda:

- **Texto / número / booleano:** stringify determinista.
- **Vacías:** omitir clave o marcar vacío explícito según columna.
- **Fechas (B4):** preferir `cell.w` (texto formateado) si existe; si `cell.t === 'd'`, ISO `YYYY-MM-DD`; si serial number, convertir con utilidades xlsx + documentar. **No** convertir silenciosamente strings ambiguos ("07/08/2026").
- **Fórmulas (B5):** usar valor cacheado (`cell.v` / `cell.w`). Si la celda tiene fórmula (`cell.f`) pero no valor, insertar marcador `[fórmula sin valor cacheado: =SUM(...)]` — no evaluar.

### 3.4 Normalización y chunking (B3, B6)

**Problema:** `chunkText()` actual corta por párrafos de 6000 chars — funciona para PDF/DOCX, pero puede **partir filas** de Excel a la mitad y perder headers.

**Propuesta:** nuevo `chunk-excel.ts` (o rama en chunk layer):

- Input: array de `{ sheetName, sheetIndex, rows: string[] }` ya normalizadas.
- Por hoja: prefijo fijo replicado en **cada chunk**:

  ```text
  Archivo: Ventas 2026.xlsx
  Hoja: Clientes (2/4)
  Headers: Cliente | Venta | Mes
  ```

- Agrupar filas hasta ~`KNOWLEDGE_CHUNK_MAX_CHARS` (6000) sin cortar filas individuales.
- Si una fila excede el límite, truncar esa fila con elipsis (caso extremo).

`extract-text.ts` delega: `case 'xls': case 'xlsx': return extractExcelText(buffer, fileName)`.

### 3.5 Almacenamiento e metadata (B8)

Extender metadata por chunk (sin tocar sdk):

```typescript
metadata: {
  source: 'upload',
  fileName,
  fileType: 'xlsx' | 'xls',
  chunkIndex,
  totalChunks,
  uploadedAt,
  // Excel-specific:
  sheetName: string,
  sheetIndex: number,
  totalSheets: number,
  rowStart?: number,
  rowEnd?: number,
}
```

Trazabilidad en chat/búsqueda: el snippet ya incluye banner de hoja; el LLM cita `fileName` + contenido. No segundo sistema de citations.

### 3.6 Datos numéricos / agregados (B7)

**Hallazgo:** no existe herramienta determinística de agregación (SUM, AVG, ranking) en `apps/web` ni tool LLM dedicada.

Opciones evaluadas:

| Opción | Paquete | Veredicto |
|--------|---------|-----------|
| Pre-calcular agregados al ingest | apps/web | Complejidad alta, fuera de scope |
| Tool `spreadsheet_query` | sdk/cli | **Requiere frozen packages — NO** |
| LLM razona sobre filas recuperadas | ninguno | **V1 aceptada** |

**Decisión propuesta:** V1 depende del **razonamiento del LLM** sobre chunks recuperados vía prefetch + `memory_search`. Limitación conocida documentada. Preguntas simples de fila única y rankings sobre conjuntos pequeños-medios deberían funcionar; totales sobre hojas muy grandes pueden ser incompletos si los chunks relevantes no entran en prefetch (máx. 8 registros en bloque automático).

Mejora futura (fuera de scope): tool de agregación o pre-index de columnas numéricas — requeriría ADR + posiblemente sdk.

### 3.7 Punto exacto de integración en el flujo (respuesta ítem 1 del prompt)

| Paso | Archivo | Cambio |
|------|---------|--------|
| Lista blanca | `constants.ts` | añadir `xls`, `xlsx` |
| Parser | `extract-excel.ts` (nuevo) | lectura workbook |
| Orquestación | `extract-text.ts` | cases xls/xlsx |
| Chunking | `chunk-excel.ts` (nuevo) | filas + headers |
| Ingest | `session-store.ts` | rama Excel: chunks con metadata extendida; respuesta con `sheetCount` |
| API contract | `map-knowledge-upload.ts` | campos opcionales `sheetCount`, `totalSheets` |
| Cliente | `knowledge.ts`, `client.ts` | extensiones, mensaje éxito |
| i18n | `es.ts` | formatos, fases, errores Excel |
| Tests | varios | ver sección 5 |

**No tocar:** `packages/*`, rutas nuevas, SessionStore fuera de upload.

---

## 4. Riesgos

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| `.xls` legacy corrupto / raro | Media | Tests con fixture real; error 422 humano |
| Fechas ambiguas | Media | Preferir `cell.w`; documentar; no adivinar |
| Fórmulas sin cache | Media | Marcador explícito; no prometer evaluación |
| Workbooks grandes (>15MB) | Alta | Límite multer existente; muchos chunks → muchos records |
| Chunking corta contexto tabular | Alta | `chunk-excel.ts` con headers en cada chunk |
| Agregados incorrectos (LLM) | Alta | Documentar limitación V1; tests de fila única, no de SUM complejo |
| Regresión búsqueda/chat | Media | Tests regresión + no tocar sdk |
| B12 biblioteca ausente en main | Media | Éxito enriquecido + búsqueda; biblioteca = WIP aparte |
| Fases UX “falsas” | Baja | Ya existente; no empeorar; mensaje final con datos reales |
| Dependencia xlsx vulnerabilidades | Baja | Pin versión; solo server-side; límite tamaño |

---

## 5. Archivos a crear / modificar (Parte B planeados)

### Crear

- `apps/web/src/lib/knowledge-upload/extract-excel.ts`
- `apps/web/src/lib/knowledge-upload/chunk-excel.ts`
- `apps/web/tests/lib/extract-excel.test.ts`
- `apps/web/tests/lib/chunk-excel.test.ts`
- `apps/web/tests/fixtures/sample.xlsx` (generado en test o committed minimal)
- `apps/web/tests/fixtures/sample.xls` (opcional, si SheetJS lo genera)

### Modificar

- `apps/web/package.json` (+ `xlsx`)
- `apps/web/src/lib/knowledge-upload/constants.ts`
- `apps/web/src/lib/knowledge-upload/extract-text.ts`
- `apps/web/src/session-store.ts`
- `apps/web/src/presentation/map-knowledge-upload.ts`
- `apps/web/src/client/pages/knowledge.ts`
- `apps/web/src/i18n/es.ts`
- `apps/web/tests/knowledge-upload.test.ts`
- `apps/web/tests/server.test.ts`
- `VERSION.md` (Parte G, post-implementación)

### No tocar

- `packages/*` (confirmado viable para V1)
- `wip/knowledge-library-and-chat-reasoning`
- Motion / CSS animaciones (fase aparte)

---

## 6. Plan de tests (Parte C)

| Área | Tests |
|------|-------|
| Upload | `.xlsx` 200, `.xls` 200, `.zip` 400, mensaje extensión actualizado |
| Parser unit | 1 hoja, 3 hojas, headers, numéricos, texto, booleanos, fechas (ISO + serial), celdas vacías, fórmula con/sin cache |
| Chunk unit | no parte filas; cada chunk incluye banner hoja + headers |
| Integration HTTP | upload xlsx → search query término de celda → total ≥ 1 |
| Aislamiento | patrón geeks/revital de `server.test.ts` con Excel en una marca |
| Versión | subir v1 y v2 mismo nombre; search/chat refleja v2 (test con LLM mockeado o search-only) |
| Regresión | pdf/docx/txt fixtures existentes sin cambios |
| Error | buffer inválido → 422, mensaje sin stack trace |
| `packages/` diff | vacío en quality gate |

Retrieval/chat con agregados (“total”, “ranking”): **smoke manual** (Parte D), no assert automático frágil sobre LLM.

---

## 7. Decisiones explícitas (B4, B5, B7, B10, B12)

| Tema | Decisión |
|------|----------|
| **Fechas** | Priorizar texto formateado (`w`); ISO para tipo date; serial → conversión xlsx; ambiguo → dejar literal + log interno opcional |
| **Fórmulas** | Solo valor cacheado; sin motor de evaluación |
| **Agregados** | V1 = LLM sobre chunks; limitación documentada |
| **Versionado** | Igual que hoy: registros nuevos por upload; test v1→v2 |
| **UI biblioteca (B12)** | V1 sin listado tipo biblioteca (no está en main); éxito + búsqueda + chat |
| **Frozen packages** | **Cero cambios** en V1 — metadata + texto estructurado bastan |

---

## 8. ¿Hace falta tocar `packages/*`?

**No para V1**, con evidencia:

- Ingesta: parser en `apps/web`.
- Storage: `storeContent({ content, recordType: 'document', metadata })` ya soporta metadata Excel.
- Search: `matchesContentQuery` opera sobre `content.text` — headers/filas normalizadas serán buscables.
- Chat: `prefetchKnowledgeForGoal` ya ejecuta búsqueda fresca por tokens del goal.

**Escenarios que SÍ requerirían sdk (detener y ADR):**

- Búsqueda semántica por columna/tipo numérico nativa.
- Tool de agregación SQL-like sobre tablas.
- Indexación estructurada fuera de `{ text }` (p. ej. JSON en content con cambio de contrato).

---

## 9. Criterio de STOP

🛑 **Parte A completada.**  
**No se escribió código de implementación.**  
Esperando autorización explícita para **Parte B** (implementación XLS/XLSX).

---

## 10. Checklist smoke (Parte D — para ejecución manual post-implementación)

Documentado aquí para copiar a `WEB_UI_EXCEL_KNOWLEDGE_IMPLEMENTATION.md` en Parte G:

1. Crear marca de prueba.
2. Subir XLSX con 2+ hojas.
3. Confirmar mensaje de éxito con conteo de hojas/fragmentos.
4. Buscar término de hoja 1 en Conocimiento.
5. Preguntar en chat dato simple de hoja 1.
6. Preguntar dato de hoja 2.
7. Preguntar ranking/agregado (“¿quién vendió más?”).
8. Subir versión nueva del mismo archivo con datos distintos.
9. Repetir pregunta — debe reflejar v2.
10. Confirmar otra marca no ve el Excel.
11. Subir `.xls` legacy — repetir pasos 4–5.
