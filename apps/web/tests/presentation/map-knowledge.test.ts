import { describe, expect, it } from 'vitest';

import {
  buildKnowledgeConversationPrompt,
  buildKnowledgeSearchChatPrompt,
  mapKnowledgeSearchToProduct,
} from '../../src/presentation/map-knowledge.js';

describe('mapKnowledgeSearchToProduct', () => {
  it('maps valid search payloads for UI', () => {
    const result = mapKnowledgeSearchToProduct('geeks', {
      query: 'Ana García',
      total: 1,
      records: [
        {
          id: 'record.1',
          type: 'CliMemory',
          content: { text: 'Ana García es cliente VIP desde 2024.' },
          timestamp: '2026-01-15T10:00:00.000Z',
        },
      ],
    });

    expect(result.workspace).toBe('geeks');
    expect(result.total).toBe(1);
    expect(result.records[0]?.title).toContain('Ana García');
    expect(result.records[0]?.typeLabel).toBe('Nota');
    expect(result.records[0]?.contextLabel).toBe('Geeks');
    expect(result.records[0]?.createdAt).toBe('2026-01-15T10:00:00.000Z');
  });

  it('handles incomplete payloads without inventing metadata', () => {
    const result = mapKnowledgeSearchToProduct('default', {
      query: 'test',
      total: 2,
      records: [
        {
          id: 'record.empty',
          type: 'CliMemory',
          content: { text: '' },
        },
        {
          id: 'record.text',
          type: 'UnknownType',
          content: 'Solo texto',
        },
      ],
    });

    expect(result.records).toHaveLength(1);
    expect(result.records[0]?.createdAt).toBeUndefined();
    expect(result.records[0]?.sourceLabel).toContain('general');
  });

  it('handles unexpected content shapes safely', () => {
    const result = mapKnowledgeSearchToProduct('default', {
      query: 'obj',
      total: 1,
      records: [
        {
          id: 'record.obj',
          type: 'PlanExecution',
          content: { goal: 'Ejecutar campaña', status: 'done' },
        },
      ],
    });

    expect(result.records[0]?.typeLabel).toBe('Plan de trabajo');
    expect(result.records[0]?.snippet).toContain('goal');
  });
});

describe('knowledge conversation prompts', () => {
  it('builds a prompt from a record title', () => {
    const prompt = buildKnowledgeConversationPrompt({
      id: '1',
      title: 'Ana García es cliente VIP',
      snippet: 'Ana García es cliente VIP desde 2024.',
      typeLabel: 'Nota',
      contextLabel: 'Geeks',
      sourceLabel: 'Información almacenada en el conocimiento de Geeks.',
    });

    expect(prompt).toContain('Ana García');
  });

  it('builds a prompt from the original search query', () => {
    expect(buildKnowledgeSearchChatPrompt('clientes que compraron laptops')).toContain(
      'clientes que compraron laptops',
    );
  });
});
