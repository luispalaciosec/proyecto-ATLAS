import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import type { AtlasLlmOptions } from '@atlas/sdk';

import { t } from '../../i18n/index.js';
import {
  LLM_DEFAULT_BASE_URLS,
  isLlmProviderKind,
  providerRequiresApiKey,
  providerUsesBaseUrl,
  sdkProviderIdFor,
  type LlmProviderKind,
  type LlmSettingsInput,
  type LlmSettingsView,
} from '../../presentation/llm-settings.js';

/**
 * LLM settings saved from the web page.
 *
 * Storage: plain JSON at `.atlas/llm-settings.json` (gitignored), file mode 0600.
 * This is NOT production-grade secret storage: the key is not encrypted, only
 * protected by filesystem permissions for the local user.
 *
 * Precedence: a saved file wins over the ATLAS_LLM_* environment variables.
 * Without a saved file, the environment variables are used as before.
 *
 * Application: the SessionStore gives `@atlas/cli`'s AtlasService a resolver
 * (`resolveSavedAtlasLlmOptions`) that reads this file each time a client is created.
 * When nothing is saved the resolver returns undefined and AtlasService keeps its
 * original ATLAS_LLM_* behavior. process.env is never modified.
 */

/** The sdk requires a non-empty key; local Ollama ignores it. */
const OLLAMA_PLACEHOLDER_KEY = 'ollama';

const MAX_MODEL_LENGTH = 200;
const MAX_BASE_URL_LENGTH = 500;
const MAX_API_KEY_LENGTH = 1000;

export interface StoredLlmSettings {
  readonly version: 1;
  readonly provider: LlmProviderKind;
  readonly model: string;
  readonly baseUrl?: string;
  readonly apiKey?: string;
  readonly updatedAt: string;
}

/** Resolved configuration, server-side only (contains the key). */
export interface EffectiveLlmConfig {
  readonly source: 'saved' | 'env';
  readonly provider: LlmProviderKind;
  readonly model?: string;
  readonly baseUrl?: string;
  readonly apiKey?: string;
}

export class LlmSettingsValidationError extends Error {
  readonly statusCode = 400;

  constructor(message: string) {
    super(message);
    this.name = 'LlmSettingsValidationError';
  }
}

export function resolveLlmSettingsFilePath(): string {
  const fromEnv = process.env.ATLAS_LLM_SETTINGS_FILE;

  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }

  return join(process.cwd(), '.atlas', 'llm-settings.json');
}

