# Web UI — Fase 3E — Conocimiento

**Fecha:** 2026-08-09  
**Alcance:** `@atlas/web` únicamente  
**Gate:** Product UX — Browse + Search + Understand + Use in conversation

---

## 1. Objetivo

Convertir el conocimiento existente de ATLAS en una experiencia B2B SaaS comprensible para usuarios no técnicos:

- Buscar qué sabe ATLAS sobre la empresa.
- Ver resultados con contexto de Marca.
- Continuar en Conversación sin perder contexto.
- Mantener aislamiento real entre marcas (backend como autoridad).

La Web traduce complejidad; no modifica semántica del Kernel.

---

## 2. Alcance

### Incluido

| Área | Entrega |
|------|---------|
| API | `GET/POST /api/knowledge/search`, alias `GET /api/memory/search` |
| Mapper | `map-knowledge.ts` → modelo producto UI |
| UI | Página `/conocimiento` con búsqueda, estados, resultados, retry |
| Integración | Conocimiento → Chat vía `pendingChatDraft` |
| Tests | API (6), mapper (5), UI (7) |
| i18n | Copy producto ES (LatAm/España neutro) |

### Excluido

- Editar/eliminar/importar conocimiento
- RAG/embeddings/vector DB nuevos
- Auth, Cloud, streaming
- Cambios en paquetes Frozen/Certified
- Administración completa de Marcas

---

## 3. Arquitectura

```text
Browser (/conocimiento)
    ↓ fetch /api/knowledge/search
Express (apps/web)
    ↓ SessionStore.searchKnowledge()
    ↓ session.client.memory.searchContent()  [@atlas/cli → @atlas/sdk]
    ↓ mapKnowledgeSearchToProduct()
    ↓ JSON producto → UI cards
```

**Aislamiento:** mismo mecanismo que Chat — `default` → `.atlas/memory.json`; marca → `.atlas/workspaces/{slug}/memory.json`.

---

## 4. Endpoints

### `GET /api/knowledge/search`

```
GET /api/knowledge/search?query=clientes&workspace=geeks
```

### `POST /api/knowledge/search`

```json
{ "query": "clientes VIP", "workspace": "geeks" }
```

### Alias documental

`GET /api/memory/search` → mismo handler (compatibilidad docs previos).

### Respuesta producto

