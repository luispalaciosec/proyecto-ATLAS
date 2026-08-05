import { describe, expect, it, vi } from 'vitest';

import { createFakeLlmProvider, createFakeLlmProviderWithRequests } from '../src/providers/fake-provider.js';
import type { LlmCompletionResult } from '../src/provider.js';
import { runToolLoop } from '../src/tool-loop.js';

const systemPrompt = 'You are Atlas.';

describe('runToolLoop', () => {
  it('returns a direct response without tool-calling', async () => {
    const provider = createFakeLlmProvider([
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Direct answer' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 2 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    const result = await runToolLoop({
      provider,
      systemPrompt,
      userMessage: 'Hello',
      tools: [],
    });

    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe('Direct answer');
    expect(result.turns).toBe(1);
    expect(result.budgetExceeded).toBe(false);
  });

  it('executes one tool call and completes on the next turn', async () => {
    const execute = vi.fn(async () => JSON.stringify({ total: 1, records: ['pedido'] }));
    const provider = createFakeLlmProvider([
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_1',
              name: 'memory_search',
              arguments: Object.freeze({ query: 'pedido' }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 3, outputTokens: 4 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Found one prior order.' }),
        usage: Object.freeze({ inputTokens: 5, outputTokens: 6 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    const result = await runToolLoop({
      provider,
      systemPrompt,
      userMessage: 'Search memory',
      tools: [
        {
          definition: {
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
          execute,
        },
      ],
    });

    expect(execute).toHaveBeenCalledWith({ query: 'pedido' });
    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe('Found one prior order.');
    expect(result.turns).toBe(2);
    expect(result.transcript.some((message) => message.role === 'tool')).toBe(true);
  });

  it('stops when maxTurns is exceeded without calling the provider again', async () => {
    const scriptedResponses: LlmCompletionResult[] = [
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_1',
              name: 'memory_search',
              arguments: Object.freeze({ query: 'a' }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_2',
              name: 'memory_search',
              arguments: Object.freeze({ query: 'b' }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Should not run' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ];

    let callIndex = 0;
    const complete = vi.fn(async () => scriptedResponses[callIndex++]!);
    const provider = Object.freeze({
      id: 'fake-spy',
      complete,
    });

    const result = await runToolLoop({
      provider,
      systemPrompt,
      userMessage: 'Loop forever',
      budget: { maxTurns: 2 },
      tools: [
        {
          definition: {
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
          execute: async () => JSON.stringify({ total: 0 }),
        },
      ],
    });

    expect(complete).toHaveBeenCalledTimes(2);
    expect(result.budgetExceeded).toBe(true);
    expect(result.success).toBe(false);
    expect(result.turns).toBe(2);
  });

  it('reports tool execution errors back to the model without crashing', async () => {
    const provider = createFakeLlmProvider([
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_1',
              name: 'memory_store',
              arguments: Object.freeze({ content: 'broken' }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Recovered after tool error.' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    const result = await runToolLoop({
      provider,
      systemPrompt,
      userMessage: 'Store this',
      tools: [
        {
          definition: {
            name: 'memory_store',
            description: 'Store memory',
            parameters: {
              type: 'object',
              properties: {
                content: { type: 'string', description: 'Content to store' },
              },
              required: ['content'],
            },
          },
          execute: async () => {
            throw new Error('storage unavailable');
          },
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.finalMessage).toBe('Recovered after tool error.');
    const toolMessage = result.transcript.find((message) => message.role === 'tool');
    expect(toolMessage?.content).toContain('storage unavailable');
  });

  it('includes prior history in the provider request', async () => {
    const priorHistory = Object.freeze([
      Object.freeze({ role: 'user' as const, content: 'Earlier question' }),
      Object.freeze({ role: 'assistant' as const, content: 'Earlier answer' }),
    ]);
    const fake = createFakeLlmProviderWithRequests([
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Follow-up answer' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    const result = await runToolLoop({
      provider: fake.provider,
      systemPrompt,
      userMessage: 'Follow-up question',
      tools: [],
      history: priorHistory,
    });

    expect(result.finalMessage).toBe('Follow-up answer');
    expect(fake.requests[0]?.messages).toEqual([
      { role: 'system', content: systemPrompt },
      ...priorHistory,
      { role: 'user', content: 'Follow-up question' },
    ]);
  });
});
