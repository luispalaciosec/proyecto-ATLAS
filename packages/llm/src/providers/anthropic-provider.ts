import type {
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmMessage,
  LlmProvider,
  LlmStopReason,
  LlmToolCall,
  LlmToolDefinition,
} from '../provider.js';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

export interface AnthropicProviderOptions {
  readonly apiKey: string;
  readonly model: string;
  readonly fetchImpl?: typeof fetch;
  /** Wait used between retries; injectable for tests. Defaults to setTimeout. */
  readonly sleep?: (ms: number) => Promise<void>;
}

/** Transient answers worth retrying: rate limit, unavailable, overloaded (Anthropic 529). */
const RETRYABLE_STATUSES = new Set([429, 503, 529]);
const MAX_ATTEMPTS = 3;
const MAX_RETRY_DELAY_MS = 8_000;

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Delay before retry `attempt`: the Retry-After header (seconds) when present, else 1s, 2s…
 * `undefined` when the server asks to wait longer than MAX_RETRY_DELAY_MS: fail fast instead.
 */
function resolveRetryDelayMs(retryAfter: string | null, attempt: number): number | undefined {
  const seconds = retryAfter !== null ? Number.parseFloat(retryAfter) : Number.NaN;
  const delayMs = Number.isFinite(seconds) ? seconds * 1000 : 1000 * 2 ** (attempt - 1);

  return delayMs <= MAX_RETRY_DELAY_MS ? delayMs : undefined;
}

interface AnthropicContentBlock {
  readonly type: string;
  readonly text?: string;
  readonly id?: string;
  readonly name?: string;
  readonly input?: Record<string, unknown>;
  readonly tool_use_id?: string;
  readonly content?: string;
}

interface AnthropicMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string | readonly AnthropicContentBlock[];
}

interface AnthropicToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly input_schema: {
    readonly type: 'object';
    readonly properties: Record<string, { readonly type: string; readonly description: string }>;
    readonly required?: readonly string[];
  };
}

function assertAnthropicCredentials(options: AnthropicProviderOptions): void {
  if (typeof options.apiKey !== 'string' || options.apiKey.trim().length === 0) {
    throw new Error('Anthropic API key is required (set ATLAS_LLM_API_KEY)');
  }

  if (typeof options.model !== 'string' || options.model.trim().length === 0) {
    throw new Error('LLM model is required (set ATLAS_LLM_MODEL)');
  }
}

function mapToolDefinition(tool: LlmToolDefinition): AnthropicToolDefinition {
  return Object.freeze({
    name: tool.name,
    description: tool.description,
    input_schema: Object.freeze({
      type: 'object' as const,
      properties: { ...tool.parameters.properties },
      ...(tool.parameters.required !== undefined
        ? { required: [...tool.parameters.required] }
        : {}),
    }),
  });
}

function splitMessages(messages: readonly LlmMessage[]): {
  readonly system?: string;
  readonly anthropicMessages: readonly AnthropicMessage[];
} {
  const systemParts: string[] = [];
  const anthropicMessages: AnthropicMessage[] = [];

  for (const message of messages) {
    if (message.role === 'system') {
      systemParts.push(message.content);
      continue;
    }

    if (message.role === 'user') {
      anthropicMessages.push({
        role: 'user',
        content: message.content,
      });
      continue;
    }

    if (message.role === 'assistant') {
      if (message.toolCalls !== undefined && message.toolCalls.length > 0) {
        const blocks: AnthropicContentBlock[] = [];

        if (message.content.trim().length > 0) {
          blocks.push({ type: 'text', text: message.content });
        }

        for (const toolCall of message.toolCalls) {
          blocks.push({
            type: 'tool_use',
            id: toolCall.id,
            name: toolCall.name,
            input: { ...toolCall.arguments },
          });
        }

        anthropicMessages.push({ role: 'assistant', content: blocks });
      } else {
        anthropicMessages.push({ role: 'assistant', content: message.content });
      }
      continue;
    }

    if (message.role === 'tool') {
      anthropicMessages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: message.toolCallId ?? '',
            content: message.content,
          },
        ],
      });
    }
  }

  return Object.freeze({
    ...(systemParts.length > 0 ? { system: systemParts.join('\n\n') } : {}),
    anthropicMessages: Object.freeze(anthropicMessages),
  });
}

