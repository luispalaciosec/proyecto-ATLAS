export interface LlmToolParameterSchema {
  readonly type: 'object';
  readonly properties: Readonly<
    Record<string, { readonly type: string; readonly description: string }>
  >;
  readonly required?: readonly string[];
}

export interface LlmToolDefinition {
  readonly name: string;
  readonly description: string;
  readonly parameters: LlmToolParameterSchema;
}

export interface LlmToolCall {
  readonly id: string;
  readonly name: string;
  readonly arguments: Readonly<Record<string, unknown>>;
}

export type LlmMessageRole = 'system' | 'user' | 'assistant' | 'tool';

export interface LlmMessage {
  readonly role: LlmMessageRole;
  readonly content: string;
  readonly toolCallId?: string;
  readonly toolCalls?: readonly LlmToolCall[];
}

export type LlmStopReason = 'end_turn' | 'tool_use' | 'max_tokens';

export interface LlmUsage {
  readonly inputTokens: number;
  readonly outputTokens: number;
}

export interface LlmCompletionRequest {
  readonly messages: readonly LlmMessage[];
  readonly tools?: readonly LlmToolDefinition[];
  readonly maxTokens?: number;
}

export interface LlmCompletionResult {
  readonly message: LlmMessage;
  readonly usage: LlmUsage;
  readonly stopReason: LlmStopReason;
}

export interface LlmProvider {
  readonly id: string;
  complete(request: LlmCompletionRequest): Promise<LlmCompletionResult>;
}
