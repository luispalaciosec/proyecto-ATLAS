import { describe, expect, it, vi } from 'vitest';

import { createBudgetTracker } from '../src/budget.js';
import { createAnthropicProvider } from '../src/providers/anthropic-provider.js';

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

describe('createAnthropicProvider retries on 429/503/529', () => {
  const okBody = {
    content: [{ type: 'text', text: 'Listo' }],
    stop_reason: 'end_turn',
    usage: { input_tokens: 1, output_tokens: 1 },
  };
  const overloaded = () =>
    Response.json(
      { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } },
      { status: 529 },
    );

  function setup(responses: Response[]) {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => {
      const next = responses.shift();

      if (next === undefined) {
        throw new Error('unexpected extra request');
      }

      return next;
    });
    const sleep = vi.fn(async (_ms: number) => undefined);
    const provider = createAnthropicProvider({
      apiKey: 'secret-key',
      model: 'claude-test-model',
      fetchImpl,
      sleep,
    });

    return { fetchImpl, sleep, provider };
  }

  const request = { messages: [{ role: 'user' as const, content: 'Hola' }] };

  it('retries a 429 after the Retry-After the server asks for, then succeeds', async () => {
    const { fetchImpl, sleep, provider } = setup([
      new Response('rate limited', { status: 429, headers: { 'retry-after': '3' } }),
      Response.json(okBody),
    ]);

    const result = await provider.complete(request);

    expect(result.message.content).toBe('Listo');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledExactlyOnceWith(3000);
  });

  it('gives up after 3 attempts on repeated 529 with growing waits and the same error as before', async () => {
    const { fetchImpl, sleep, provider } = setup([overloaded(), overloaded(), overloaded()]);

    await expect(provider.complete(request)).rejects.toThrow(
      /^Anthropic API error \(529\): .*overloaded_error/,
    );
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([1000, 2000]);
  });

  it('does not retry when the server asks to wait longer than the cap', async () => {
    const { fetchImpl, sleep, provider } = setup([
      new Response('rate limited', { status: 429, headers: { 'retry-after': '45' } }),
    ]);

    await expect(provider.complete(request)).rejects.toThrow(
      'Anthropic API error (429): rate limited',
    );
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('retries a 503 but never other errors', async () => {
    const unavailable = setup([
      new Response('unavailable', { status: 503 }),
      Response.json(okBody),
    ]);

    await unavailable.provider.complete(request);
    expect(unavailable.fetchImpl).toHaveBeenCalledTimes(2);
    expect(unavailable.sleep).toHaveBeenCalledExactlyOnceWith(1000);

    const badRequest = setup([new Response('bad model', { status: 400 })]);

    await expect(badRequest.provider.complete(request)).rejects.toThrow(
      'Anthropic API error (400): bad model',
    );
    expect(badRequest.fetchImpl).toHaveBeenCalledTimes(1);
    expect(badRequest.sleep).not.toHaveBeenCalled();
  });

  it('behaves exactly as before when the first attempt succeeds', async () => {
    const { fetchImpl, sleep, provider } = setup([Response.json(okBody)]);

    await provider.complete(request);

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('resends the identical request on every attempt without logging the key', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { fetchImpl, provider } = setup([
      overloaded(),
      new Response('rate limited', { status: 429, headers: { 'retry-after': '1' } }),
      Response.json(okBody),
    ]);

    await provider.complete(request);

    const inits = fetchImpl.mock.calls.map(([, init]) => init);
    expect(inits).toHaveLength(3);
    expect(new Set(inits.map((init) => init?.body)).size).toBe(1);
    expect(
      inits.every(
        (init) => (init?.headers as Record<string, string>)['x-api-key'] === 'secret-key',
      ),
    ).toBe(true);
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
