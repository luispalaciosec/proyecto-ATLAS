# ATLAS — Playbook de verificación manual

Guía para validar que ATLAS funciona **antes** de seguir construyendo o publicar documentación externa.

**Alcance:** solo capacidades certificadas (MVP + P2.1–P2.5). Ver `VERSION.md`.

**Invocación recomendada:** desde la raíz del repo, tras `pnpm install` y `pnpm build`:

```bash
pnpm atlas <comando>
```

---

## Prerrequisitos

| Requisito | Comando / nota |
|-----------|----------------|
| Build | `pnpm build` |
| LLM (opcional) | `.env` con `ATLAS_LLM_*` — ver README § LLM providers |
| Memoria | Por defecto `.atlas/memory.json` en el cwd |
| Web | `pnpm atlas web` → `http://127.0.0.1:4173` |

Cargar `.env` en la shell:

```bash
set -a && source .env && set +a
```

---

## Matriz de casos de uso

Marca cada fila: **PASS** / **FAIL** / **SKIP** (sin LLM, etc.).

| ID | Área | Caso | PASS |
|----|------|------|------|
| A1 | Setup | Doctor sin LLM | ☐ |
| A2 | Setup | Doctor con LLM | ☐ |
| A3 | Setup | Version | ☐ |
| B1 | Kernel | Compile workspace | ☐ |
| B2 | Kernel | Run workspace | ☐ |
| C1 | Memory | Store + search literal | ☐ |
| C2 | Memory | Persistencia tras reinicio | ☐ |
| D1 | Plan | Plan determinista + memoria | ☐ |
| E1 | Ask | Ask sin LLM (error claro) | ☐ |
| E2 | Ask | Ask + memory_search | ☐ |
| F1 | Chat | Chat determinista | ☐ |
| F2 | Chat | Chat LLM multi-turno | ☐ |
| G1 | Brand | Brand aislado por slug | ☐ |
| H1 | Feedback | /correct en brand LLM | ☐ |
| I1 | Web | Health + chat en browser | ☐ |

---

## A — Configuración y diagnóstico

### A1 — Doctor sin LLM

```bash
unset ATLAS_LLM_API_KEY ATLAS_LLM_MODEL
pnpm atlas doctor
```

**Esperado:** `Status: HEALTHY`, `llm: not configured`.

### A2 — Doctor con LLM

```bash
# con .env cargado
pnpm atlas doctor
```

**Esperado:** `llm: configured (provider=openai-compatible|anthropic)`.

### A3 — Version

```bash
pnpm atlas version
```

**Esperado:** versión CLI `@atlas/cli` 0.1.0 y referencia al SDK.

---

## B — Kernel (compile / run)

Workspace de referencia: `workspaces/first-atlas-workspace/`

### B1 — Compile

```bash
pnpm atlas compile --workspace workspaces/first-atlas-workspace
```

**Esperado:** exit 0, artifacts generados.

### B2 — Run

```bash
pnpm atlas run --workspace workspaces/first-atlas-workspace
```

**Esperado:** exit 0, ejecución completada.

---

## C — Memoria persistente

### C1 — Store + search (substring literal)

```bash
pnpm atlas memory store --content "Pedido #123 del cliente VIP, entrega el lunes"
pnpm atlas memory search --query pedido
pnpm atlas memory search --query pedidos
```

**Esperado:**

- `pedido` → `Matches: 1`
- `pedidos` → `Matches: 0` (MVP: sin stemming; documentar en manual de usuario)

### C2 — Persistencia

```bash
pnpm atlas memory search --query pedido
# cerrar terminal, abrir otra, mismo cwd
pnpm atlas memory search --query pedido
```

**Esperado:** sigue `Matches: 1`. Archivo: `.atlas/memory.json`.

---

## D — Plan determinista

### D1 — Plan con goal

```bash
pnpm atlas plan --goal "Organizar entrega del pedido VIP el lunes"
pnpm atlas memory search --query "pedido VIP"
```

**Esperado:** plan ejecutado (exit 0); opcionalmente registro en memoria buscable.

---

## E — Ask (LLM + tools)

Requiere LLM configurado.

### E1 — Sin API key

```bash
unset ATLAS_LLM_API_KEY
pnpm atlas ask --goal "Hola"
```

**Esperado:** error claro (configuración), no stack trace críptico.

### E2 — memory_search vía tool

```bash
set -a && source .env && set +a
pnpm atlas memory store --content "Nota: pedido VIP #123"
pnpm atlas ask --goal "Usa memory_search con query pedido y responde en una frase"
```

**Esperado:** `Turns: 2`, `Budget: OK`, menciona el contenido guardado.

**Nota Groq:** si aparece `tool_use_failed`, reintentar o cambiar modelo a `llama-3.3-70b-versatile` / `meta-llama/llama-4-scout-17b-16e-instruct`.

---

## F — Chat conversacional

### F1 — Modo determinista (sin LLM)

```bash
unset ATLAS_LLM_API_KEY ATLAS_LLM_MODEL
printf 'planifica revisar inventario\n/exit\n' | pnpm atlas chat
```

**Esperado:** respuesta vía planning determinista, exit limpio.

### F2 — Modo LLM (con historial)

```bash
set -a && source .env && set +a
# sesión interactiva manual:
pnpm atlas chat
```

Turnos sugeridos:

1. `Recuerda que el cliente VIP prefiere entrega los lunes`
2. `¿Qué te dije sobre el cliente VIP?`

**Esperado:** segundo turno usa contexto del primero (modo `llm`).

---

## G — Brand (memoria aislada)

### G1 — Aislamiento por marca

```bash
pnpm atlas brand geeks
```

En el REPL:

```text
El tono de Geeks es técnico y directo
/exit
```

Verificar archivos:

```text
.atlas/workspaces/geeks/profile.json
.atlas/workspaces/geeks/memory.json
```

Buscar en memoria global vs brand:

```bash
pnpm atlas memory search --query geeks
# vs memoria en .atlas/workspaces/geeks/memory.json (brand aislada)
```

**Esperado:** perfil y memoria bajo slug `geeks`, separados de `cli.default`.

---

## H — Feedback loop

Requiere LLM en sesión brand.

### H1 — /correct

```bash
set -a && source .env && set +a
pnpm atlas brand geeks
```

En REPL, tras una respuesta del asistente:

```text
/correct Siempre mencionar garantía de 30 días en productos Geeks
/exit
```

**Esperado:** mensaje de confirmación; registro `Feedback` en memoria de la marca.

---

## I — Web UI local

### I1 — Servidor y chat

Terminal 1:

```bash
set -a && source .env && set +a
pnpm atlas web
```

Terminal 2:

```bash
curl -s http://127.0.0.1:4173/api/health
```

Navegador: `http://127.0.0.1:4173`

**Esperado:**

- `/api/health` → `{"ok":true}`
- UI carga, selector de workspace, envío de mensaje responde

---

## Criterio de “listo para documentar”

Puedes publicar manual de usuario y docs web cuando:

1. Al menos **A, C, E2, F1** están en PASS de forma repetible.
2. Los FAIL están **documentados como limitaciones conocidas** (ej. búsqueda literal, Groq intermitente).
3. `pnpm test` y `pnpm build` en verde en la misma revisión.

---

## Referencias

- Registro oficial: `VERSION.md`
- Visión de producto: `ATLAS_PRODUCT_VISION_v1.0.md`
- Quick start kernel: `workspaces/first-atlas-workspace/GETTING_STARTED.md`
