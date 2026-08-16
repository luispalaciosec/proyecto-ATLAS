import type { Atlas, LlmMessage } from '@atlas/sdk';

import type { LastTurn } from './feedback.js';

export interface ChatSessionState {
  readonly sessionId: string;
  readonly client: Atlas;
  turnCount: number;
  lastMemorySessionId?: string;
  history: LlmMessage[];
  turnBoundaries: number[];
  lastTurn?: LastTurn;
}

export function createChatSessionId(): string {
  return `chat.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
}

export function createChatSession(client: Atlas, sessionId = createChatSessionId()): ChatSessionState {
  return {
    sessionId,
    client,
    turnCount: 0,
    history: [],
    turnBoundaries: [],
  };
}

export const DEFAULT_HISTORY_WINDOW_TURNS = 4;

/** Agrega los mensajes de un turno completo y registra dónde empezó. */
export function recordTurnMessages(session: ChatSessionState, messages: readonly LlmMessage[]): void {
  session.turnBoundaries.push(session.history.length);
  session.history.push(...messages);
}

/**
 * Devuelve solo los últimos `maxTurns` turnos completos de `history`, sin
 * cortar nunca a la mitad de un turno (nunca deja un tool_use sin su
 * tool_result correspondiente). `session.history` en sí NO se modifica —
 * sigue completo para consumidores como el transcript de la Web UI
 * (apps/web/src/session-store.ts `getConversationHistory`).
 */
export function selectRecentTurns(
  session: ChatSessionState,
  maxTurns: number = DEFAULT_HISTORY_WINDOW_TURNS,
): readonly LlmMessage[] {
  if (session.turnBoundaries.length <= maxTurns) {
    return session.history;
  }

  const startIndex = session.turnBoundaries[session.turnBoundaries.length - maxTurns];
  return session.history.slice(startIndex);
}

export function captureLastMemorySessionId(session: ChatSessionState): string | undefined {
  const memorySession = session.client.memory.getEngine().getLastCompletedSession();

  if (memorySession === undefined) {
    return undefined;
  }

  const memorySessionId = memorySession.memorySessionId.toJSON();
  session.lastMemorySessionId = memorySessionId;

  return memorySessionId;
}
