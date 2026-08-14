# ATLAS Web — Excel Knowledge Ingestion — Implementación (Parte B–G)

**Fecha:** 2026-08-14  
**Rama:** `feature/excel-knowledge` (fast-forward a `main` @ `970b168`)  
**Referencia:** `releases/WEB_UI_EXCEL_KNOWLEDGE_AUDIT.md`  
**Estado:** 🛑 **IMPLEMENTACIÓN COMPLETA — SIN COMMIT (esperando autorización)**

---

## 1. Qué se implementó

### Dependencia
- `xlsx@^0.18.5` (SheetJS CE) en `@atlas/web` únicamente.

### Nuevos módulos
| Archivo | Rol |
|---------|-----|
| `extract-excel.ts` | Parser workbook → hojas/headers/filas; fechas (`w` → ISO → serial); fórmulas (valor cacheado o marcador); validación de firma binaria |
| `chunk-excel.ts` | Chunking por filas con prefijo archivo/hoja/headers; metadata `rowStart`/`rowEnd` |

### Archivos modificados
- `constants.ts` — `xls`, `xlsx` en lista blanca
- `extract-text.ts` — delegación Excel (flatten para compatibilidad)
- `session-store.ts` — rama Excel antes de `chunkText`; metadata extendida; respuesta con `sheetCount`
- `map-knowledge-upload.ts` — campo opcional `sheetCount`
- `knowledge.ts` + `es.ts` — extensiones, fase “Leyendo hojas de cálculo…”, mensajes de éxito enriquecidos
- `icons.ts` — iconos para xls/xlsx
- Tests: `extract-excel`, `chunk-excel`, `knowledge-upload`, `server`, `fixture-utils`

### Sin tocar
- `packages/*` (frozen) — confirmado vacío en diff
- Motion System
- Biblioteca UI para Excel (decisión de producto: éxito enriquecido + búsqueda + chat)

---

## 2. Decisiones técnicas (sin desviación del audit)

| Tema | Implementación |
|------|----------------|
| Fechas | Preferir `cell.w`; ISO para `t:'d'`; serial vía `SSF.parse_date_code`; strings ambiguos `dd/mm/yyyy` se dejan literales |
| Fórmulas | Solo valor cacheado; `formatExcelCellValue` exportado para tests; marcador `[fórmula sin valor cacheado: …]` |
| Agregados V1 | LLM sobre chunks recuperados (limitación aceptada) |
| Workbooks corruptos | Validación de firma ZIP/XLS antes de parsear; error 422 humano |
| Versionado | Igual que otros formatos: registros adicionales; prefetch prioriza contenido reciente |

### Desviación menor documentada
- **`knowledge-folders-store.test.ts`:** se añadió `beforeEach` que limpia `ATLAS_MEMORY_FILE` del entorno — el test fallaba si quedaba seteado por servidores en vivo previos (contaminación local, no bug de Excel).

---

## 2.1 Fix post-auditoría: búsqueda de valores pegados al header

### Qué se encontró
Tras verificación independiente de Parte B, la búsqueda en Conocimiento fallaba para **valores de celda** cuando se buscaba por el valor solo (`Taladro`, `45000`, `Ferreteria`), aunque funcionaba para la segunda palabra de un valor multi-palabra (`Andina`, `Loja`).

### Causa raíz
`formatDataRow` emitía `Producto=Taladro` (sin espacio). El tokenizador de `@atlas/sdk` (`tokenizeForSearch`) divide solo por `\s+`, no por `=` ni `|`. El valor quedaba pegado al header como un único token; solo matcheaba búsquedas que coincidían con el prefijo del header.

**No se tocó `packages/sdk`** — el bug era del formato elegido en `apps/web`.

### Fix aplicado
En `extract-excel.ts`, `formatDataRow` ahora usa separador **`header: valor`** (dos puntos + espacio):

```typescript
parts.push(`${header}: ${value.length > 0 ? value : ''}`);
```

### Dependencias revisadas
- **`chunk-excel.ts` / `buildChunkPrefix`:** usa `Headers: Cliente | Producto | Monto` con espacios — **sin el mismo problema** (confirmado).
- **Tests/asserts:** se actualizaron expectativas que usaban `=` (`Activo=TRUE` → `Activo: TRUE`, `Valor=300` → `Valor: 300`). No hay parsers en `map-knowledge-upload.ts` ni i18n que dependan del formato antiguo.

### Prueba de regresión
1. **Unit test** (`extract-excel.test.ts`): fila Ferreteria/Taladro/45000 — confirma tokens separables y ausencia de `Producto=Taladro`.
2. **Integration HTTP** (`server.test.ts`): `finds excel cell values in knowledge search when queried by value alone` — sube xlsx y busca `Ferreteria`, `Taladro`, `45000`, `Comercial`, `Sierra` → `total >= 1` cada uno.

### Verificación en vivo (repro exacto del reporte)
Servidor `/tmp/verify-excel-fix` @ `:4176`, snippet indexado:
```
Fila 1: Cliente: Ferreteria Andina | Producto: Taladro | Monto: 45000
```

| Query | total |
|-------|-------|
| `Ferreteria` | 1 ✅ |
| `Taladro` | 1 ✅ |
| `45000` | 1 ✅ |
| `Comercial` | 1 ✅ |
| `Sierra` | 1 ✅ |

---

