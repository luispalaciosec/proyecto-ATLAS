import { describe, expect, it } from 'vitest';

import {
  groupActivityItemsByDate,
  mapActivityEventsToProduct,
  type RawActivityEvent,
} from '../../src/presentation/map-activity.js';

describe('mapActivityEventsToProduct', () => {
  it('maps valid activity events for UI', () => {
    const events: RawActivityEvent[] = [
      {
        id: 'activity.1',
        kind: 'conversation',
        workspace: 'geeks',
        occurredAt: '2026-08-09T15:32:00.000Z',
        status: 'success',
        goal: '¿Qué sabemos del cliente Ana García?',
        mode: 'llm',
        success: true,
        llmTurns: 2,
      },
    ];

    const result = mapActivityEventsToProduct('geeks', events);

    expect(result.workspace).toBe('geeks');
    expect(result.items[0]?.title).toContain('respondió');
    expect(result.items[0]?.description).toContain('Conocimiento');
    expect(result.items[0]?.quote).toContain('Ana García');
  });

  it('handles incomplete events without inventing metadata', () => {
    const events: RawActivityEvent[] = [
      {
        id: 'activity.2',
        kind: 'knowledge',
        workspace: 'default',
        occurredAt: '2026-08-09T10:00:00.000Z',
        status: 'info',
        query: 'políticas',
        resultsTotal: 0,
      },
    ];

    const result = mapActivityEventsToProduct('default', events);

    expect(result.items[0]?.description).toContain('No se encontraron');
    expect(result.items[0]?.action?.kind).toBe('open-knowledge');
  });

  it('filters by workspace and type', () => {
    const events: RawActivityEvent[] = [
      {
        id: 'a1',
        kind: 'conversation',
        workspace: 'geeks',
        occurredAt: '2026-08-09T12:00:00.000Z',
        status: 'success',
        goal: 'Hola',
        mode: 'llm',
        success: true,
      },
      {
        id: 'a2',
        kind: 'correction',
        workspace: 'geeks',
        occurredAt: '2026-08-09T11:00:00.000Z',
        status: 'success',
        correction: 'Demasiado pronto',
      },
      {
        id: 'a3',
        kind: 'conversation',
        workspace: 'default',
        occurredAt: '2026-08-09T10:00:00.000Z',
        status: 'success',
        goal: 'Otra marca',
        mode: 'llm',
        success: true,
      },
    ];

    const result = mapActivityEventsToProduct('geeks', events, { type: 'correction' });

    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.type).toBe('correction');
  });

  it('maps correction and error events honestly', () => {
    const events: RawActivityEvent[] = [
      {
        id: 'c1',
        kind: 'correction',
        workspace: 'default',
        occurredAt: '2026-08-09T09:00:00.000Z',
        status: 'success',
        correction: 'Debería mencionar el plazo',
        recordId: 'record.feedback.1',
      },
      {
        id: 'e1',
        kind: 'error',
        workspace: 'default',
        occurredAt: '2026-08-09T08:00:00.000Z',
        status: 'error',
        goal: 'Consulta fallida',
        errorMessage: 'ECONNREFUSED',
      },
    ];

    const result = mapActivityEventsToProduct('default', events);

    expect(result.items[0]?.title).toContain('Corregiste');
    expect(result.items[1]?.title).toContain('completar esta solicitud');
    expect(result.items[1]?.action?.kind).toBe('retry-chat');
  });
});

describe('groupActivityItemsByDate', () => {
  it('groups items by date label', () => {
    const today = new Date().toISOString();
    const groups = groupActivityItemsByDate([
      {
        id: '1',
        type: 'conversation',
        title: 'Test',
        occurredAt: today,
        workspace: 'default',
        workspaceName: 'General',
        status: 'success',
      },
    ]);

    expect(groups.length).toBeGreaterThan(0);
    expect(groups[0]?.items).toHaveLength(1);
  });
});
