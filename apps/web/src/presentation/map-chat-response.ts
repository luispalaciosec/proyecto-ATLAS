import { t } from '../i18n/index.js';

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
  readonly budget_exceeded?: boolean;
  readonly retrieval?: {
    readonly selected?: number;
    readonly total_candidates?: number;
  };
}

export interface ProductChatView {
  readonly assistantMessage: string;
  readonly activityMessage: string;
  readonly canCorrect: boolean;
  readonly technicalDetails: string;
}

export function mapChatResponse(payload: ChatApiPayload): ProductChatView {
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
    };
  }

  return {
    assistantMessage: t('chat.deterministicSuccess'),
    activityMessage: t('chat.thinking'),
    canCorrect: false,
    technicalDetails,
  };
}
