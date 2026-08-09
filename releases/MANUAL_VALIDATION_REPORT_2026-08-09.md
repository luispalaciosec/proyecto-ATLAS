# Informe de validación manual — ATLAS MVP + Phase 2

**Proyecto:** ATLAS  
**Tipo:** Pruebas funcionales manuales (playbook operativo)  
**Ejecutor:** Luis Palacios (+ asistencia Cursor para E6 y re-verificaciones)  
**Entorno:** macOS, repo local `/Users/luispalacios/ATLAS`  
**Fecha:** 8–9 de agosto de 2026  
**HEAD al cierre:** `6395876` (`fix(sdk): enforce authoritative tool results in LLM system prompt (L-02)`)  
**Alcance:** Capacidades P2.1–P2.5 vía CLI y Web UI  
**Referencia:** `VERSION.md`, `docs/guides/VERIFICATION_PLAYBOOK.md` (borrador local)

---

## 1. Resumen ejecutivo

Se ejecutó una batería de **6 ejercicios end-to-end** (E1–E6) sobre ATLAS, cubriendo memoria persistente, IA con tool-calling, planificación determinista, chat multi-turno, interfaz web, marcas con memoria aislada y **escalamiento cross-brand** (global ↔ brand Geeks).

**Conclusión general:** el **núcleo funcional está operativo y reproducible**. Memoria, plan, ask, chat, web y brand cumplen el flujo esperado en condiciones controladas.

**Matriz de cierre:** **6/6 PASS** (E6 completado el 9 de agosto, 12/12 criterios).

**Limitaciones documentadas (no bloquean el MVP):**

| ID | Hallazgo | Clasificación | Mitigación |
|----|----------|---------------|------------|
| **L-01** | Groq / `llama-3.3-70b-versatile`: `tool_use_failed` intermitente, rate limits | Limitación del proveedor | Anthropic estable; Groq como tier barato con reintentos |
| **L-02** | LLM afirma "no hay datos" pese a `memory_search` con `total > 0` | Prompt / obediencia del modelo | Fix en `6395876` — precedencia autoritativa en `SYSTEM_PROMPT` |
| **L-03** | Búsqueda substring literal (plural/acentos parciales) | Comportamiento MVP documentado | Fix acentos en `a63ed06`; prompts explícitos `Usa memory_search…` |
| **L-04** | `pnpm atlas web` no recarga `.env` ni memoria en caliente | Operacional | Reiniciar servidor tras cambiar env o datos |
| **L-05** | Feedback `/correct` deja `originalGoal` en metadata brand (grep ≠ aislamiento funcional) | Observación | `memory_search` por contenido sigue devolviendo 0 cross-brand |

**Post-validación (mismo día):**

- Quality gate restaurado: `0541c26` — typecheck/lint/build/test en verde desde raíz.
- `.atlas/` añadido a `.gitignore` (memoria local de usuario).

---

## 2. Entorno y configuración

| Parámetro | Valor |
|-----------|-------|
| Invocación CLI | `cd ATLAS && set -a && source .env && set +a && pnpm atlas …` |
| Memoria global | `.atlas/memory.json` |
| Brand Geeks | `.atlas/workspaces/geeks/profile.json`, `memory.json` |
| LLM primario (re-verificaciones) | Anthropic `claude-sonnet-5` |
| LLM secundario (E1–E5 iniciales) | Groq `llama-3.3-70b-versatile` (openai-compatible) |
| Web UI | `pnpm atlas web` → `http://127.0.0.1:4173` |

**Datos de prueba persistentes (no commiteados):** registros Ana García VIP (global), pedido G-500 (brand Geeks), INC-9001 / RES-G500-01 (E6).

---

## 3. Matriz de ejercicios (6/6)

| ID | Descripción | Resultado | Notas |
|----|-------------|-----------|-------|
| **E1** | Memoria + `ask` + `plan` (Ana García VIP) | **PASS** | Plan con acentos falló → workaround `Garcia`; corregido en `a63ed06` |
| **E2** | Chat multi-turno CLI | **PASS** | Turnos 1–2 con historial; Anthropic estable; pipe requiere `sleep` entre líneas |
| **E3** | Web UI `default` | **PASS** | `/api/health`, chat determinista/LLM |
| **E4** | `atlas brand geeks` | **PASS** | Aislamiento memoria: global Ana=8, brand G-500=0 cruzado |
| **E5** | Brand Web geeks ↔ default | **PASS** | Tras reiniciar web con Anthropic; 4/4 casos aislamiento |
| **E6** | Escalamiento cross-brand (avanzado) | **PASS 12/12** | Ver §4 |

---

## 4. Ejercicio E6 — Escalamiento cross-brand (detalle)

**Historia:** incidente pedido G-500 (Geeks) escalado en operaciones central (global), resuelto en brand, feedback aplicado, auditoría de aislamiento CLI + Web.

**Ejecutado:** 9 de agosto de 2026 · Provider: Anthropic · Criterio: ≥ 10/12 → **12/12 PASS**.

### Fase A — Operaciones central

| Paso | Comando / acción | Esperado | Observado |
|------|------------------|----------|-----------|
| A1 | `memory store` INC-9001 + `memory search` | Matches: 1 | ✅ `Matches: 1` |
| A2 | `plan --goal` seguimiento INC-9001 | SUCCESS | ✅ Compilation + Execution SUCCESS |
| A3 | `ask` memory_search + plan_and_execute | Turns ≥ 2, Budget OK | ✅ Turns: 3, auditoría registrada |

