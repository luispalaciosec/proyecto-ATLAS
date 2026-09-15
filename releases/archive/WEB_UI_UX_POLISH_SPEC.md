# Spec: 3 fixes de UX encontrados en revisión en vivo (sticky nav, fuga de identificador interno, búsqueda frágil)

**Tipo:** Pulido de UX/confianza, no productización nueva. Cola detrás del upload de documentos (`WEB_UI_KNOWLEDGE_UPLOAD_SPEC.md`) — implementar cuando ese termine, no en paralelo, para no pisar los mismos archivos.

**Contexto:** encontrados en una revisión en vivo del Web UI corriendo (`127.0.0.1:4173`, marca Geeks, con una conversación real de venta). Los tres son reproducibles, verificados contra el código fuente antes de escribir esta spec, y caben dentro de la misma frontera de gobernanza de siempre.

---

## 1. El menú lateral no se queda fijo al hacer scroll

**Síntoma reproducido:** en Inicio y en Actividad, al bajar la página el `<aside class="shell__sidebar">` se desplaza junto con el contenido — hay que volver arriba para cambiar de sección. En páginas cortas no se nota; en las largas (Inicio con las tarjetas, Actividad con el historial) es fricción constante.

**Causa raíz verificada:** en `apps/web/src/client/styles/app.css`, `.shell__sidebar` (línea 9) no tiene ninguna regla de `position` en el layout de escritorio — es un bloque normal dentro de `.shell` (flex). El header sí resuelve exactamente este mismo problema con `position: sticky; top: 0;` (línea 125, `.shell__header`) — el patrón ya existe en el codebase, solo falta aplicarlo también al sidebar.

**Fix:** en la regla de escritorio de `.shell__sidebar` (donde hoy se le pone `display: flex` en el media query — buscar el breakpoint alrededor de la línea 1301 en `app.css`), agregar:

```css
.shell__sidebar {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}
```

**No negociables de este punto:**
- Esto **no** aplica al sidebar móvil (`.shell__sidebar.is-open`, que ya usa `position: fixed` correctamente para el drawer) — solo al layout de escritorio.
- No cambiar el comportamiento del drawer móvil ni su backdrop — ya funciona bien, verificado en 390px de ancho.

**Verificación:** scroll manual en Inicio y Actividad con contenido suficiente para que la página sea más alta que la ventana — el sidebar debe permanecer visible y clickeable en todo momento. Reconfirmar el drawer móvil sigue funcionando igual (test existente `phase-3i-accessibility.test.ts`, no debería romperse, pero correrlo).

---

## 2. Se filtra un identificador técnico interno en las respuestas del chat

**Síntoma reproducido:** al cerrar una venta por chat, ATLAS respondió incluyendo textualmente `Workflow generado: workflow.cerrar.y.confirmar.pedido.de.venta.para.cliente.vip.luis.palacios` — un slug interno del compilador, mostrado sin traducir a un usuario de negocio en una confirmación de pedido.

**Causa raíz verificada:** en `packages/sdk/src/modules/llm-module.ts`, el executor de la tool `plan_and_execute` (línea ~141) devuelve al LLM un JSON con campos técnicos crudos: `workflowId`, `sessionId`, `memoryRecordId`. El `SYSTEM_PROMPT` (mismo archivo, ya extendido una vez para el fix L-02 de precedencia de tool results) le indica al LLM que **debe** referenciar los datos del tool result — y el LLM, siguiendo esa instrucción al pie de la letra, cita el `workflowId` tal cual en su respuesta al usuario.

**Fix (mismo archivo y mecanismo que el fix de L-02 — edición de `SYSTEM_PROMPT`, no de la tool ni del flujo de datos):** agregar al `SYSTEM_PROMPT` en `packages/sdk/src/modules/llm-module.ts` una instrucción explícita, por ejemplo:

> "Los resultados de las herramientas pueden incluir identificadores técnicos internos (workflowId, sessionId, memoryRecordId, recordId). Estos son metadatos de seguimiento interno — nunca los leas en voz alta ni los muestres al usuario en tu respuesta, a menos que el usuario pregunte explícitamente por detalles técnicos o de depuración. Resume el resultado en lenguaje de negocio (ej. 'pedido confirmado y registrado' en vez de mostrar el ID de workflow)."