```json
{
  "workspace": "geeks",
  "query": "Ana García",
  "total": 1,
  "records": [
    {
      "id": "record.1",
      "title": "Ana García es cliente VIP",
      "snippet": "Ana García es cliente VIP desde 2024.",
      "typeLabel": "Nota",
      "contextLabel": "Geeks",
      "sourceLabel": "Información almacenada en el conocimiento de Geeks.",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

Errores → `500` con `{ error }` (middleware existente). UI muestra mensaje humano + retry.

---

## 5. Product Mappers

**Archivo:** `apps/web/src/presentation/map-knowledge.ts`

| Función | Propósito |
|---------|-----------|
| `mapKnowledgeSearchToProduct()` | DTO SDK → respuesta UI |
| `buildKnowledgeConversationPrompt()` | Resultado → pregunta Chat |
| `buildKnowledgeSearchChatPrompt()` | Búsqueda sin resultados → pregunta Chat |

**Reglas:**

- No inventar scores de relevancia.
- `createdAt` solo si `timestamp` existe en registro.
- Tipos humanos: Nota, Plan de trabajo, Corrección.
- Texto extraído de `content.text` o JSON seguro.

---

## 6. Decisiones UX

| Decisión | Razón |
|----------|-------|
| Búsqueda como elemento principal | Responde “¿Qué puedo buscar?” |
| Empty state antes de buscar | Guía sin jerga técnica |
| Ejemplos clicables genéricos | Reduce fricción; no envían automáticamente |
| “Usar en una conversación” | Prepara Chat; usuario edita antes de enviar |
| Cambio de marca no fuerza Chat | Usuario permanece en Conocimiento |
| Detalles técnicos ocultos | Confianza + debugging opcional |

---

## 7. Aislamiento

Tests de integración HTTP (`tests/server.test.ts`):

- Geeks contiene `geeks-only-secret` → búsqueda en Geeks = 1.
- Revital con misma query = 0.
- Default con memoria propia no ve registros de marca.

El frontend **no filtra** resultados; confía en el workspace del endpoint.

---

## 8. Tests

**`@atlas/web`:** 60/60 PASS

| Suite | Casos |
|-------|-------|
| API knowledge | vacío, resultados default, POST workspace, aislamiento, error, alias memory |
| Mapper | payload válido, incompleto, inesperado, prompts Chat |
| UI knowledge | empty, loading, results, no-results, error+retry, → Chat, cambio marca |
| Regresión | chat, home, history, shell, app-state |

---

## 9. Accesibilidad

- `role="search"` en formulario de búsqueda.
- Labels explícitos en input.
- `aria-live="polite"` + `aria-busy` en zona de resultados.
- Botones reales (no divs clicables).
- Focus visible (`:focus-visible`) en input y botones.
- Contraste via tokens CSS existentes.

---

## 10. Responsive

- Buscador full-width en móvil; fila horizontal desde 640px.
- Cards apiladas verticalmente.
- Action grid home sin cambios; knowledge cards legibles en móvil.
- Sidebar existente colapsa en `<900px`.

---

## 11. Limitaciones

1. **Búsqueda substring** — comportamiento SDK `searchContent` (no ranking semántico).
2. **Sin detalle de registro individual** — no hay `GET /api/memory/records/:id` en esta fase.
3. **Sin browse paginado** — lista completa de coincidencias del engine.
4. **Query vacío** — SDK devuelve todos los registros; UI no auto-ejecuta búsqueda vacía al cargar.

---

## 12. Fuera de scope (documentado)

- Edición/eliminación de conocimiento
- Import/upload documentos
- Activity timeline
- Persistencia cross-restart de sesión Chat (decisión ADR pendiente de 3D+3B)

---

## 13. Archivos modificados / creados

### Creados

- `apps/web/src/presentation/map-knowledge.ts`
- `apps/web/src/client/pages/knowledge.ts`
- `apps/web/tests/presentation/map-knowledge.test.ts`
- `apps/web/tests/client/knowledge.test.ts`
- `releases/WEB_UI_PHASE_3E_IMPLEMENTATION.md`

### Modificados

- `apps/web/src/server.ts`
- `apps/web/src/session-store.ts`
- `apps/web/src/client/api/client.ts`
- `apps/web/src/client/app.ts`
- `apps/web/src/client/state/app-state.ts`
- `apps/web/src/client/styles/app.css`
- `apps/web/src/i18n/es.ts`
- `apps/web/tests/server.test.ts`
- `apps/web/tests/client/home.test.ts`
- `VERSION.md`
- `docs/README.md`

### NO modificados (deliberado)

- `packages/core`, `compiler`, `runtime`, `memory`, `retrieval`, `events`, `intelligence`, `sdk`, `cli`
- Contratos Frozen/Certified, ADRs

---

## 14. Evidencia quality gate (2026-08-09)

| Comando | Resultado |
|---------|-----------|
| `pnpm --filter @atlas/web test` | 60/60 PASS |
| `pnpm --filter @atlas/web typecheck` | PASS |
| `pnpm --filter @atlas/web lint` | PASS |
| `pnpm build` | 23/23 PASS |
| `pnpm typecheck` | 35/35 PASS |
| `pnpm lint` | 35/35 PASS |
| `pnpm test` | 46/46 PASS |
| `pnpm atlas doctor` | HEALTHY |

---

## 15. Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Usuario espera búsqueda semántica | Copy honesto; sugerir Conversación |
| JSON memoria mal formado (`version`) | Backend devuelve vacío; no crash |
| Sesión cacheada en SessionStore | Misma limitación que Chat; reinicio server refresca |

---

## 16. Siguiente fase recomendada

1. **Detalle de registro** — vista individual con metadata real (sin inventar fuentes).
2. **3F Activity** — timeline de acciones recientes.
3. **Marcas UI** — administración visual (sin cambiar semántica backend).
4. **ADR historial durable** — persistencia cross-restart.

---

## Arranque

```bash
pnpm --filter @atlas/web build && atlas web
```

Navegar a **Conocimiento** → buscar → **Usar en una conversación**.
