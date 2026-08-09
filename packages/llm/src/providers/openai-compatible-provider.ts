import type {
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmMessage,
  LlmProvider,
  LlmStopReason,
  LlmToolCall,
  LlmToolDefinition,
} from '../provider.js';

const DEFAULT_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

export interface OpenAICompatibleProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly baseUrl?: string;
  readonly fetchImpl?: typeof fetch;
}

interface OpenAiToolCall {
  readonly id: string;
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly arguments: string;
  };
}

interface OpenAiMessage {
  readonly role: 'system' | 'user' | 'assistant' | 'tool';
  readonly content?: string | null;
  readonly tool_calls?: readonly OpenAiToolCall[];
  readonly tool_call_id?: string;
}

interface OpenAiToolDefinition {
  readonly type: 'function';
  readonly function: {
    readonly name: string;
    readonly description: string;
    readonly parameters: LlmToolDefinition['parameters'];
  };
}

function assertOpenAICompatibleCredentials(options: OpenAICompatibleProviderOptions): void {
  if (typeof options.apiKey !== 'string' || options.apiKey.trim().length === 0) {
    throw new Error('OpenAI-compatible API key is required (set ATLAS_LLM_API_KEY)');
  }

  if (typeof options.model !== 'string' || options.model.trim().length === 0) {
    throw new Error('LLM model is required (set ATLAS_LLM_MODEL)');
  }
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

function resolveChatCompletionsUrl(baseUrl: string): string {
  return `${normalizeBaseUrl(baseUrl)}/chat/completions`;
}

function mapToolDefinition(tool: LlmToolDefinition): OpenAiToolDefinition {
  return Object.freeze({
    type: 'function' as const,
    function: Object.freeze({
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }),
  });
}

function parseToolArguments(raw: unknown): Readonly<Record<string, unknown>> {
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw) as unknown;

      if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.freeze({ ...(parsed as Record<string, unknown>) });
      }
    } catch {
      return Object.freeze({});
    }

    return Object.freeze({});
  }

  if (raw !== null && typeof raw === 'object' && !Array.isArray(raw)) {
    return Object.freeze({ ...(raw as Record<string, unknown>) });
  }

  return Object.freeze({});
}

function mapMessages(messages: readonly LlmMessage[]): readonly OpenAiMessage[] {
  const openAiMessages: OpenAiMessage[] = [];

  for (const message of messages) {
    if (message.role === 'system') {
      openAiMessages.push({
        role: 'system',
        content: message.content,
      });
      continue;
    }

    if (message.role === 'user') {
      openAiMessages.push({
        role: 'user',
        content: message.content,
      });
      continue;
    }

    if (message.role === 'assistant') {
      const toolCalls = message.toolCalls ?? [];

      if (toolCalls.length > 0) {
        openAiMessages.push({
          role: 'assistant',
          content: message.content.trim().length > 0 ? message.content : null,
          tool_calls: toolCalls.map((toolCall) =>
            Object.freeze({
              id: toolCall.id,
              type: 'function' as const,
              function: Object.freeze({
                name: toolCall.name,
                arguments: JSON.stringify(toolCall.arguments),
              }),
            }),
          ),
        });
      } else {
        openAiMessages.push({
          role: 'assistant',
          content: message.content,
        });
      }

      continue;
    }

    if (message.role === 'tool') {
      openAiMessages.push({
        role: 'tool',
        tool_call_id: message.toolCallId ?? '',
        content: message.content,
      });
    }
  }

  return Object.freeze(openAiMessages);
}

function mapStopReason(raw: string | undefined): LlmStopReason {
  if (raw === 'tool_calls') {
    return 'tool_use';
  }

  if (raw === 'length') {
    return 'max_tokens';
  }

  return 'end_turn';
}

function mapToolCalls(toolCalls: readonly OpenAiToolCall[] | undefined): readonly LlmToolCall[] {
  if (toolCalls === undefined || toolCalls.length === 0) {
    return Object.freeze([]);
  }

  const mapped: LlmToolCall[] = [];

  for (const toolCall of toolCalls) {
    mapped.push(
      Object.freeze({
        id: toolCall.id,
        name: toolCall.function.name,
        arguments: parseToolArguments(toolCall.function.arguments),
      }),
    );
  }

  return Object.freeze(mapped);
}

function mapOpenAICompatibleResponse(body: {
  readonly choices?: readonly {
    readonly message?: {
      readonly role?: string;
      readonly content?: string | null;
      readonly tool_calls?: readonly OpenAiToolCall[];
    };
    readonly finish_reason?: string;
  }[];
  readonly usage?: {
    readonly prompt_tokens?: number;
    readonly completion_tokens?: number;
  };
}): LlmCompletionResult {
  const choice = body.choices?.[0];
  const assistantMessage = choice?.message;
  const content = assistantMessage?.content ?? '';
  const toolCalls = mapToolCalls(assistantMessage?.tool_calls);
  const normalizedContent = typeof content === 'string' ? content : '';

  const message: LlmMessage = Object.freeze({
    role: 'assistant',
    content: normalizedContent,
    ...(toolCalls.length > 0 ? { toolCalls } : {}),
  });

  return Object.freeze({
    message,
    usage: Object.freeze({
      inputTokens: body.usage?.prompt_tokens ?? 0,
      outputTokens: body.usage?.completion_tokens ?? 0,
    }),
    stopReason: mapStopReason(choice?.finish_reason),
  });
}

export function createOpenAICompatibleProvider(
  options: OpenAICompatibleProviderOptions,
): LlmProvider {
  assertOpenAICompatibleCredentials(options);

  const apiKey = options.apiKey.trim();
  const model = options.model.trim();
  const baseUrl = normalizeBaseUrl(
    typeof options.baseUrl === 'string' && options.baseUrl.trim().length > 0
      ? options.baseUrl.trim()
      : DEFAULT_BASE_URL,
  );
  const chatCompletionsUrl = resolveChatCompletionsUrl(baseUrl);
  const fetchImpl = options.fetchImpl ?? fetch;

  return Object.freeze({
    id: 'openai-compatible',
    async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
      const body: Record<string, unknown> = {
        model,
        messages: mapMessages(request.messages),
        max_tokens: request.maxTokens ?? 1024,
      };

      if (request.tools !== undefined && request.tools.length > 0) {
        body.tools = request.tools.map(mapToolDefinition);
      }

      const response = await fetchImpl(chatCompletionsUrl, {
        method: 'POST',
        headers: Object.freeze({
          'content-type': 'application/json',
          authorization: `Bearer ${apiKey}`,
        }),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI-compatible API error (${response.status}): ${errorText}`);
      }

      const payload = (await response.json()) as {
        readonly choices?: readonly {
          readonly message?: {
            readonly role?: string;
            readonly content?: string | null;
            readonly tool_calls?: readonly OpenAiToolCall[];
          };
          readonly finish_reason?: string;
        }[];
        readonly usage?: {
          readonly prompt_tokens?: number;
          readonly completion_tokens?: number;
        };
      };

      return mapOpenAICompatibleResponse(payload);
    },
  });
}
