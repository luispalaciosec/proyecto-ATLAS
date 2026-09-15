# WEB UI — Fase 3 (Entregables 1–4)

**Tipo:** Informe de implementación  
**Fecha:** 9 de agosto de 2026  
**Alcance:** `@atlas/web` — vertical slice producto (scaffold + shell + i18n + chat v2)  
**Fuente UX:** [`docs/WEB_UI_PRODUCT_UX.md`](../docs/WEB_UI_PRODUCT_UX.md) §20 ítems 1–4  
**Prerequisito:** [`releases/WEB_UI_AUDIT.md`](./WEB_UI_AUDIT.md) Fase 1 PASS · UX Fase 2 PASS

---

## 1. Objetivo

Convertir la Web UI de demostración técnica en interfaz operacional principal para uso diario sin terminal, implementando los primeros cuatro entregables del plan Fase 3:

1. Scaffold Vite + TypeScript + tokens CSS  
2. App shell (header, sidebar, navegación, espacio activo, responsive)  
3. i18n español centralizado + mappers de presentación  
4. Chat v2 (conversación en lenguaje natural, markdown, corrección, errores amigables)

---

## 2. Alcance

### Implementado

| # | Entrega | Estado |
|---|---------|--------|
| 1 | Vite + TS + tokens CSS | **Complete** |
| 2 | App shell + router + selector espacio | **Complete** |
| 3 | i18n ES + format-error + map-chat-response | **Complete** |
| 4 | Chat v2 | **Complete** |

### Fuera de alcance (no iniciado)

Ítems 5–12 del plan §20: historial reload (`GET /api/history`), actividad granular, memoria read-only API/UI, settings persistidos, streaming, proyectos, auth, cloud.

---

## 3. Decisiones

| Decisión | Razón |
|----------|-------|
| SPA Vite (sin React) | Alineado con stack §18 UX doc; capa delgada, sin segunda infraestructura UI |
| Vanilla TS + History API | Router ligero; suficiente para slice 1–4 |
| `marked` + `DOMPurify` | Markdown seguro en respuestas del asistente |
| Build dual `tsup` + `vite` | Servidor Node separado del bundle cliente en `dist/public/` |
| SPA fallback en Express | Rutas `/chat`, `/memoria`, etc. sirven `index.html` tras build |
| Español vía `src/i18n/es.ts` | Sin hardcode disperso; glosario humano (no "workspace", "goal") |
| Errores vía `formatUserError` | No exponer `429`, `tool_use_failed`, `ECONNREFUSED` al usuario |

---

## 4. Arquitectura

```text
Browser (dist/public — Vite SPA)
  ↓ fetch /api/*
apps/web/src/server.ts (Express)
  ↓ @atlas/cli (executeChatTurn, applyCorrection, listWorkspaces)
@atlas/sdk → Kernel
```

**Respetado:**

- Web UI = capa de presentación únicamente  
- Sin acceso directo a `.atlas` desde el navegador  
- Sin modificación de paquetes Frozen/Certified  
- Sin lógica duplicada de Memory/Compiler/Runtime  
- API existente sin cambio de contrato (`goal`, `workspace`, `correction`)

**Cambio server mínimo:** middleware SPA fallback (GET no-API → `index.html`) + orden error handler al final.

---

## 5. Archivos principales

### Nuevos

```text
apps/web/index.html
apps/web/vite.config.ts
apps/web/src/client/          # main, app, shell, pages, api, state, lib, styles
apps/web/src/i18n/            # es.ts, index.ts
apps/web/src/presentation/   # format-error.ts, map-chat-response.ts
apps/web/tests/client/
apps/web/tests/i18n/
apps/web/tests/presentation/
```

### Modificados

```text
apps/web/package.json         # vite, marked, dompurify; build tsup+vite
apps/web/tsconfig.json        # DOM lib, vite/client types
apps/web/src/server.ts        # SPA fallback
pnpm-lock.yaml
VERSION.md
docs/README.md
```

### Eliminados (legacy)

```text
apps/web/public/index.html
apps/web/public/app.js
apps/web/public/style.css
```

---

## 6. Endpoints consumidos

| Método | Ruta | Uso UI |
|--------|------|--------|
| GET | `/api/health` | (tests / diagnóstico) |
| GET | `/api/workspaces` | Selector espacio de trabajo |
| POST | `/api/chat` | Enviar mensaje (`goal`, `workspace?`) |
| POST | `/api/correct` | Corregir última respuesta LLM |

---

## 7. Componentes / módulos UI

| Módulo | Rol |
|--------|-----|
| `renderShell` | Header, sidebar, nav inline, selector espacio |
| `renderHome` | Bienvenida + CTA conversación |
| `renderChat` | Hilo, composer, corrección, estados |
| `renderPlaceholder` | Memoria / Marcas / Configuración — "Próximamente" |
| `mapChatResponse` | LLM/deterministic → copy humano |
| `formatUserError` | Errores backend → mensajes ES |
| `renderMarkdown` | Respuestas con markdown sanitizado |

---

## 8. Tests

| Suite | Resultado |
|-------|-----------|
| `apps/web` vitest | **26/26 PASS** (7 archivos) |
| Regresión API server | **7/7 PASS** (sin cambio contrato) |

Cobertura nueva: i18n, format-error, map-chat-response, app-state, shell, markdown.

---

## 9. Quality gate (2026-08-09)

| Comando | Resultado |
|---------|-----------|
| `pnpm build` | **23/23 PASS** |
| `pnpm typecheck` | **35/35 PASS** |
| `pnpm lint` | **35/35 PASS** |
| `pnpm test` | **45/46** — 1 fallo **preexistente** en `@atlas/cli` (`dev-bootstrap.test.ts` timeout `pnpm atlas --help`, no introducido por este trabajo) |
| `pnpm --filter @atlas/web test` | **26/26 PASS** |

---

## 10. Riesgos y límites

| Riesgo / límite | Mitigación / nota |
|-----------------|-------------------|
| Historial se pierde en F5 | Item #5 pendiente (`GET /api/history`) |
| Actividad ATLAS genérica | Backend no expone progreso granular; UI usa "ATLAS está trabajando…" |
| Memoria / Settings placeholder | Items #9–10 pendientes |
| Sesión server in-memory | Comportamiento P2.5 sin cambio |
| `@types/dompurify` deprecated warning | dompurify 3.x incluye tipos; warning pnpm no bloqueante |

---

## 11. Auditoría arquitectónica

| Pregunta | Respuesta |
|----------|-----------|
| ¿Paquete Frozen modificado? | **NO** |
| ¿Contrato API cambiado? | **NO** |
| ¿Lógica Kernel duplicada? | **NO** |
| ¿Acceso directo Memory? | **NO** |
| ¿API paralela? | **NO** |
| ¿ADR requerido? | **NO** (solo `apps/web`) |

---

## 12. Próximos pasos

1. Item #5 — `GET /api/history` + reload conversación ([`WEB_UI_CHAT_HISTORY_RELOAD_FIX.md`](./WEB_UI_CHAT_HISTORY_RELOAD_FIX.md))  
2. Item #6 — actividad ATLAS discreta (si backend lo permite)  
3. Item #9 — memoria read-only  
4. Item #10 — configuración + avanzado  
5. QA manual E3/E5 sobre nueva SPA tras `pnpm build && atlas web`

---

## VEREDICTO

**PASS** — Entregables Fase 3 ítems 1–4 completos, quality gate verde salvo flake preexistente en CLI bootstrap test.

**Arranque:** `pnpm --filter @atlas/web build && atlas web` → `http://127.0.0.1:4173`