function mapStopReason(raw: string | undefined): LlmStopReason {
  if (raw === 'tool_use') {
    return 'tool_use';
  }

  if (raw === 'max_tokens') {
    return 'max_tokens';
  }

  return 'end_turn';
}

function mapToolCalls(content: readonly AnthropicContentBlock[]): readonly LlmToolCall[] {
  const toolCalls: LlmToolCall[] = [];

  for (const block of content) {
    if (block.type !== 'tool_use' || block.id === undefined || block.name === undefined) {
      continue;
    }

    toolCalls.push(
      Object.freeze({
        id: block.id,
        name: block.name,
        arguments: Object.freeze(block.input ?? {}),
      }),
    );
  }

  return Object.freeze(toolCalls);
}

function mapAnthropicResponse(body: {
  readonly content?: readonly AnthropicContentBlock[];
  readonly stop_reason?: string;
  readonly usage?: { readonly input_tokens?: number; readonly output_tokens?: number };
}): LlmCompletionResult {
  const content = body.content ?? [];
  const textParts = content
    .filter((block) => block.type === 'text' && typeof block.text === 'string')
    .map((block) => block.text as string);
  const toolCalls = mapToolCalls(content);

  const message: LlmMessage = Object.freeze({
    role: 'assistant',
    content: textParts.join('\n'),
    ...(toolCalls.length > 0 ? { toolCalls } : {}),
  });

  return Object.freeze({
    message,
    usage: Object.freeze({
      inputTokens: body.usage?.input_tokens ?? 0,
      outputTokens: body.usage?.output_tokens ?? 0,
    }),
    stopReason: mapStopReason(body.stop_reason),
  });
}

export function createAnthropicProvider(options: AnthropicProviderOptions): LlmProvider {
  assertAnthropicCredentials(options);

  const apiKey = options.apiKey.trim();
  const model = options.model.trim();
  const fetchImpl = options.fetchImpl ?? fetch;
  const sleep = options.sleep ?? defaultSleep;

  return Object.freeze({
    id: 'anthropic',
    async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
      const { system, anthropicMessages } = splitMessages(request.messages);
      const body: Record<string, unknown> = {
        model,
        max_tokens: request.maxTokens ?? 1024,
        messages: anthropicMessages,
      };

      if (system !== undefined) {
        body.system = system;
      }

      if (request.tools !== undefined && request.tools.length > 0) {
        body.tools = request.tools.map(mapToolDefinition);
      }

      const init: RequestInit = {
        method: 'POST',
        headers: Object.freeze({
          'content-type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_VERSION,
        }),
        body: JSON.stringify(body),
      };
      let response = await fetchImpl(ANTHROPIC_MESSAGES_URL, init);

      for (
        let attempt = 1;
        !response.ok && RETRYABLE_STATUSES.has(response.status) && attempt < MAX_ATTEMPTS;
        attempt += 1
      ) {
        const delayMs = resolveRetryDelayMs(response.headers.get('retry-after'), attempt);

        if (delayMs === undefined) {
          break;
        }

        await sleep(delayMs);
        response = await fetchImpl(ANTHROPIC_MESSAGES_URL, init);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
      }

      const payload = (await response.json()) as {
        readonly content?: readonly AnthropicContentBlock[];
        readonly stop_reason?: string;
        readonly usage?: { readonly input_tokens?: number; readonly output_tokens?: number };
      };

      return mapAnthropicResponse(payload);
    },
  });
}
