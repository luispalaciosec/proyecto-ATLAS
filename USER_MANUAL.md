# Manual de usuario — ATLAS

**Versión cubierta:** Phase 2, P2.1–P2.5 (LLM Adapter, Conversación, Brands & Workspaces, Feedback Loop, Web UI).
**Estado:** validado manualmente el 8–9 de agosto de 2026 (ver `releases/MANUAL_VALIDATION_REPORT_2026-08-09.md`).

Este manual describe lo que ATLAS hace hoy, con comandos reales del CLI. No es un documento de arquitectura — para eso está `ATLAS_ARCHITECTURE_MASTER.md`. No es tampoco el roadmap de producto — para eso está `ATLAS_PRODUCT_VISION_v1.0.md`.

---

## 1. Qué es ATLAS hoy

ATLAS es una herramienta de línea de comandos (con una interfaz web local opcional) que te da:

- **Memoria persistente**: guardas y buscas información en un archivo local (`.atlas/memory.json`), no en la nube.
- **Un asistente con acceso a esa memoria**: le pides algo en lenguaje natural y puede buscar, guardar y ejecutar planes usando tus datos reales, no solo lo que sabe de entrenamiento.
- **Planificación determinista**: puedes pedirle que planifique y ejecute un objetivo sin necesidad de un LLM — un motor de reglas interno lo convierte en pasos concretos.
- **Espacios de trabajo aislados ("brands")**: cada proyecto o cliente puede tener su propia memoria, completamente separada de las demás — no es un filtro, son archivos físicamente distintos.
- **Un mecanismo de corrección**: si el asistente responde algo mal, puedes corregirlo y esa corrección queda guardada para la próxima vez.

Lo que ATLAS **no** es todavía: un producto con instalador, con Cloud, o con una interfaz que oculte por completo la línea de comandos. Eso es intencional — hoy es una herramienta de uso personal en tu máquina.

---

## 2. Primera vez — instalación y configuración

Desde la raíz del repositorio:

```bash
pnpm install
pnpm build
```

Configura el LLM (opcional, pero necesario para `ask`, `chat` en modo conversacional, `brand` y `/correct`). Copia `.env.example` a `.env` y completa:

```bash
ATLAS_LLM_PROVIDER=anthropic        # o: openai-compatible
ATLAS_LLM_API_KEY=tu-api-key
ATLAS_LLM_MODEL=el-modelo-que-uses
# Solo si usas openai-compatible (ej. Qwen, DeepSeek, o cualquier API compatible):
ATLAS_LLM_BASE_URL=
```

Verifica que todo esté bien:

```bash
pnpm atlas doctor
```

Deberías ver `Status: HEALTHY` y el LLM marcado como configurado.

**Importante:** todos los comandos `pnpm atlas ...` deben ejecutarse desde la raíz del repositorio. Fuera de ahí, `atlas` no se reconoce como comando.

Si prefieres tener `atlas` disponible desde cualquier carpeta (opcional, no necesario para uso diario):

```bash
pnpm setup
pnpm link --global ./packages/cli
atlas doctor
```

---

## 3. Memoria — guardar y buscar

```bash
pnpm atlas memory store --content "Cliente nuevo: Northwind Traders, pedido #4521, entrega el viernes"
pnpm atlas memory search --query "Northwind"
```

La búsqueda es insensible a mayúsculas y acentos (buscar "Garcia" encuentra "García" y viceversa). Es una búsqueda por coincidencia de texto, no semántica — no interpreta sinónimos ni relaciones.

Esta memoria es **global**: compartida entre `atlas ask`, `atlas chat`, `atlas plan` y la Web UI, salvo que trabajes dentro de una marca (sección 6).

---

## 4. Preguntarle algo al asistente (`ask`)

Para una pregunta puntual, con acceso a tus herramientas certificadas (memoria, planificación):

```bash
pnpm atlas ask --goal "Busca en memoria qué sabemos de Northwind Traders y resume en 2 frases"
```

Requiere el LLM configurado (paso 2). Si no lo tienes configurado, `atlas doctor` te lo advierte.

**Consejo práctico (ver limitaciones, sección 8):** entre más explícita sea tu instrucción sobre qué herramienta usar, más confiable es la respuesta. En vez de "¿qué sabes de Northwind?", funciona mejor "Usa memory_search con la consulta Northwind y resume lo que encuentres".

---

## 5. Conversación multi-turno (`chat`)

```bash
pnpm atlas chat
```

Abre un REPL interactivo. Si el LLM está configurado, cada mensaje usa el asistente con memoria de la conversación; si no, usa el motor determinista (planifica y ejecuta directamente, sin generar texto libre). Para salir: `/exit` o `/quit`.

`pnpm atlas` sin ningún subcomando entra directo a este mismo chat.

---

## 6. Espacios de trabajo aislados (`brand`)

Cada "brand" (marca, proyecto, cliente — el nombre es libre) tiene su propia memoria, físicamente separada del resto:

```bash
pnpm atlas brand acme
```

La primera vez que usas un nombre nuevo, ATLAS crea automáticamente:

```
.atlas/workspaces/acme/profile.json   ← perfil editable a mano
.atlas/workspaces/acme/memory.json    ← memoria exclusiva de "acme"
```

El perfil (`profile.json`) define propósito, tono, reglas y contexto de esa marca — se edita manualmente con cualquier editor de texto, no hay comando todavía para editarlo desde la CLI. Ese contexto se inyecta automáticamente en cada conversación dentro de esa marca.

**Aislamiento verificado:** buscar algo guardado en `acme` no aparece en la memoria global ni en otra marca, y viceversa. Son archivos distintos en disco, no un filtro sobre datos compartidos.

**Limitación actual:** no existe todavía un comando para buscar en la memoria de una marca desde fuera de la sesión de chat (por ejemplo `atlas memory search --brand acme`). Para consultar la memoria de una marca hoy, hazlo dentro de `atlas brand acme`.

---

## 7. Corregir al asistente (`/correct`)

Dentro de una sesión de chat en modo LLM (`atlas chat` o `atlas brand <nombre>`), si una respuesta estuvo mal:

```
/correct Debiste confirmar la fecha de entrega antes de asumir que era el viernes
```

Esto guarda la corrección en memoria (tipo `Feedback`) y no cuenta como un turno de conversación. Dentro de `atlas brand`, las correcciones previas se recuperan automáticamente y se incluyen en el contexto de nuevas conversaciones — en `atlas chat` genérico, no.

**Requisito:** tiene que haber al menos un mensaje previo en la misma sesión. Si lo usas como primer mensaje, ATLAS responde "Nothing to correct yet" — no es un error, es el comportamiento esperado.

---

## 8. Interfaz web local (`web`)

```bash
pnpm atlas web
```

Levanta un servidor en `http://127.0.0.1:4173` (configurable con `ATLAS_WEB_HOST` / `ATLAS_WEB_PORT`) con una interfaz de chat en el navegador. Usa exactamente la misma memoria y lógica que la CLI — no es un sistema aparte. Puedes elegir el workspace (marca) desde la interfaz.

---

## 9. Referencia rápida de comandos

| Comando | Qué hace |
|---|---|
| `pnpm atlas doctor` | Verifica que todo esté bien configurado |
| `pnpm atlas memory store --content "..."` | Guarda algo en memoria global |
| `pnpm atlas memory search --query "..."` | Busca en memoria global |
| `pnpm atlas ask --goal "..."` | Pregunta puntual con acceso a herramientas |
| `pnpm atlas plan --goal "..."` | Planifica y ejecuta un objetivo (determinista, sin LLM) |
| `pnpm atlas chat` | Conversación multi-turno |
| `pnpm atlas brand <nombre>` | Conversación con memoria aislada de esa marca |
| `pnpm atlas web` | Interfaz web local |
| `pnpm atlas --help` | Lista completa de comandos y opciones |

Agrega `--json` a la mayoría de comandos para obtener la salida en formato estructurado.

---

## 10. Limitaciones conocidas

- **Groq (`openai-compatible` con `llama-3.3-70b-versatile`) falla intermitentemente en llamar herramientas** (`tool_use_failed`, rate limits `429`), incluso con preguntas simples. Confirmado con un experimento controlado (9 ago 2026): los mismos flujos que fallaban con Groq pasaron limpio con Anthropic (`claude-sonnet-5`), sin `tool_use_failed`, con las mismas preguntas abiertas y sin workarounds. **Es una limitación del proveedor Groq, no de ATLAS.** Recomendación: usa Anthropic como proveedor por defecto (`ATLAS_LLM_PROVIDER=anthropic`); trata Groq/`openai-compatible` como tier económico solo cuando el costo importa más que la confiabilidad.
- **El asistente puede afirmar que "no hay datos" aunque la búsqueda sí encontró resultados.** Es un problema de interpretación del modelo, no de la memoria (puedes confirmar con `atlas memory search` directamente, que es determinista). Es la limitación más importante a resolver antes de confiar en ATLAS para decisiones críticas.
- **Debes ejecutar los comandos desde la raíz del repositorio**, salvo que hayas hecho la instalación global (sección 2).
- **El perfil de una marca se edita manualmente en JSON** — no hay todavía un comando `atlas brand edit`.
- **La búsqueda es por coincidencia de texto**, no semántica — no encuentra algo relacionado si no comparte palabras.

---

## 11. Qué falta para la próxima fase

Antes de construir infraestructura nueva (Cloud, sync entre dispositivos), lo prioritario es cerrar la confiabilidad de la capa LLM (limitación de la sección 10) y validar con uso real durante varias semanas si ATLAS aporta valor en el día a día. Ver `ATLAS_PRODUCT_VISION_v1.0.md` para el criterio de éxito formal.
