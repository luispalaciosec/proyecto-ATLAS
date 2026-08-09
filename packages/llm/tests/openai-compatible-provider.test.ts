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
