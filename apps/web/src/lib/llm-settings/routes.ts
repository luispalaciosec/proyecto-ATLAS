import type { Express, Response } from 'express';

import { t } from '../../i18n/index.js';
import type { LlmConnectionTestResult } from '../../presentation/llm-settings.js';
import type { SessionStore } from '../../session-store.js';
import { testLlmConnection } from './connection-test.js';
import {
  LlmSettingsValidationError,
  buildLlmSettingsView,
  deleteStoredLlmSettings,
  isEffectiveConfigComplete,
  parseLlmSettingsInput,
  resolveApiKeyForInput,
  resolveEffectiveLlmConfig,
  toStoredLlmSettings,
  writeStoredLlmSettings,
} from './settings-store.js';

export interface LlmSettingsRoutesOptions {
  readonly sessionStore: SessionStore;
  readonly filePath: string;
  /** Injected in tests; defaults to the global fetch at call time. */
  readonly fetchImpl?: typeof fetch;
}

/**
 * Every response from these routes is built from the view (masked key) or from fixed
 * texts. Raw errors are never echoed, so the key cannot leak through an error message.
 */
function sendError(response: Response, error: unknown): void {
  if (error instanceof LlmSettingsValidationError) {
    response.status(error.statusCode).json({ error: error.message });
    return;
  }

  response.status(500).json({ error: t('settings.errors.unexpected') });
}

function invalidTestResult(message: string): LlmConnectionTestResult {
  return Object.freeze({ ok: false, code: 'invalid', message });
}

export function registerLlmSettingsRoutes(app: Express, options: LlmSettingsRoutesOptions): void {
  const { sessionStore, filePath } = options;

  app.use('/api/settings', (_request, response, next) => {
    response.setHeader('cache-control', 'no-store');
    next();
  });

  app.get('/api/settings/llm', (_request, response) => {
    try {
      response.json(buildLlmSettingsView(filePath));
    } catch (error) {
      sendError(response, error);
    }
  });

  app.put('/api/settings/llm', (request, response) => {
    try {
      const input = parseLlmSettingsInput(request.body);
      const apiKey = resolveApiKeyForInput(input, resolveEffectiveLlmConfig(filePath));
      const stored = toStoredLlmSettings(input, apiKey);

      writeStoredLlmSettings(filePath, stored);
      sessionStore.resetLlmClients();

      response.json(buildLlmSettingsView(filePath));
    } catch (error) {
      sendError(response, error);
    }
  });

  app.delete('/api/settings/llm', (_request, response) => {
    try {
      deleteStoredLlmSettings(filePath);
      sessionStore.resetLlmClients();

      response.json(buildLlmSettingsView(filePath));
    } catch (error) {
      sendError(response, error);
    }
  });

  app.post('/api/settings/llm/test', async (request, response) => {
    try {
      const current = resolveEffectiveLlmConfig(filePath);
      const hasProposal =
        request.body !== null && typeof request.body === 'object' && 'provider' in request.body;

      if (!hasProposal) {
        if (
          current === undefined ||
          !isEffectiveConfigComplete(current) ||
          current.model === undefined
        ) {
          response.status(400).json(invalidTestResult(t('settings.test.notConfigured')));
          return;
        }

        response.json(
          await testLlmConnection(
            {
              provider: current.provider,
              model: current.model,
              ...(current.baseUrl !== undefined ? { baseUrl: current.baseUrl } : {}),
              ...(current.apiKey !== undefined ? { apiKey: current.apiKey } : {}),
            },
            { fetchImpl: options.fetchImpl ?? globalThis.fetch },
          ),
        );
        return;
      }

      const input = parseLlmSettingsInput(request.body);
      const apiKey = resolveApiKeyForInput(input, current);

      response.json(
        await testLlmConnection(
          {
            provider: input.provider,
            model: input.model,
            ...(input.baseUrl !== undefined ? { baseUrl: input.baseUrl } : {}),
            ...(apiKey !== undefined ? { apiKey } : {}),
          },
          { fetchImpl: options.fetchImpl ?? globalThis.fetch },
        ),
      );
    } catch (error) {
      if (error instanceof LlmSettingsValidationError) {
        response.status(error.statusCode).json(invalidTestResult(error.message));
        return;
      }

      sendError(response, error);
    }
  });
}
