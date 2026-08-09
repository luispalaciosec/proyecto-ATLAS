import { describe, expect, it, vi } from 'vitest';

import { createBudgetTracker } from '../src/budget.js';

describe('createBudgetTracker', () => {
  it('marks exceeded when maxTurns is passed', () => {
    const tracker = createBudgetTracker({ maxTurns: 2 });

    expect(tracker.consume({ inputTokens: 1, outputTokens: 1 }).exceeded).toBe(false);
    expect(tracker.consume({ inputTokens: 1, outputTokens: 1 }).exceeded).toBe(false);
    expect(tracker.consume({ inputTokens: 1, outputTokens: 1 }).exceeded).toBe(true);
    expect(tracker.consume({ inputTokens: 1, outputTokens: 1 }).reason).toBe('maxTurns');
  });

  it('marks exceeded when maxTotalTokens is passed', () => {
    const tracker = createBudgetTracker({ maxTurns: 10, maxTotalTokens: 5 });

    expect(tracker.consume({ inputTokens: 2, outputTokens: 2 }).exceeded).toBe(false);
    expect(tracker.consume({ inputTokens: 2, outputTokens: 2 }).exceeded).toBe(true);
    expect(tracker.consume({ inputTokens: 0, outputTokens: 0 }).reason).toBe('maxTotalTokens');
  });
});

describe('createAnthropicProvider', () => {
  it('throws when apiKey is missing', async () => {
    const { createAnthropicProvider } = await import('../src/providers/anthropic-provider.js');

    expect(() => createAnthropicProvider({ apiKey: '', model: 'claude-test' })).toThrow(
      /API key is required/i,
    );
  });

  it('throws when model is missing', async () => {
    const { createAnthropicProvider } = await import('../src/providers/anthropic-provider.js');

    expect(() => createAnthropicProvider({ apiKey: 'secret-key', model: '' })).toThrow(
      /model is required/i,
    );
  });

  it('maps request and response through fetch without logging the api key', async () => {
    const { createAnthropicProvider } = await import('../src/providers/anthropic-provider.js');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const fetchImpl = vi.fn(async (_input: string | URL | Request, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      expect(headers['x-api-key']).toBe('secret-key');

      return new Response(
        JSON.stringify({
          content: [
            { type: 'text', text: 'Hello from Anthropic' },
            {
              type: 'tool_use',
              id: 'toolu_1',
              name: 'memory_search',
              input: { query: 'pedido' },
            },
          ],
          stop_reason: 'tool_use',
          usage: { input_tokens: 12, output_tokens: 8 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    const provider = createAnthropicProvider({
      apiKey: 'secret-key',
      model: 'claude-test-model',
      fetchImpl,
    });

    const result = await provider.complete({
      messages: [
        { role: 'system', content: 'You are Atlas.' },
        { role: 'user', content: 'Find prior orders' },
      ],
      tools: [
        {
          name: 'memory_search',
          description: 'Search memory',
          parameters: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
            },
            required: ['query'],
          },
        },
      ],
    });

    expect(fetchImpl).toHaveBeenCalledOnce();
    const requestBody = JSON.parse(String((fetchImpl.mock.calls[0]?.[1] as RequestInit)?.body)) as {
      model: string;
      system: string;
      tools: Array<{ name: string }>;
    };
    expect(requestBody.model).toBe('claude-test-model');
    expect(requestBody.system).toBe('You are Atlas.');
    expect(requestBody.tools[0]?.name).toBe('memory_search');
    expect(result.stopReason).toBe('tool_use');
    expect(result.message.toolCalls?.[0]?.name).toBe('memory_search');
    expect(result.message.toolCalls?.[0]?.arguments).toEqual({ query: 'pedido' });
    expect(result.usage).toEqual({ inputTokens: 12, outputTokens: 8 });

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
