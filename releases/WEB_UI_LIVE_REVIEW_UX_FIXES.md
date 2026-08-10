# ATLAS Web — 3 fixes UX revisión en vivo

**Fecha:** 2026-08-10  
**Tipo:** Pulido UX/confianza post-piloto  
**Base:** `7569f05` — upload documentos  
**Alcance:** `apps/web/` (CSS) + `packages/sdk/` (prompt LLM + búsqueda memoria)

---

## VEREDICTO AUDITORÍA

### **PASS** — tres puntos implementados

| # | Fix | Archivo(s) | Estado |
|---|-----|------------|--------|
| 1 | Sidebar sticky en escritorio | `apps/web/src/client/styles/app.css` | **OK** |
| 2 | No filtrar IDs internos al usuario | `packages/sdk/src/modules/llm-module.ts` | **OK** |
| 3 | Búsqueda Conocimiento menos literal | `packages/sdk/src/modules/memory-module.ts` | **OK** |

---

## 1. Sidebar sticky (escritorio)

**Síntoma:** al hacer scroll en Inicio/Actividad, el menú lateral se iba con el contenido.

**Fix:** en `@media (min-width: 900px)`, `.shell__sidebar` usa `position: sticky; top: 0; height: 100vh; overflow-y: auto` — mismo patrón que `.shell__header`.

**No tocado:** drawer móvil (`position: fixed` en `.shell__sidebar.is-open` < 900px).

---

## 2. IDs técnicos en chat

**Síntoma:** respuestas citaban `workflow.cerrar.y.confirmar.pedido...` tras `plan_and_execute`.

**Fix:** instrucción añadida al `SYSTEM_PROMPT` (mismo mecanismo L-02): no leer en voz alta `workflowId`, `sessionId`, `memoryRecordId`, `recordId`; resumir en lenguaje de negocio.

**No tocado:** schema de tools ni Kernel.

---

## 3. Búsqueda Conocimiento singular/plural

**Síntoma:** "Clientes VIP" → 0 resultados; "cliente VIP" → 1; "VIP" → 3.

**Fix:** `matchesContentQuery` tokeniza la consulta; cada token ≥3 chars debe coincidir por prefijo bidireccional con algún token del texto (`cliente`↔`clientes`). Consultas solo con tokens cortos (≤2) mantienen fallback substring.

**No tocado:** `@atlas/memory`, `engine.search()`, embeddings.

---

## Verificación

| Paquete | Tests |
|---------|-------|
| `@atlas/sdk` | **40/40** (+4 vs 36) |
| `@atlas/web` | **165/165** (sin regresión) |

Nuevos tests:
- `matchesContentQuery` — plural/singular, VIP, no-match
- System prompt — guidance IDs internos

Smoke manual:
1. Scroll Inicio/Actividad → sidebar visible
2. Chat cierre venta → sin slug `workflow.`
3. Chip "Clientes VIP" en `/conocimiento` → resultados

---

## Governance

- **No** `packages/core`, `compiler`, `runtime`, `workflow`, `memory`, `retrieval`
- Cambio SDK acotado a post-filtro memoria + prompt LLM