function readNonEmpty(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

export function readStoredLlmSettings(filePath: string): StoredLlmSettings | undefined {
  if (!existsSync(filePath)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8')) as Record<string, unknown>;
    const model = readNonEmpty(parsed.model);

    if (!isLlmProviderKind(parsed.provider) || model === undefined) {
      return undefined;
    }

    const baseUrl = readNonEmpty(parsed.baseUrl);
    const apiKey = readNonEmpty(parsed.apiKey);

    return Object.freeze({
      version: 1,
      provider: parsed.provider,
      model,
      ...(baseUrl !== undefined ? { baseUrl } : {}),
      ...(apiKey !== undefined ? { apiKey } : {}),
      updatedAt: readNonEmpty(parsed.updatedAt) ?? new Date(0).toISOString(),
    });
  } catch {
    // A corrupt file is treated as "nothing saved"; the env variables still apply.
    return undefined;
  }
}

export function writeStoredLlmSettings(filePath: string, settings: StoredLlmSettings): void {
  mkdirSync(dirname(filePath), { recursive: true, mode: 0o700 });

  const temporaryPath = `${filePath}.${process.pid}.tmp`;

  writeFileSync(temporaryPath, `${JSON.stringify(settings, null, 2)}\n`, {
    encoding: 'utf8',
    mode: 0o600,
  });
  chmodSync(temporaryPath, 0o600);
  renameSync(temporaryPath, filePath);
  chmodSync(filePath, 0o600);
}

export function deleteStoredLlmSettings(filePath: string): void {
  rmSync(filePath, { force: true });
}

/** Converts saved settings into the options AtlasService passes to createAtlas. */
export function toAtlasLlmOptions(settings: StoredLlmSettings): AtlasLlmOptions {
  const baseUrl = providerUsesBaseUrl(settings.provider) ? settings.baseUrl : undefined;

  return Object.freeze({
    providerId: sdkProviderIdFor(settings.provider),
    model: settings.model,
    apiKey:
      settings.apiKey ?? (settings.provider === 'ollama' ? OLLAMA_PLACEHOLDER_KEY : undefined),
    ...(baseUrl !== undefined ? { baseUrl } : {}),
  });
}

/** Resolver for AtlasService: saved settings, or undefined to keep the env behavior. */
export function resolveSavedAtlasLlmOptions(filePath: string): AtlasLlmOptions | undefined {
  const stored = readStoredLlmSettings(filePath);

  return stored !== undefined ? toAtlasLlmOptions(stored) : undefined;
}

function inferProviderKind(
  providerId: string | undefined,
  baseUrl: string | undefined,
): LlmProviderKind {
  if (providerId === undefined || providerId.toLowerCase() === 'anthropic') {
    return 'anthropic';
  }

  const normalizedBaseUrl = (baseUrl ?? '').toLowerCase();

  if (normalizedBaseUrl.includes('generativelanguage.googleapis.com')) {
    return 'gemini';
  }

  if (normalizedBaseUrl.includes(':11434')) {
    return 'ollama';
  }

  return 'openai-compatible';
}

export function resolveEffectiveLlmConfig(filePath: string): EffectiveLlmConfig | undefined {
  const stored = readStoredLlmSettings(filePath);

  if (stored !== undefined) {
    return Object.freeze({
      source: 'saved',
      provider: stored.provider,
      model: stored.model,
      ...(stored.baseUrl !== undefined ? { baseUrl: stored.baseUrl } : {}),
      ...(stored.apiKey !== undefined ? { apiKey: stored.apiKey } : {}),
    });
  }

  const model = readNonEmpty(process.env.ATLAS_LLM_MODEL);
  const apiKey = readNonEmpty(process.env.ATLAS_LLM_API_KEY);
  const baseUrl = readNonEmpty(process.env.ATLAS_LLM_BASE_URL);
  const providerId = readNonEmpty(process.env.ATLAS_LLM_PROVIDER);

  if (
    model === undefined &&
    apiKey === undefined &&
    baseUrl === undefined &&
    providerId === undefined
  ) {
    return undefined;
  }

  return Object.freeze({
    source: 'env',
    provider: inferProviderKind(providerId, baseUrl),
    ...(model !== undefined ? { model } : {}),
    ...(baseUrl !== undefined ? { baseUrl } : {}),
    ...(apiKey !== undefined ? { apiKey } : {}),
  });
}

export function maskApiKey(apiKey: string): string {
  // Short keys are not partially revealed at all.
  return apiKey.length >= 12 ? `…${apiKey.slice(-4)}` : '…';
}

export function isEffectiveConfigComplete(config: EffectiveLlmConfig): boolean {
  return (
    config.model !== undefined &&
    (config.apiKey !== undefined || !providerRequiresApiKey(config.provider))
  );
}

export function buildLlmSettingsView(filePath: string): LlmSettingsView {
  const effective = resolveEffectiveLlmConfig(filePath);

  if (effective === undefined) {
    return Object.freeze({ source: 'none', configured: false, hasApiKey: false });
  }

  return Object.freeze({
    source: effective.source,
    configured: isEffectiveConfigComplete(effective),
    provider: effective.provider,
    ...(effective.baseUrl !== undefined ? { baseUrl: effective.baseUrl } : {}),
    ...(effective.model !== undefined ? { model: effective.model } : {}),
    hasApiKey: effective.apiKey !== undefined,
    ...(effective.apiKey !== undefined ? { apiKeyMasked: maskApiKey(effective.apiKey) } : {}),
  });
}

function parseBaseUrl(kind: LlmProviderKind, value: unknown): string | undefined {
  if (!providerUsesBaseUrl(kind)) {
    return undefined;
  }

  const candidate = readNonEmpty(value) ?? LLM_DEFAULT_BASE_URLS[kind];

  if (candidate === undefined) {
    throw new LlmSettingsValidationError(t('settings.errors.baseUrlRequired'));
  }

  let parsed: URL;

  try {
    parsed = new URL(candidate);
  } catch {
    throw new LlmSettingsValidationError(t('settings.errors.baseUrlInvalid'));
  }

  if (
    candidate.length > MAX_BASE_URL_LENGTH ||
    (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
    parsed.username.length > 0 ||
    parsed.password.length > 0
  ) {
    throw new LlmSettingsValidationError(t('settings.errors.baseUrlInvalid'));
  }

  return candidate;
}

function parseApiKey(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== 'string') {
    throw new LlmSettingsValidationError(t('settings.errors.apiKeyInvalid'));
  }

  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return undefined;
  }

  // eslint-disable-next-line no-control-regex
  if (trimmed.length > MAX_API_KEY_LENGTH || /[\s\u0000-\u001f\u007f]/.test(trimmed)) {
    throw new LlmSettingsValidationError(t('settings.errors.apiKeyInvalid'));
  }

  return trimmed;
}

