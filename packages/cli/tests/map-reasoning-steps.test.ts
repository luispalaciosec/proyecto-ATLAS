import { describe, expect, it } from 'vitest';

import { mapTranscriptToReasoningSteps } from '../src/chat/map-reasoning-steps.js';

describe('mapTranscriptToReasoningSteps', () => {
  it('maps tool calls from assistant transcript messages', () => {
    const steps = mapTranscriptToReasoningSteps([
      {
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            name: 'memory_search',
            arguments: { query: 'clientes VIP' },
          },
          {
            name: 'memory_store',
            arguments: { content: 'Ana es VIP' },
          },
        ],
      },
    ]);

    expect(steps.map((step) => step.type)).toEqual(['memory_search', 'memory_store', 'composing']);
    expect(steps[0]?.preview).toBe('clientes VIP');
    expect(steps[1]?.preview).toBe('Ana es VIP');
  });

  it('falls back to inferencing when transcript has no tool calls', () => {
    const steps = mapTranscriptToReasoningSteps([
      {
        role: 'assistant',
        content: 'Estoy revisando el contexto del pedido.',
      },
    ]);

    expect(steps[0]?.type).toBe('inferencing');
    expect(steps.at(-1)?.type).toBe('composing');
  });
});
