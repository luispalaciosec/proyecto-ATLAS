import { t } from '../../i18n/index.js';
import type {
  LlmConnectionTestCode,
  LlmConnectionTestResult,
  LlmProviderKind,
} from '../../presentation/llm-settings.js';

const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
/** Same fallback as the openai-compatible provider in @atlas/llm when no base URL is set. */
const OPENAI_COMPATIBLE_FALLBACK_BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
const DEFAULT_TIMEOUT_MS = 15_000;
/** Small but non-trivial: reasoning models may reject or truncate a 1-token budget. */
const TEST_MAX_TOKENS = 16;

export interface LlmConnectionTestConfig {
  readonly provider: LlmProviderKind;
  readonly model: string;
  readonly baseUrl?: string;
  readonly apiKey?: string;
}

export interface LlmConnectionTestOptions {
  readonly fetchImpl?: typeof fetch;
  readonly timeoutMs?: number;
}

function buildRequest(config: LlmConnectionTestConfig): { url: string; init: RequestInit } {
  const messages = [{ role: 'user', content: 'ping' }];

  if (config.provider === 'anthropic') {
    return {
      url: ANTHROPIC_MESSAGES_URL,
      init: {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': config.apiKey ?? '',
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({ model: config.model, max_tokens: TEST_MAX_TOKENS, messages }),
      },
    };
  }

  const baseUrl = (config.baseUrl ?? OPENAI_COMPATIBLE_FALLBACK_BASE_URL).replace(/\/+$/, '');

  return {
    url: `${baseUrl}/chat/completions`,
    init: {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(config.apiKey !== undefined ? { authorization: `Bearer ${config.apiKey}` } : {}),
      },
      body: JSON.stringify({ model: config.model, max_tokens: TEST_MAX_TOKENS, messages }),
    },
  };
}

function failure(
  code: LlmConnectionTestCode,
  message: string,
  status?: number,
): LlmConnectionTestResult {
  return Object.freeze({ ok: false, code, message, ...(status !== undefined ? { status } : {}) });
}

/** Maps an HTTP status to a readable result. The provider's body is never read or returned. */
export function mapConnectionStatus(status: number, latencyMs: number): LlmConnectionTestResult {
  if (status >= 200 && status < 300) {
    return Object.freeze({
      ok: true,
      code: 'ok',
      message: t('settings.test.ok', { ms: latencyMs }),
      status,
      latencyMs,
    });
  }

  switch (status) {
    case 400:
      return failure('bad_request', t('settings.test.badRequest'), status);
    case 401:
      return failure('unauthorized', t('settings.test.unauthorized'), status);
    case 403:
      return failure('forbidden', t('settings.test.forbidden'), status);
    case 404:
      return failure('not_found', t('settings.test.notFound'), status);
    case 429:
      return failure('rate_limited', t('settings.test.rateLimited'), status);
    case 500:
    case 502:
    case 503:
    case 504:
      return failure('unavailable', t('settings.test.unavailable', { status }), status);
    default:
      return failure('http_error', t('settings.test.httpError', { status }), status);
  }
}

export async function testLlmConnection(
  config: LlmConnectionTestConfig,
  options: LlmConnectionTestOptions = {},
): Promise<LlmConnectionTestResult> {
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  const { url, init } = buildRequest(config);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  const startedAt = Date.now();

  try {
    const response = await fetchImpl(url, { ...init, signal: controller.signal });

    // Release the connection without looking at the body (it may echo request data).
    await response.body?.cancel().catch(() => undefined);

    return mapConnectionStatus(response.status, Date.now() - startedAt);
  } catch (error) {
    // Underlying error messages are discarded on purpose: only fixed texts leave the server.
    if (controller.signal.aborted || (error instanceof Error && error.name === 'AbortError')) {
      return failure('timeout', t('settings.test.timeout'));
    }

    return failure('network', t('settings.test.network'));
  } finally {
    clearTimeout(timer);
  }
}
