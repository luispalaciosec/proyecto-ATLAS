import type { Atlas, LlmMessage } from '@atlas/sdk';

export interface ChatSessionState {
  readonly sessionId: string;
  readonly client: Atlas;
  turnCount: number;
  lastMemorySessionId?: string;
  history: LlmMessage[];
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
  };
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
