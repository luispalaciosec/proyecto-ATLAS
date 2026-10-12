/**
 * Shared (browser + server) shapes for the LLM settings page.
 * Never carries the API key: only whether one exists and a masked hint.
 */

export const LLM_PROVIDER_KINDS = ['anthropic', 'gemini', 'ollama', 'openai-compatible'] as const;

export type LlmProviderKind = (typeof LLM_PROVIDER_KINDS)[number];

export type LlmSdkProviderId = 'anthropic' | 'openai-compatible';

export const LLM_DEFAULT_BASE_URLS: Readonly<Partial<Record<LlmProviderKind, string>>> =
  Object.freeze({
    gemini: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    ollama: 'http://localhost:11434/v1',
  });

export function isLlmProviderKind(value: unknown): value is LlmProviderKind {
  return typeof value === 'string' && (LLM_PROVIDER_KINDS as readonly string[]).includes(value);
}

export function sdkProviderIdFor(kind: LlmProviderKind): LlmSdkProviderId {
  return kind === 'anthropic' ? 'anthropic' : 'openai-compatible';
}

export function providerUsesBaseUrl(kind: LlmProviderKind): boolean {
  return kind !== 'anthropic';
}

export function providerRequiresApiKey(kind: LlmProviderKind): boolean {
  return kind !== 'ollama';
}

export type LlmSettingsSource = 'saved' | 'env' | 'none';

export interface LlmSettingsView {
  readonly source: LlmSettingsSource;
  readonly configured: boolean;
  readonly provider?: LlmProviderKind;
  readonly baseUrl?: string;
  readonly model?: string;
  readonly hasApiKey: boolean;
  /** e.g. "…a3f2"; "…" alone when the key is too short to reveal any of it. */
  readonly apiKeyMasked?: string;
}

export interface LlmSettingsInput {
  readonly provider: LlmProviderKind;
  readonly model: string;
  readonly baseUrl?: string;
  /** Empty/omitted means "keep the stored key" (only for the same provider and base URL). */
  readonly apiKey?: string;
}

export type LlmConnectionTestCode =
  | 'ok'
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'rate_limited'
  | 'unavailable'
  | 'http_error'
  | 'network'
  | 'timeout'
  | 'invalid';

export interface LlmConnectionTestResult {
  readonly ok: boolean;
  readonly code: LlmConnectionTestCode;
  readonly message: string;
  readonly status?: number;
  readonly latencyMs?: number;
}
