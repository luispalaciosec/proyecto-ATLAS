import { describe, expect, it } from 'vitest';

import { mapChatResponse } from '../../src/presentation/map-chat-response.js';

describe('mapChatResponse', () => {
  it('maps LLM responses with assistant text', () => {
    const view = mapChatResponse({
      mode: 'llm',
      success: true,
      llm_message: '**Hola** desde ATLAS',
      llm_turns: 1,
      llm_elapsed_ms: 1500,
      llm_usage: { input_tokens: 120, output_tokens: 45 },
    });

    expect(view.assistantMessage).toBe('**Hola** desde ATLAS');
    expect(view.canCorrect).toBe(true);
    expect(view.metrics.elapsedMs).toBe(1500);
    expect(view.metrics.inputTokens).toBe(120);
    expect(view.metrics.outputTokens).toBe(45);
    expect(view.technicalDetails).toContain('"mode": "llm"');
  });

  it('uses human copy for deterministic mode', () => {
    const view = mapChatResponse({
      mode: 'deterministic',
      success: true,
    });

    expect(view.assistantMessage).toContain('automáticamente');
    expect(view.canCorrect).toBe(false);
    expect(view.assistantMessage).not.toContain('deterministic');
  });

  it('uses search activity when multiple LLM turns', () => {
    const view = mapChatResponse({
      mode: 'llm',
      success: true,
      llm_message: 'Resultado',
      llm_turns: 2,
      llm_reasoning_steps: [
        { type: 'memory_search', preview: 'clientes VIP' },
        { type: 'composing' },
      ],
    });

    expect(view.activityMessage).toContain('conocimiento');
    expect(view.reasoningSteps).toHaveLength(2);
    expect(view.reasoningSteps[0]?.label).toContain('clientes VIP');
  });
});
