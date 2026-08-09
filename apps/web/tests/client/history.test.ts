import { describe, expect, it } from 'vitest';

import {
  deriveRecentConversationEntries,
  deriveRecentConversationTitle,
  mapHistoryMessagesToUi,
} from '../../src/client/lib/history.js';

describe('history helpers', () => {
  it('maps history messages to UI chat messages', () => {
    const ui = mapHistoryMessagesToUi([
      {
        id: 'hist.1.user',
        role: 'user',
        content: 'Hola',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'hist.1.assistant',
        role: 'assistant',
        content: 'Respuesta',
        createdAt: '2026-01-01T00:00:01.000Z',
      },
    ]);

    expect(ui).toHaveLength(2);
    expect(ui[0]?.kind).toBe('user');
    expect(ui[1]?.markdown).toBe(true);
  });

  it('derives a recent conversation title from the last user message', () => {
    const title = deriveRecentConversationTitle([
      {
        id: '1',
        role: 'user',
        content: '¿Qué sabemos de Ana García?',
        createdAt: '2026-01-01T00:00:00.000Z',
      },
    ]);

    expect(title).toBe('¿Qué sabemos de Ana García?');
  });

  it('derives up to three recent conversation entries', () => {
    const entries = deriveRecentConversationEntries(
      [
        {
          id: '1',
          role: 'user',
          content: 'Primera',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Respuesta',
          createdAt: '2026-01-01T00:00:01.000Z',
        },
        {
          id: '3',
          role: 'user',
          content: 'Segunda',
          createdAt: '2026-01-01T00:00:02.000Z',
        },
        {
          id: '4',
          role: 'user',
          content: 'Tercera',
          createdAt: '2026-01-01T00:00:03.000Z',
        },
        {
          id: '5',
          role: 'user',
          content: 'Cuarta',
          createdAt: '2026-01-01T00:00:04.000Z',
        },
      ],
      'General',
      3,
    );

    expect(entries).toHaveLength(3);
    expect(entries[0]?.title).toBe('Cuarta');
    expect(entries[1]?.title).toBe('Tercera');
    expect(entries[2]?.title).toBe('Segunda');
    expect(entries.every((entry) => entry.brandName === 'General')).toBe(true);
  });
});
