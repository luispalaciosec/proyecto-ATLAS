import { t } from '../i18n/index.js';

export interface ChatReasoningStepProduct {
  readonly type: string;
  readonly label: string;
  readonly preview?: string;
}

export interface ChatApiPayload {
  readonly command?: string;
  readonly session_id?: string;
  readonly turn?: number;
  readonly goal?: string;
  readonly success?: boolean;
  readonly mode?: 'llm' | 'deterministic';
  readonly workflow_id?: string;
  readonly llm_message?: string;
  readonly llm_turns?: number;
  readonly llm_reasoning_steps?: readonly {
    readonly type: string;
    readonly preview?: string;
  }[];
  readonly llm_elapsed_ms?: number;
  readonly llm_usage?: {
    readonly input_tokens?: number;
    readonly output_tokens?: number;
  };
  readonly budget_exceeded?: boolean;
  readonly retrieval?: {
    readonly selected?: number;
    readonly total_candidates?: number;
  };
}

export interface ChatMetricsProduct {
  readonly elapsedMs: number;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
}

export interface ProductChatView {
  readonly assistantMessage: string;
  readonly activityMessage: string;
  readonly canCorrect: boolean;
  readonly technicalDetails: string;
  readonly reasoningSteps: readonly ChatReasoningStepProduct[];
  readonly metrics: ChatMetricsProduct;
}

function mapReasoningStepProduct(type: string, preview?: string): ChatReasoningStepProduct {
  switch (type) {
    case 'memory_search':
      return {
        type,
        label: preview
          ? t('chat.reasoningMemorySearch', { query: preview })
          : t('chat.reasoningSearch'),
        preview,
      };
    case 'memory_store':
      return {
        type,
        label: preview ? t('chat.reasoningMemoryStore', { preview }) : t('chat.reasoningStore'),
        preview,
      };
    case 'plan_and_execute':
      return {
        type,
        label: preview
          ? t('chat.reasoningPlanExecute', { goal: preview })
          : t('chat.reasoningPlan'),
        preview,
      };
    case 'composing':
      return { type, label: t('chat.reasoningComposing') };
    default:
      return {
        type: 'inferencing',
        label: preview
          ? t('chat.reasoningInferPreview', { preview })
          : t('chat.reasoningInferencing'),
        preview,
      };
  }
}

export function mapReasoningStepsFromPayload(
  steps: readonly { readonly type: string; readonly preview?: string }[] | undefined,
): readonly ChatReasoningStepProduct[] {
  if (steps === undefined || steps.length === 0) {
    return [mapReasoningStepProduct('inferencing'), mapReasoningStepProduct('composing')];
  }

  return steps.map((step) => mapReasoningStepProduct(step.type, step.preview));
}

function mapMetrics(payload: ChatApiPayload, fallbackElapsedMs: number): ChatMetricsProduct {
  const elapsedMs = payload.llm_elapsed_ms ?? fallbackElapsedMs;
  const inputTokens = payload.llm_usage?.input_tokens;
  const outputTokens = payload.llm_usage?.output_tokens;

  if (inputTokens === undefined && outputTokens === undefined) {
    return { elapsedMs };
  }

  return {
    elapsedMs,
    inputTokens,
    outputTokens,
  };
}

export function mapChatResponse(payload: ChatApiPayload, fallbackElapsedMs = 0): ProductChatView {
  const technicalDetails = JSON.stringify(payload, null, 2);

  if (payload.mode === 'llm') {
    const message = payload.llm_message?.trim() ?? '';

    return {
      assistantMessage: message.length > 0 ? message : t('chat.emptyResponse'),
      activityMessage:
        payload.llm_turns !== undefined && payload.llm_turns > 1
          ? t('chat.thinkingSearch')
          : t('chat.thinking'),
      canCorrect: payload.success === true && message.length > 0,
      technicalDetails,
      reasoningSteps: mapReasoningStepsFromPayload(payload.llm_reasoning_steps),
      metrics: mapMetrics(payload, fallbackElapsedMs),
    };
  }

  return {
    assistantMessage: t('chat.deterministicSuccess'),
    activityMessage: t('chat.thinking'),
    canCorrect: false,
    technicalDetails,
    reasoningSteps: mapReasoningStepsFromPayload(undefined),
    metrics: mapMetrics(payload, fallbackElapsedMs),
  };
}
