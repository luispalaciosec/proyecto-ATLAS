# ATLAS Web — Chat: carga `.env` + errores legibles

**Fecha:** 2026-08-10  
**Tipo:** Hotfix post-piloto (chat marca Geeks)  
**Base:** `6082a8a` — README producto  
**Alcance:** `apps/web/` únicamente

---

## VEREDICTO AUDITORÍA

### **PASS** — implementado

| Hallazgo | Severidad | Estado |
|----------|-----------|--------|
| `POST /api/chat` → 500 en marca **Geeks** con mensaje en español | P0 funcional | **Corregido** (LLM activo vía `.env`) |
| «Ver detalles» muestra `[object Object]` | P1 UX / diagnóstico | **Corregido** |
| Servidor Web no cargaba `.env` del repo | P0 configuración | **Corregido** |
| Errores estructurados `@atlas/core` serializados como `[object Object]` | P1 robustez | **Corregido** |

---

## 1. Síntoma

En `/chat` con marca **Geeks**, el usuario envía *«Hola puedo saber mi inventario?»*:

- UI: *«No pudimos completar la solicitud.»* + botón *Intentar de nuevo*
- Consola: `POST /api/chat 500 (Internal Server Error)`
- *Ver detalles*: texto literal **`[object Object]`** (inútil para diagnóstico)

Workspace **default** respondía en modo determinístico; **Geeks** fallaba de forma consistente.

---

## 2. Causa raíz

### 2.1 `.env` no cargado al arrancar Web

`pnpm atlas web` delega en `apps/web/dist/server.js`. Ese proceso **no leía** `.env` en `process.cwd()`.

Consecuencia:

- `ATLAS_LLM_API_KEY` / `ATLAS_LLM_MODEL` ausentes en el proceso del servidor
- `executeChatTurn` elige **modo determinístico** (`planExecuteAndRemember`) en lugar de LLM
- En marca Geeks (`createBrandClient`) el flujo determinístico falla antes de responder

### 2.2 Error estructurado mal serializado

El Kernel lanza objetos planos (no `instanceof Error`), p. ej.:

```json
{
  "code": "CORE_INVALID_IDENTIFIER",
  "message": "Identifier must start with a letter and contain only alphanumeric characters, dots, colons, underscores, or hyphens",
  "module": "@atlas/core"
}
```

El middleware Express hacía:

```ts
error instanceof Error ? error.message : String(error)
// → "[object Object]"
```

El cliente repetía el patrón al hacer `throw new Error(payload.error)` si `error` era objeto.

---

## 3. Solución

### 3.1 Carga de entorno

- Nuevo `apps/web/src/lib/load-env.ts`
- Invocado al inicio de `server.ts` **antes** de crear `SessionStore` / `AtlasService`
- Regla: **no sobrescribe** variables ya definidas en el shell (prioridad explícita del operador)

### 3.2 Formato de errores Atlas

- Nuevo `apps/web/src/lib/format-atlas-error.ts`
- `formatAtlasError(unknown)` → string legible (`CODE: message` o JSON)
- `extractApiErrorMessage(payload, fallback)` para respuestas API
- Servidor: middleware 500 + registro en actividad de conversación
- Cliente: `sendChatMessage` / `sendCorrection` usan extractor

---

## 4. Archivos

| Archivo | Cambio |
|---------|--------|
| `apps/web/src/lib/load-env.ts` | **Nuevo** — parser `.env` mínimo |
| `apps/web/src/lib/format-atlas-error.ts` | **Nuevo** — serialización errores |
| `apps/web/src/server.ts` | `loadEnvFromFile()` + `formatAtlasError` |
| `apps/web/src/client/api/client.ts` | `extractApiErrorMessage` en chat/correct |
| `apps/web/tests/format-atlas-error.test.ts` | **Nuevo** — 4 tests unitarios |
| `apps/web/tests/server.test.ts` | Regresión: error Geeks ≠ `[object Object]` |

---

## 5. Verificación

### Automatizada

```bash
pnpm --filter @atlas/web test    # 152/152 PASS
pnpm --filter @atlas/web typecheck
pnpm --filter @atlas/web lint
```

Casos nuevos:

- `formatAtlasError` con objeto `{ code, message }`
- `POST /api/chat` workspace `geeks` sin LLM → 500 con texto que contiene `CORE_INVALID_IDENTIFIER` (no `[object Object]`)

### Manual (smoke)

1. Asegurar `.env` con `ATLAS_LLM_API_KEY` y `ATLAS_LLM_MODEL` en la raíz del repo
2. `pnpm --filter @atlas/web build && pnpm atlas web`
3. Marca **Geeks** → `/chat` → *«Hola puedo saber mi inventario?»*
4. Esperado: respuesta LLM (sin 500)
5. Si falla red/LLM: *Ver detalles* muestra mensaje legible, no `[object Object]`

---

## 6. Governance

- Solo `apps/web/` + `releases/` + `VERSION.md`
- **Sin cambios** en `packages/*`
- `design/` sigue untracked — excluido del commit

---

## 7. Limitaciones / deuda aceptada

| Tema | Notas |
|------|-------|
| Modo determinístico + metas con `?` | Sigue fallando con `CORE_INVALID_IDENTIFIER` si LLM no está configurado — bug upstream en `planExecuteAndRemember` (`packages/sdk`); fuera de alcance de este hotfix |
| Parser `.env` | Subconjunto mínimo (sin export, sin multiline); suficiente para claves ATLAS actuales |
| Sin opción «Sistema» para env | Variables del shell siguen teniendo prioridad sobre `.env` |

---

## 8. Resumen operativo

| Antes | Después |
|-------|---------|
| Web ignora `.env` | Lee `.env` al boot si existe en `cwd` |
| 500 opaco en Geeks | LLM operativo con claves en `.env` |
| `[object Object]` en detalles | `CORE_INVALID_IDENTIFIER: …` u otro texto útil |
