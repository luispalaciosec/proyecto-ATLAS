import { createAtlas } from '@atlas/sdk';
import { describe, expect, it } from 'vitest';

import {
  createChatSession,
  DEFAULT_HISTORY_WINDOW_TURNS,
  recordTurnMessages,
  selectRecentTurns,
} from '../src/chat/chat-session.js';

describe('chat-session history window', () => {
  it('selectRecentTurns returns full history when turn count is within the window', () => {
    const session = createChatSession(createAtlas({ workspace: { name: 'test' } }));

    recordTurnMessages(session, [
      Object.freeze({ role: 'user', content: 'Goal 1' }),
      Object.freeze({ role: 'assistant', content: 'Reply 1' }),
    ]);
    recordTurnMessages(session, [
      Object.freeze({ role: 'user', content: 'Goal 2' }),
      Object.freeze({ role: 'assistant', content: 'Reply 2' }),
    ]);

    expect(selectRecentTurns(session)).toEqual(session.history);
    expect(selectRecentTurns(session, DEFAULT_HISTORY_WINDOW_TURNS)).toEqual(session.history);
  });

  it('selectRecentTurns keeps only recent complete turns and starts on a user message', () => {
    const session = createChatSession(createAtlas({ workspace: { name: 'test' } }));

    for (let turn = 1; turn <= 6; turn += 1) {
      recordTurnMessages(session, [
        Object.freeze({ role: 'user', content: `Goal ${turn}` }),
        Object.freeze({ role: 'assistant', content: `Reply ${turn}` }),
        Object.freeze({ role: 'tool', content: `Tool ${turn}`, toolCallId: `tool-${turn}` }),
      ]);
    }

    const window = selectRecentTurns(session, DEFAULT_HISTORY_WINDOW_TURNS);

    expect(session.history.length).toBe(18);
    expect(window.length).toBe(12);
    expect(window[0]?.content).toBe('Goal 3');
    expect(window.some((message) => message.content === 'Goal 1')).toBe(false);
    expect(window.some((message) => message.content === 'Reply 1')).toBe(false);
    expect(window.some((message) => message.content === 'Goal 6')).toBe(true);
    expect(window.some((message) => message.content === 'Tool 6')).toBe(true);
    expect(window[0]?.role).toBe('user');
  });
});
