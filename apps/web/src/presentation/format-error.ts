import { t } from '../i18n/index.js';

export interface UserFacingError {
  readonly message: string;
  readonly technical: string;
}

export function formatUserError(raw: string): UserFacingError {
  const technical = raw.trim();
  const lower = technical.toLowerCase();

  if (lower.includes('429') || lower.includes('rate limit') || lower.includes('rate_limit')) {
    return { message: t('errors.rateLimit'), technical };
  }

  if (lower.includes('tool_use_failed') || lower.includes('failed to call a function')) {
    return { message: t('errors.toolFailed'), technical };
  }

  if (lower.includes('econnrefused') || lower.includes('fetch failed') || lower.includes('network')) {
    return { message: t('errors.connection'), technical };
  }

  if (lower.includes('llm') && (lower.includes('required') || lower.includes('api_key'))) {
    return { message: t('errors.llmRequired'), technical };
  }

  if (lower.includes('goal must not be empty')) {
    return { message: t('errors.emptyMessage'), technical };
  }

  if (lower.includes('correction must not be empty')) {
    return { message: t('errors.emptyCorrection'), technical };
  }

  if (lower.includes('workspace name must not be empty')) {
    return { message: t('errors.emptyWorkspace'), technical };
  }

  if (lower.includes('nothing to correct')) {
    return { message: t('chat.correctNoTurn'), technical };
  }

  return { message: t('errors.generic'), technical };
}

export function formatCorrectionStatus(status: string, message?: string): UserFacingError {
  if (status === 'no_prior_turn') {
    return { message: t('chat.correctNoTurn'), technical: message ?? status };
  }

  if (status === 'llm_required') {
    return { message: t('chat.correctLlmRequired'), technical: message ?? status };
  }

  if (status === 'recorded') {
    return { message: t('chat.corrected'), technical: message ?? status };
  }

  if (typeof message === 'string' && message.trim().length > 0) {
    return formatUserError(message);
  }

  return { message: t('errors.generic'), technical: status };
}
