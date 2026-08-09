# Fix: la Web UI no muestra el historial de chat al recargar la página

**Tipo:** Fix puntual y acotado, no un rediseño. No es P2.5.x — es una tarde de trabajo sobre lo que ya existe en P2.5.

## Contexto

El backend (`apps/web/src/session-store.ts`) ya mantiene el historial de conversación por workspace en memoria (`ChatSessionState.history`), y sobrevive a cerrar y reabrir el navegador — solo se pierde si el proceso `pnpm atlas web` se reinicia. El problema es puramente visual: `apps/web/public/app.js` nunca pide ese historial al servidor, así que el panel de mensajes siempre arranca vacío al cargar la página o al cambiar de workspace (ver `setActiveWorkspace()`, que hace `messages.replaceChildren()` sin volver a poblar nada).

No hay que tocar `SessionStore`, `ChatSessionState`, `executeChatTurn`, ni ninguna lógica de `@atlas/cli`/`@atlas/sdk` — el historial ya existe, solo falta exponerlo y renderizarlo.

## Fix requerido

### 1. Nuevo endpoint de solo lectura en `apps/web/src/server.ts`

```ts
app.get('/api/history', async (request, response, next) => {
  try {
    const workspace =
      typeof request.query.workspace === 'string' ? request.query.workspace : undefined;
    const session = await sessionStore.getOrCreate(workspace);

    const turns = session.history
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .filter((message) => message.content.trim().length > 0)
      .map((message) => ({ role: message.role, content: message.content }));

    response.json({ workspace: workspace ?? 'default', messages: turns });
  } catch (error) {
    next(error);
  }
});
```

Ajustar el nombre exacto de los campos si `LlmMessage` usa otra forma — el punto es: filtrar a `user`/`assistant` con contenido no vacío (para no mostrar burbujas vacías de turnos que solo hicieron tool-calls), en orden cronológico tal como están en `session.history`.

**Importante:** este endpoint debe usar `getOrCreate`, no crear un session nuevo distinto al que usa `/api/chat` — debe ser exactamente el mismo objeto en memoria, para que el historial mostrado coincida con el que el LLM realmente está usando de contexto.

### 2. Frontend — `apps/web/public/app.js`

Agregar una función:

```js
async function loadHistory() {
  const params = workspacePayloadValue() !== undefined ? `?workspace=${encodeURIComponent(workspacePayloadValue())}` : '';
  const response = await fetch(`/api/history${params}`);

  if (!response.ok) {
    return;
  }

  const payload = await response.json();
  messages.replaceChildren();

  for (const turn of payload.messages ?? []) {
    appendMessage(turn.role === 'user' ? 'user' : 'assistant', turn.content);
  }
}
```

Llamarla:

- Al final del archivo, junto a `loadWorkspaces()` — cargar el historial del workspace `default` al abrir la página.
- Dentro de `setActiveWorkspace()`, en vez de (o después de) `messages.replaceChildren()` — cargar el historial del nuevo workspace en lugar de dejarlo vacío.

Manejar el caso de error silenciosamente (si `/api/history` falla, no romper el flujo — el chat debe seguir funcionando aunque no se pueda precargar el historial).

## Verificación de cierre

- Test nuevo en `apps/web/tests/server.test.ts`: hacer un `POST /api/chat` con un goal, luego `GET /api/history` con el mismo workspace, y verificar que el mensaje del usuario y la respuesta del asistente aparecen en el array `messages`, en orden.
- Test manual: abrir `pnpm atlas web`, mandar un mensaje, recargar la página (F5) — el mensaje y la respuesta deben seguir visibles.
- Test manual de aislamiento: mismo flujo en workspace `geeks-banco-amazonas` y en `default` — confirmar que recargar cada uno muestra solo su propio historial, no el del otro.
- `pnpm --filter @atlas/web test` → todos los tests existentes siguen pasando, más el nuevo.
- `pnpm run build` y `pnpm run test` en la raíz → sin regresiones.

## No negociables

- No tocar `SessionStore`, `ChatSessionState`, `chat-turn.ts`, ni ningún paquete del Kernel (`core`, `compiler`, `runtime`, `memory`, `retrieval`) — el fix es exclusivamente `apps/web/src/server.ts` (un endpoint nuevo, de solo lectura) y `apps/web/public/app.js` (leer y renderizar).
- No agregar persistencia en disco del historial de chat de la Web UI — sigue siendo en memoria del proceso, igual que hoy. Esto es explícitamente fuera de alcance de este fix.
- No construir selector de proyectos anidados, panel de "memoria visible", ni ningún otro ítem de la lista más amplia de UX — esto es solo el fix del historial, nada más.
- Reportar el resultado del test nuevo y de la verificación manual (recarga real del navegador) como evidencia de cierre.
