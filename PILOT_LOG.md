# Horizonte 1 — Piloto real de ATLAS

**Estado del código:** baseline de producto ATLAS 4.x (P2.1–P2.5 + INT-001–009 consolidados). Kernel v0.1 congelado. Excepción: bugs reales descubiertos durante el piloto se corrigen; features nuevas fuera de INT-010, no.
**Duración:** 2–4 semanas.
**Proyecto piloto:** Banco Amazonas.
**Workspace:** `geeks-banco-amazonas` (slug dedicado — memoria físicamente aislada, sin mezclar con otros clientes de Geeks).
**Proveedor LLM recomendado:** Anthropic (`claude-sonnet-5`) — ver `USER_MANUAL.md` sección 10 sobre por qué no Groq para esto.
**Interfaz:** Web UI (`http://127.0.0.1:4173`), no CLI. La terminal solo se usa para arrancar el servidor.

---

## Setup (una sola vez)

1. Confirma `ATLAS_LLM_PROVIDER=anthropic` en tu `.env`.
2. En terminal, una sola vez: `cd ATLAS && pnpm atlas web` — déjalo corriendo. (Si el servidor ya estaba corriendo antes de cambiar el `.env`, mátalo y vuelve a correr `pnpm atlas web` para que tome la config nueva.)
3. Abre `http://127.0.0.1:4173` en el navegador. En el campo "New brand slug" escribe `geeks-banco-amazonas` y da clic en "Use" — ATLAS crea el workspace automáticamente.
4. Desde ahí, todo por chat: cuéntale a ATLAS el propósito del proyecto, el tono, las reglas — se guarda como memoria y no hace falta tocar ningún archivo JSON a mano.
5. No vuelvas a abrir la terminal salvo para reiniciar el servidor (por ejemplo, si cambias el `.env` o cierras la ventana por error).

---

## Los tres tipos de uso a probar (no más, por ahora)

**A. Consultar** — "¿Qué sabemos actualmente del Banco Amazonas?", "¿Qué decisiones hemos tomado sobre esta campaña?"

**B. Registrar** — "Guarda como memoria las decisiones tomadas en la reunión de hoy", "Guarda que Banco Amazonas aprobó X y el siguiente paso es Y."

**C. Pensar** — "Basándote únicamente en la información disponible de Banco Amazonas, ¿qué problemas estratégicos detectas?", seguido de "¿Qué información te falta para responder mejor?"

No cargues 500 documentos, no conectes Drive/Notion, no pidas features nuevas todavía. El objetivo es usar lo que ya existe.

---

## Registro diario

Copia esta tabla para cada sesión de trabajo:

| Campo | Detalle |
|---|---|
| Fecha | |
| Tarea | |
| Qué pregunté / pedí | |
| Qué respondió ATLAS | |
| Herramienta usada (memory_search / memory_store / plan_and_execute / ninguna) | |
| ¿Me ahorró tiempo? (sí/no + por qué) | |
| ¿Tuve que corregirlo? (`/correct` usado o no) | |
| ¿Qué faltó o me incomodó? | |
| ¿Qué quise hacer y no pude? | |

---

### Sesión 1

| Campo | Detalle |
|---|---|
| Fecha | |
| Tarea | |
| Qué pregunté / pedí | |
| Qué respondió ATLAS | |
| Herramienta usada | |
| ¿Me ahorró tiempo? | |
| ¿Tuve que corregirlo? | |
| ¿Qué faltó o me incomodó? | |
| ¿Qué quise hacer y no pude? | |

---

## Al cierre del piloto (2–4 semanas) — responde esto

**Pregunta central:** ¿Qué hice con ATLAS que antes hacía peor, más lento, o no podía hacer?

Si la respuesta es concreta y específica → hay señal real, evolucionamos las capacidades que de verdad usaste.

Si es "funciona pero es incómodo" → priorizamos UX/productización antes de tocar arquitectura.

Si es "sigo usando ChatGPT/Notion/carpetas igual que antes" → paramos, analizamos, y cambiamos el producto antes de invertir en cualquier cosa nueva (incluyendo Cloud).

**Sobre Cloud específicamente:** no preguntes "¿queremos Cloud?". Pregunta: ¿qué problema real tuve durante el piloto que *solo* Cloud resolvería? Si la respuesta es "necesité mi contexto de Banco Amazonas fuera de esta máquina", anota exactamente cuándo y para qué — eso define si el problema real es sync entre tus dispositivos, acceso remoto, o algo más simple que ninguna de las dos.
