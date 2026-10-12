import { describe, expect, it, vi } from 'vitest';

import { createOpenAICompatibleProvider } from '../src/providers/openai-compatible-provider.js';

describe('createOpenAICompatibleProvider', () => {
  it('throws when apiKey is missing', () => {
    expect(() => createOpenAICompatibleProvider({ apiKey: '', model: 'qwen-test' })).toThrow(
      /API key is required/i,
    );
  });

  it('throws when model is missing', () => {
    expect(() => createOpenAICompatibleProvider({ apiKey: 'secret-key', model: '' })).toThrow(
      /model is required/i,
    );
  });

  it('maps request and response through fetch without logging the api key', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const fetchImpl = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      expect(String(input)).toBe('https://custom.example.com/v1/chat/completions');

      const headers = init?.headers as Record<string, string>;
      expect(headers.authorization).toBe('Bearer secret-key');

      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                role: 'assistant',
                content: 'Hello from OpenAI-compatible API',
                tool_calls: [
                  {
                    id: 'call_1',
                    type: 'function',
                    function: {
                      name: 'memory_search',
                      arguments: JSON.stringify({ query: 'pedido' }),
                    },
                  },
                ],
              },
              finish_reason: 'tool_calls',
            },
          ],
          usage: { prompt_tokens: 12, completion_tokens: 8 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    const provider = createOpenAICompatibleProvider({
      apiKey: 'secret-key',
      model: 'qwen-test-model',
      baseUrl: 'https://custom.example.com/v1',
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

    expect(provider.id).toBe('openai-compatible');
    expect(fetchImpl).toHaveBeenCalledOnce();
    const requestBody = JSON.parse(String((fetchImpl.mock.calls[0]?.[1] as RequestInit)?.body)) as {
      model: string;
      messages: Array<{ role: string; content?: string }>;
      tools: Array<{ function: { name: string } }>;
    };
    expect(requestBody.model).toBe('qwen-test-model');
    expect(requestBody.messages[0]).toEqual({ role: 'system', content: 'You are Atlas.' });
    expect(requestBody.tools[0]?.function.name).toBe('memory_search');
    expect(result.stopReason).toBe('tool_use');
    expect(result.message.toolCalls?.[0]?.name).toBe('memory_search');
    expect(result.message.toolCalls?.[0]?.arguments).toEqual({ query: 'pedido' });
    expect(result.usage).toEqual({ inputTokens: 12, outputTokens: 8 });

    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('maps assistant tool calls and tool results for multi-turn requests', async () => {
    const fetchImpl = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) =>
      Response.json({
        choices: [
          {
            message: { role: 'assistant', content: 'Done searching.' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 3, completion_tokens: 2 },
      }),
    );

    const provider = createOpenAICompatibleProvider({
      apiKey: 'secret-key',
      model: 'qwen-test-model',
      baseUrl: 'https://custom.example.com/v1',
      fetchImpl,
    });

    await provider.complete({
      messages: [
        { role: 'system', content: 'You are Atlas.' },
        { role: 'user', content: 'Find prior orders' },
        {
          role: 'assistant',
          content: '',
          toolCalls: [
            Object.freeze({
              id: 'call_1',
              name: 'memory_search',
              arguments: Object.freeze({ query: 'pedido' }),
            }),
          ],
        },
        {
          role: 'tool',
          toolCallId: 'call_1',
          content: JSON.stringify({ total: 1 }),
        },
      ],
    });

    const requestBody = JSON.parse(String((fetchImpl.mock.calls[0]?.[1] as RequestInit)?.body)) as {
      messages: Array<Record<string, unknown>>;
    };

    expect(requestBody.messages).toEqual([
      { role: 'system', content: 'You are Atlas.' },
      { role: 'user', content: 'Find prior orders' },
      {
        role: 'assistant',
        content: null,
        tool_calls: [
          {
            id: 'call_1',
            type: 'function',
            function: {
              name: 'memory_search',
              arguments: JSON.stringify({ query: 'pedido' }),
            },
          },
        ],
      },
      {
        role: 'tool',
        tool_call_id: 'call_1',
        content: JSON.stringify({ total: 1 }),
      },
    ]);
  });

  it('echoes provider extra_content (e.g. Gemini thought signatures) back on the next request', async () => {
    const extra = { google: { thought_signature: 'sig-abc' } };
    const responses = [
      Response.json({
        choices: [
          {
            message: {
              role: 'assistant',
              content: null,
              tool_calls: [
                {
                  id: 'call_1',
                  type: 'function',
                  function: { name: 'memory_search', arguments: '{"query":"pedido"}' },
                  extra_content: extra,
                },
              ],
            },
            finish_reason: 'tool_calls',
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      }),
      Response.json({
        choices: [{ message: { role: 'assistant', content: 'Done' }, finish_reason: 'stop' }],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      }),
    ];
    const fetchImpl = vi.fn(async (_input: string | URL | Request, _init?: RequestInit) => {
      const next = responses.shift();

      if (next === undefined) {
        throw new Error('unexpected extra request');
      }

      return next;
    });

    const provider = createOpenAICompatibleProvider({
      apiKey: 'secret-key',
      model: 'gemini-test',
      baseUrl: 'https://custom.example.com/v1',
      fetchImpl,
    });

    const first = await provider.complete({
      messages: [{ role: 'user', content: 'Find prior orders' }],
    });
    const assistantMessage = first.message;

    expect(assistantMessage.toolCalls?.[0]?.providerExtra).toEqual(extra);

    await provider.complete({
      messages: [
        { role: 'user', content: 'Find prior orders' },
        assistantMessage,
        { role: 'tool', toolCallId: 'call_1', content: '{}' },
      ],
    });

    const secondBody = JSON.parse(String((fetchImpl.mock.calls[1]?.[1] as RequestInit)?.body)) as {
      messages: Array<{ tool_calls?: Array<{ extra_content?: unknown }> }>;
    };

    expect(secondBody.messages[1]?.tool_calls?.[0]?.extra_content).toEqual(extra);
  });

  it('uses the Qwen-compatible default base URL when baseUrl is omitted', async () => {
    const fetchImpl = vi.fn(async (input: string | URL | Request) => {
      expect(String(input)).toBe(
        'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      );

      return Response.json({
        choices: [
          {
            message: { role: 'assistant', content: 'OK' },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      });
    });

    const provider = createOpenAICompatibleProvider({
      apiKey: 'secret-key',
      model: 'qwen-test-model',
      fetchImpl,
    });

    const result = await provider.complete({
      messages: [{ role: 'user', content: 'Hello' }],
    });

    expect(result.stopReason).toBe('end_turn');
    expect(result.message.content).toBe('OK');
  });

  it('maps max_tokens stop reason from length finish_reason', async () => {
    const fetchImpl = vi.fn(async () =>
      Response.json({
        choices: [
          {
            message: { role: 'assistant', content: 'Partial' },
            finish_reason: 'length',
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1 },
      }),
    );

    const provider = createOpenAICompatibleProvider({
      apiKey: 'secret-key',
      model: 'qwen-test-model',
      baseUrl: 'https://custom.example.com/v1',
      fetchImpl,
    });

    const result = await provider.complete({
      messages: [{ role: 'user', content: 'Hello' }],
    });

    expect(result.stopReason).toBe('max_tokens');
  });
});

describe('createOpenAICompatibleProvider retries on 429/503', () => {
  const okBody = {
    choices: [{ message: { role: 'assistant', content: 'Listo' }, finish_reason: 'stop' }],
    usage: { prompt_tokens: 1, completion_tokens: 1 },
  };
  const geminiRateLimit = (seconds: number) =>
    Response.json(
      [
        {
          error: {
            code: 429,
            status: 'RESOURCE_EXHAUSTED',
            details: [
              {
                '@type': 'type.googleapis.com/google.rpc.RetryInfo',
                retryDelay: `${seconds}s`,
              },
            ],
          },
        },
      ],
      { status: 429 },
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
    const provider = createOpenAICompatibleProvider({
      apiKey: 'secret-key',
      model: 'gemini-test',
      baseUrl: 'https://custom.example.com/v1',
      fetchImpl,
      sleep,
    });

    return { fetchImpl, sleep, provider };
  }

  const request = { messages: [{ role: 'user' as const, content: 'Hola' }] };

  it('retries a 429 after the retryDelay the server asks for, then succeeds', async () => {
    const { fetchImpl, sleep, provider } = setup([geminiRateLimit(3), Response.json(okBody)]);

    const result = await provider.complete(request);

    expect(result.message.content).toBe('Listo');
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenCalledExactlyOnceWith(3000);
  });

  it('gives up after 3 attempts on repeated 503 with growing waits and the same error as before', async () => {
    const { fetchImpl, sleep, provider } = setup([
      new Response('unavailable', { status: 503 }),
      new Response('unavailable', { status: 503 }),
      new Response('unavailable', { status: 503 }),
    ]);

    await expect(provider.complete(request)).rejects.toThrow(
      'OpenAI-compatible API error (503): unavailable',
    );
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([1000, 2000]);
  });

  it('does not retry when the server asks to wait longer than the cap', async () => {
    const { fetchImpl, sleep, provider } = setup([geminiRateLimit(45)]);

    await expect(provider.complete(request)).rejects.toThrow(/API error \(429\)/);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it('honors a Retry-After header in seconds and does not retry other errors', async () => {
    const withHeader = setup([
      new Response('busy', { status: 503, headers: { 'retry-after': '2' } }),
      Response.json(okBody),
    ]);

    await withHeader.provider.complete(request);
    expect(withHeader.sleep).toHaveBeenCalledExactlyOnceWith(2000);

    const badRequest = setup([new Response('bad model', { status: 400 })]);

    await expect(badRequest.provider.complete(request)).rejects.toThrow(
      'OpenAI-compatible API error (400): bad model',
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
      new Response('busy', { status: 503 }),
      geminiRateLimit(1),
      Response.json(okBody),
    ]);

    await provider.complete(request);

    const inits = fetchImpl.mock.calls.map(([, init]) => init);
    expect(inits).toHaveLength(3);
    expect(new Set(inits.map((init) => init?.body)).size).toBe(1);
    expect(
      inits.every(
        (init) => (init?.headers as Record<string, string>).authorization === 'Bearer secret-key',
      ),
    ).toBe(true);
    expect(logSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();

    logSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