## 3. Quality Gate — checkout aislado `/tmp/verify-excel-fix`

```bash
git worktree add --detach /tmp/verify-excel-fix HEAD
# copia de archivos Excel + fix al worktree
cd /tmp/verify-excel-fix
pnpm install --frozen-lockfile
pnpm build && pnpm typecheck && pnpm lint && pnpm test
```

### Resultados reales

| Gate | Resultado |
|------|-----------|
| **build** | `Tasks: 23 successful, 23 total` |
| **typecheck** | `Tasks: 35 successful, 35 total` |
| **lint** | `Tasks: 35 successful, 35 total` |
| **test** | `Tasks: 46 successful, 46 total` — `@atlas/web`: **207/207** |

Frozen packages:
```bash
git diff --name-only main -- packages/core packages/compiler packages/runtime \
  packages/workflow packages/memory packages/retrieval packages/events \
  packages/intelligence packages/sdk
# (vacío)
```

Verificación adicional en working tree `feature/excel-knowledge` (mismo código): mismos 4 gates en verde tras fix lint en `extract-excel.ts`.

---

## 4. Smoke manual en vivo (servidor `/tmp/verify-excel`, puerto 4175)

`ATLAS_MEMORY_FILE=/tmp/atlas-excel-smoke-live/.atlas/memory.json`

### Paso 1 — Crear marca
```
$ curl -s -X POST http://127.0.0.1:4175/api/brands \
  -H 'Content-Type: application/json' \
  -d '{"name":"Excel Smoke Test","purpose":"Prueba Excel"}'
{"brand":{"id":"excel-smoke-test","name":"Excel Smoke Test",...,"knowledgeCount":0}}
```

### Paso 2 — Subir XLSX (2 hojas)
```
$ curl -s -X POST .../upload -F 'file=@ventas-v1.xlsx;filename=Ventas 2026.xlsx'
{"documentId":"doc....","fileName":"Ventas 2026.xlsx","folder":"General",
 "chunks":2,"sheetCount":2,"recordIds":[...]}
```
✅ Mensaje API con **2 hojas** y **2 fragmentos** reales.

### Pasos 3–4 — Búsqueda por hoja
Query `ventasq1` / `ventasq2` (coinciden con nombres de hoja `VentasQ1`/`VentasQ2`):
```
{"total":2,"records":[{"snippet":"...Hoja: VentasQ1 (1/2)...Acme Corp | Monto=150000..."}, ...]}
```

### Pasos 5–7 — Chat
Las preguntas activaron **workflows determinísticos** en este entorno (no LLM), pero el **prefetch recuperó los chunks correctos**:

- **Hoja 1:** `prior_goals` incluye `Monto=150000` para Acme Corp en VentasQ1.
- **Hoja 2:** `prior_goals` incluye `Monto=210000` para Beta Industries en VentasQ2.
- **Ranking (paso 7):** prefetch trajo ambas hojas; el workflow determinístico respondió sin agregación numérica explícita — **limitación V1 aceptada** (no hay SUM/ranking determinístico; el LLM dependería de modo `llm` con chunks en contexto).

### Paso 8–9 — Versión v2
```
$ upload ventas-v2.xlsx (mismo fileName)
{"sheetCount":2,"chunks":2,...}

$ chat "Tell me the exact Monto value for Acme Corp in sheet VentasQ1..."
retrieval.prior_goals[0]: "...Monto=999999"   ← v2
retrieval.prior_goals[1]: "...Monto=150000"   ← v1 (aún en memoria)
```
✅ Prefetch refleja **datos v2** en la posición prioritaria.

### Paso 10 — Aislamiento entre marcas
```
upload ventas-v1.xlsx → workspace=excel-smoke-test
search ventasq1 → default total: 7 | excel-smoke-test total: 2
```
✅ La marca nueva ve solo sus registros; default conserva los suyos.

### Paso 11 — `.xls` legacy
```
$ upload legacy-v1.xls
{"sheetCount":1,"chunks":1,...}

$ search legacyhoja
{"total":1,"snippet":"...Hoja: LegacyHoja...Codigo=LEGACY-001 | Nota=legacytoken001"}
```

---

## 5. Limitaciones conocidas (V1)

1. **Agregados/rankings:** dependen del LLM sobre ≤8 chunks de prefetch; sin herramienta de cálculo.
2. **Búsqueda por token:** términos pegados a `columna=valor` requieren queries que coincidan con tokens whitespace (p. ej. nombre de hoja `ventasq1`).
3. **Versionado:** v1 y v2 coexisten en memoria; prefetch prioriza recientes pero no hay deduplicación por `fileName`.
4. **UI biblioteca:** Excel no muestra fila dedicada en biblioteca; éxito enriquecido + búsqueda + chat.

---

## 6. Propuesta de commit (NO ejecutada)

```
feat(web): add Excel knowledge ingestion with searchable row values

Parse .xls/.xlsx with SheetJS, chunk rows with sheet context, and index
cell values using "Header: value" formatting so knowledge search can
match values independently. Includes sheetCount in upload response,
regression tests for value-only search, and enriched upload UX copy.
```

---

## 7. Archivos pendientes de commit

**Modificados:** 13 archivos (+499/−24 líneas en tracked)  
**Nuevos:** `extract-excel.ts`, `chunk-excel.ts`, `extract-excel.test.ts`, `chunk-excel.test.ts`  
**Sin commit. Sin push.**