### Fase B — Brand Geeks (CLI)

| Paso | Acción | Esperado | Observado |
|------|--------|----------|-----------|
| B2 | search G-500 | laptop, lunes, 30 días | ✅ Detalle VIP Ana + garantía |
| B3 | store RES-G500-01 | guardado en Geeks | ✅ `record.cli....oizytfx4` |
| B4 | search INC-9001 | total 0 | ✅ Respuesta: `0` |
| B5 | `/correct` driver GPU | Feedback recorded | ✅ `record.cli....aryzxycx` |

### Fase C — Nueva sesión Geeks

| Esperado | Observado |
|----------|-----------|
| RES-G500-01 + driver GPU | ✅ Resumen en una frase con actualización driver GPU |

### Fase D — Auditoría inversa (global)

| Query | Workspace | Esperado | Observado |
|-------|-----------|----------|-----------|
| RES-G500 | global CLI | 0 | ✅ Matches: 0 |
| INC-9001 | global CLI | ≥ 1 | ✅ Matches: 3 |
| ask RES-G500 | global | 0 registros | ✅ "total de 0 registros" |

### Fase E — Web dual

*Primera pasada con servidor obsoleto en `:4173` falló parcialmente (L-04). Tras `kill` + `pnpm atlas web` desde repo root:*

| # | Workspace | Goal | Esperado | Observado |
|---|-----------|------|----------|-----------|
| 1 | geeks | RES-G500 resumen | resolución driver GPU | ✅ RES-G500-01 + driver GPU |
| 2 | geeks | INC-9001 total | 0 | ✅ Total: 0 |
| 3 | default | INC-9001 total | ≥ 1 | ✅ Total: 3 |
| 4 | default | RES-G500 total | 0 | ✅ Total: 0 |

### Fase F — Bonus kernel

| Comando | Resultado |
|---------|-----------|
| `atlas compile --workspace workspaces/first-atlas-workspace` | ✅ SUCCESS |
| `atlas run --workspace workspaces/first-atlas-workspace` | ✅ SUCCESS |

### Criterios E6 (12/12)

| # | Criterio | |
|---|----------|---|
| 1 | INC-9001 en memoria global | ✅ |
| 2 | `plan` global OK | ✅ |
| 3 | `ask` usa tools (memory + plan_and_execute) | ✅ |
| 4 | Geeks recupera G-500 | ✅ |
| 5 | RES-G500-01 guardado solo en Geeks | ✅ |
| 6 | Geeks no ve INC-9001 (memory_search) | ✅ |
| 7 | `/correct` registrado | ✅ |
| 8 | Nueva sesión Geeks menciona driver GPU | ✅ |
| 9 | Global no ve RES-G500 | ✅ |
| 10 | Web: geeks ve RES, default no | ✅ |
| 11 | Web: default ve INC, geeks no | ✅ |
| 12 | compile + run OK | ✅ |

---

## 5. Experimento de proveedor LLM (9 de agosto)

| Provider | E2 chat | E5 Web | tool_use_failed |
|----------|---------|--------|-----------------|
| Groq `llama-3.3-70b-versatile` | Intermitente | Parcial / 429 | Sí (L-01) |
| Anthropic `claude-sonnet-5` | PASS | PASS 4/4 | No observado |

**Conclusión L-01:** la inestabilidad de tool-calling es **limitación de Groq/Llama**, no defecto arquitectónico de ATLAS. El esfuerzo de hardening debe priorizar documentación de tiers de proveedor y fallback, no reescribir el pipeline de tools.

**Conclusión L-02:** fix de prompt en `6395876`; verificación manual Groq post-fix mostró obediencia en 2/2 casos (muestra pequeña, no garantía absoluta).

---

## 6. Quality gate (post-validación)

Verificado en raíz tras `0541c26`:

| Gate | Resultado |
|------|-----------|
| `pnpm run typecheck` | 35/35 |
| `pnpm run lint` | 35/35 |
| `pnpm run build` | 23/23 |
| `pnpm run test` | 46/46 |

---

## 7. Veredicto

| Dimensión | Estado |
|-----------|--------|
| Kernel + arquitectura (Phase 1) | Cerrado (Frozen) |
| Código Phase 2 (P2.1–P2.5) | Entregado y verificado en repo |
| **Validación manual E1–E6** | **6/6 PASS — cerrada** |
| Confiabilidad LLM en producción real | Dependiente del proveedor; Anthropic recomendado para demos |
| Listo para documentación de usuario | **Sí**, con limitaciones L-01–L-05 documentadas |

---

## 8. Referencias

| Documento | Propósito |
|-----------|-----------|
| [`releases/QUALITY_GATE_FIX_TYPECHECK_LINT.md`](./QUALITY_GATE_FIX_TYPECHECK_LINT.md) | Fix typecheck/lint |
| [`releases/LLM_TOOL_RESULT_PRECEDENCE_FIX.md`](./LLM_TOOL_RESULT_PRECEDENCE_FIX.md) | Fix L-02 |
| [`docs/guides/VERIFICATION_PLAYBOOK.md`](../docs/guides/VERIFICATION_PLAYBOOK.md) | Playbook reproducible (borrador local) |
| [`ATLAS_PRODUCT_VISION_v1.0.md`](../ATLAS_PRODUCT_VISION_v1.0.md) | Criterio de producto |

---

*Informe generado al cierre de la validación manual Phase 2. Datos de memoria en `.atlas/` son locales del ejecutor y no forman parte del repositorio.*