/** Validates a body from PUT/test. Throws LlmSettingsValidationError with a readable message. */
export function parseLlmSettingsInput(body: unknown): LlmSettingsInput {
  const record = (body !== null && typeof body === 'object' ? body : {}) as Record<string, unknown>;

  if (!isLlmProviderKind(record.provider)) {
    throw new LlmSettingsValidationError(t('settings.errors.invalidProvider'));
  }

  const provider = record.provider;
  const model = readNonEmpty(record.model);

  if (model === undefined || model.length > MAX_MODEL_LENGTH) {
    throw new LlmSettingsValidationError(t('settings.errors.modelRequired'));
  }

  const baseUrl = parseBaseUrl(provider, record.baseUrl);
  const apiKey = parseApiKey(record.apiKey);

  return Object.freeze({
    provider,
    model,
    ...(baseUrl !== undefined ? { baseUrl } : {}),
    ...(apiKey !== undefined ? { apiKey } : {}),
  });
}

function normalizeBaseUrl(baseUrl: string | undefined): string {
  return (baseUrl ?? '').trim().replace(/\/+$/, '').toLowerCase();
}

/**
 * Resolves the key for a proposal that left the key field empty.
 * A stored key is only reused for the SAME provider and base URL, so a changed
 * base URL can never receive a previously saved key.
 */
export function resolveApiKeyForInput(
  input: LlmSettingsInput,
  current: EffectiveLlmConfig | undefined,
): string | undefined {
  if (input.apiKey !== undefined) {
    return input.apiKey;
  }

  const sameEndpoint =
    current !== undefined &&
    current.provider === input.provider &&
    normalizeBaseUrl(current.baseUrl) === normalizeBaseUrl(input.baseUrl);

  if (sameEndpoint && current.apiKey !== undefined) {
    return current.apiKey;
  }

  if (!providerRequiresApiKey(input.provider)) {
    return undefined;
  }

  const hadKeyForOtherEndpoint = current?.apiKey !== undefined && !sameEndpoint;

  throw new LlmSettingsValidationError(
    t(
      hadKeyForOtherEndpoint
        ? 'settings.errors.apiKeyRequiredForChange'
        : 'settings.errors.apiKeyRequired',
    ),
  );
}

export function toStoredLlmSettings(
  input: LlmSettingsInput,
  apiKey: string | undefined,
): StoredLlmSettings {
  return Object.freeze({
    version: 1,
    provider: input.provider,
    model: input.model,
    ...(input.baseUrl !== undefined ? { baseUrl: input.baseUrl } : {}),
    ...(apiKey !== undefined ? { apiKey } : {}),
    updatedAt: new Date().toISOString(),
  });
}