**No negociables de este punto:**
- No cambiar el schema de la tool `plan_and_execute` ni qué datos retorna — el fix es puramente de instrucción al LLM, igual que L-02.
- No tocar `packages/core`, `packages/compiler`, `packages/runtime`, `packages/workflow`.
- El `sessionId`/`memoryRecordId` siguen disponibles si el usuario pregunta explícitamente "dame el ID técnico" — no se está ocultando información, se está evitando que aparezca sin que la pidan.

**Verificación:** test nuevo en `packages/sdk` (mismo patrón que el test de L-02: capturar el mensaje de sistema real enviado al fake provider). Test manual: repetir un flujo de `plan_and_execute` (ej. cerrar un pedido) y confirmar que la respuesta no menciona `workflow.` ni ningún ID crudo, salvo que se pregunte explícitamente.

---

## 3. La búsqueda de Conocimiento es demasiado literal (falla con singular/plural)

**Síntoma reproducido:** el chip sugerido "Clientes VIP" (el primero de la lista) devuelve "No encontramos información sobre eso", mientras que "cliente VIP" (singular) sí encuentra 1 resultado, y "VIP" solo encuentra 3 — confirmado en el log de Actividad. El chat, en cambio, responde bien a la misma pregunta porque el LLM reformula la consulta antes de buscar; la búsqueda directa de Conocimiento no.

**Causa raíz verificada:** en `packages/sdk/src/modules/memory-module.ts`, `matchesContentQuery()` (línea 76) exige que **toda la consulta normalizada, como una sola frase**, aparezca como substring contiguo del texto guardado (`normalizeForSearch(text).includes(normalizedQuery)`). "clientes vip" no es substring de un texto que dice "cliente vip" — de ahí el fallo.

**Fix (dentro del mismo archivo y misma capa — post-filtro de la SDK, sin tocar `@atlas/memory` ni el `engine.search()` certificado):** cambiar `matchesContentQuery` para que, en vez de exigir la frase completa como substring, tokenice la consulta en palabras y exija que **cada palabra de la consulta** aparezca en el texto — permitiendo coincidencia por prefijo en ambas direcciones (para cubrir singular/plural simple en español: "cliente"↔"clientes", "pedido"↔"pedidos"), no necesariamente en el mismo orden ni adyacentes.

Ejemplo de la lógica esperada (ilustrativo, no literal — el implementador decide la forma exacta del código):

```ts
function matchesContentQuery(record: MemoryRecord, query: string): boolean {
  const queryTokens = normalizeForSearch(query.trim()).split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return true;

  const textTokens = normalizeForSearch(extractSearchableText(record)).split(/\s+/).filter(Boolean);

  return queryTokens.every((qt) =>
    textTokens.some((tt) => tt.startsWith(qt) || qt.startsWith(tt)),
  );
}
```

**No negociables de este punto:**
- **No** es búsqueda semántica ni embeddings — sigue siendo matching léxico determinístico, solo menos frágil que un substring de frase completa.
- **No** tocar `packages/memory`, `packages/retrieval` ni `engine.search()` — el cambio vive enteramente en el post-filtro de `@atlas/sdk`.
- Cuidado con falsos positivos: palabras muy cortas (ej. "de", "la") harían match con casi cualquier texto — considerar un largo mínimo de token (ej. ignorar tokens de 2 caracteres o menos al aplicar el filtro) para no degradar la precisión.

**Verificación:** tests unitarios de `matchesContentQuery` con los casos reales encontrados: "Clientes VIP" (plural) debe encontrar contenido que dice "cliente VIP" (singular); "VIP" solo debe seguir encontrando los mismos 3 resultados de antes (no menos); confirmar que no se rompe ningún test existente de `@atlas/web`/`@atlas/sdk` que dependa del comportamiento anterior. Test manual: repetir el clic en el chip "Clientes VIP" en `/conocimiento` y confirmar que ahora sí devuelve resultado.

---

## Verificación de cierre general

- `pnpm --filter @atlas/sdk test`, `pnpm --filter @atlas/web test`, `pnpm run build`, `pnpm run typecheck`, `pnpm run lint` — sin regresiones.
- Reportar conteo de tests nuevo vs. base como evidencia, igual que en los fixes anteriores.
- Los tres puntos son independientes entre sí — se pueden implementar y verificar uno por uno, no hace falta hacerlos como un solo commit.
