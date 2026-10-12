import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Express } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toAtlasLlmOptions } from '../src/lib/llm-settings/settings-store.js';
import { createWebServer, type WebServerOptions } from '../src/server.js';

// Fictitious keys only — never real credentials.
const FAKE_KEY = 'sk-test-FICTICIA-000000a3f2';
const OTHER_FAKE_KEY = 'sk-test-OTRA-FICTICIA-0000b7c9';
const ENV_KEYS = [
  'ATLAS_LLM_PROVIDER',
  'ATLAS_LLM_BASE_URL',
  'ATLAS_LLM_API_KEY',
  'ATLAS_LLM_MODEL',
  'ATLAS_MEMORY_FILE',
  'ATLAS_LLM_SETTINGS_FILE',
] as const;
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/';

const originalFetch = globalThis.fetch;

async function withServer<T>(app: Express, run: (baseUrl: string) => Promise<T>): Promise<T> {
  let server: Server | undefined;

  try {
    const baseUrl = await new Promise<string>((resolve, reject) => {
      server = createServer(app);
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => {
        const address = server?.address();

        if (address === null || typeof address !== 'object') {
          reject(new Error('Unable to resolve test server port'));
          return;
        }

        resolve(`http://127.0.0.1:${address.port}`);
      });
    });

    return await run(baseUrl);
  } finally {
    await new Promise<void>((resolve) => {
      if (server === undefined) {
        resolve();
        return;
      }

      server.close(() => resolve());
    });
  }
}

interface ApiCall {
  readonly status: number;
  readonly text: string;
  readonly json: Record<string, unknown>;
}

async function call(
  baseUrl: string,
  path: string,
  method = 'GET',
  body?: unknown,
): Promise<ApiCall> {
  const response = await originalFetch(`${baseUrl}${path}`, {
    method,
    ...(body !== undefined
      ? { headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }
      : {}),
  });
  const text = await response.text();

  return { status: response.status, text, json: JSON.parse(text) as Record<string, unknown> };
}

function expectNoSecret(result: ApiCall, ...secrets: string[]): void {
  for (const secret of secrets) {
    expect(result.text).not.toContain(secret);
  }
}

describe('LLM settings API', () => {
  const savedCwd = process.cwd();
  const savedEnv = new Map<string, string | undefined>();
  let testRoot = '';
  let settingsFile = '';

  function createApp(options: Omit<WebServerOptions, 'llmSettingsFilePath'> = {}): Express {
    return createWebServer(undefined, { ...options, llmSettingsFilePath: settingsFile });
  }

  beforeEach(() => {
    testRoot = mkdtempSync(join(tmpdir(), 'atlas-llm-settings-'));
    process.chdir(testRoot);
    mkdirSync(join(testRoot, '.atlas', 'workspaces'), { recursive: true });
    settingsFile = join(testRoot, '.atlas', 'llm-settings.json');

    for (const key of ENV_KEYS) {
      savedEnv.set(key, process.env[key]);
      delete process.env[key];
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.chdir(savedCwd);
    rmSync(testRoot, { recursive: true, force: true });

    for (const key of ENV_KEYS) {
      const value = savedEnv.get(key);

      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  });

  it('reports "none" when nothing is saved and no env variables are set', async () => {
    await withServer(createApp(), async (baseUrl) => {
      const result = await call(baseUrl, '/api/settings/llm');

      expect(result.status).toBe(200);
      expect(result.json).toEqual({ source: 'none', configured: false, hasApiKey: false });
    });
  });

  it('falls back to env variables and only returns a masked key', async () => {
    process.env.ATLAS_LLM_API_KEY = FAKE_KEY;
    process.env.ATLAS_LLM_MODEL = 'claude-test-model';

    await withServer(createApp(), async (baseUrl) => {
      const result = await call(baseUrl, '/api/settings/llm');

      expect(result.json).toMatchObject({
        source: 'env',
        configured: true,
        provider: 'anthropic',
        model: 'claude-test-model',
        hasApiKey: true,
        apiKeyMasked: '…a3f2',
      });
      expectNoSecret(result, FAKE_KEY);
    });
  });

  it('saves with PUT (file mode 0600), returns a masked view and never echoes the key', async () => {
    await withServer(createApp(), async (baseUrl) => {
      const saved = await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'gemini',
        model: 'gemini-test-model',
        apiKey: FAKE_KEY,
      });

      expect(saved.status).toBe(200);
      expect(saved.json).toMatchObject({
        source: 'saved',
        configured: true,
        provider: 'gemini',
        baseUrl: GEMINI_BASE_URL,
        model: 'gemini-test-model',
        apiKeyMasked: '…a3f2',
      });
      expectNoSecret(saved, FAKE_KEY);

      const fetched = await call(baseUrl, '/api/settings/llm');
      expect(fetched.json).toEqual(saved.json);
      expectNoSecret(fetched, FAKE_KEY);
    });

    expect(statSync(settingsFile).mode & 0o777).toBe(0o600);
    expect(JSON.parse(readFileSync(settingsFile, 'utf8'))).toMatchObject({
      provider: 'gemini',
      apiKey: FAKE_KEY,
    });
    // Saved settings reach AtlasService through a resolver; process.env is never modified.
    expect(process.env.ATLAS_LLM_PROVIDER).toBeUndefined();
    expect(process.env.ATLAS_LLM_API_KEY).toBeUndefined();
  });

  it('gives saved settings priority over env variables and falls back to env on DELETE', async () => {
    process.env.ATLAS_LLM_API_KEY = OTHER_FAKE_KEY;
    process.env.ATLAS_LLM_MODEL = 'claude-env-model';

    await withServer(createApp(), async (baseUrl) => {
      await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'gemini',
        model: 'gemini-test-model',
        apiKey: FAKE_KEY,
      });

      const afterSave = await call(baseUrl, '/api/settings/llm');
      expect(afterSave.json).toMatchObject({ source: 'saved', provider: 'gemini' });
      expect(process.env.ATLAS_LLM_API_KEY).toBe(OTHER_FAKE_KEY);

      const afterDelete = await call(baseUrl, '/api/settings/llm', 'DELETE');
      expect(afterDelete.json).toMatchObject({
        source: 'env',
        provider: 'anthropic',
        model: 'claude-env-model',
        apiKeyMasked: '…b7c9',
      });
      expectNoSecret(afterDelete, FAKE_KEY, OTHER_FAKE_KEY);
    });

    expect(existsSync(settingsFile)).toBe(false);
    expect(process.env.ATLAS_LLM_API_KEY).toBe(OTHER_FAKE_KEY);
    expect(process.env.ATLAS_LLM_PROVIDER).toBeUndefined();
  });

  it('applies saved settings to chat without restarting the server', async () => {
    const geminiRequests: { url: string; authorization: string | null }[] = [];

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        const urlString = String(url);

        if (urlString.startsWith('https://generativelanguage.googleapis.com/')) {
          geminiRequests.push({
            url: urlString,
            authorization: new Headers(init?.headers).get('authorization'),
          });

          return Response.json({
            choices: [
              {
                message: { role: 'assistant', content: 'Respuesta de prueba.' },
                finish_reason: 'stop',
              },
            ],
            usage: { prompt_tokens: 1, completion_tokens: 1 },
          });
        }

        return originalFetch(url, init);
      }),
    );

    await withServer(createApp(), async (baseUrl) => {
      const before = await call(baseUrl, '/api/chat', 'POST', { goal: 'pedido ficticio' });
      expect(before.json.mode).toBe('deterministic');

      await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'gemini',
        model: 'gemini-test-model',
        apiKey: FAKE_KEY,
      });

      const after = await call(baseUrl, '/api/chat', 'POST', { goal: 'pedido ficticio' });
      expect(after.json.mode).toBe('llm');
      expect(after.json.llm_message).toBe('Respuesta de prueba.');
      expectNoSecret(after, FAKE_KEY);
    });

    expect(geminiRequests[0]?.url).toBe(`${GEMINI_BASE_URL.replace(/\/$/, '')}/chat/completions`);
    expect(geminiRequests[0]?.authorization).toBe(`Bearer ${FAKE_KEY}`);
  });

  it('switches chat between env and saved providers without restarting', async () => {
    process.env.ATLAS_LLM_API_KEY = OTHER_FAKE_KEY;
    process.env.ATLAS_LLM_MODEL = 'claude-env-model';
    const hosts: string[] = [];

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
        const parsed = new URL(String(url));

        if (parsed.hostname === 'api.anthropic.com') {
          hosts.push(parsed.hostname);
          return Response.json({
            content: [{ type: 'text', text: 'Desde Anthropic.' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 1, output_tokens: 1 },
          });
        }

        if (parsed.hostname === 'generativelanguage.googleapis.com') {
          hosts.push(parsed.hostname);
          return Response.json({
            choices: [
              { message: { role: 'assistant', content: 'Desde Gemini.' }, finish_reason: 'stop' },
            ],
            usage: { prompt_tokens: 1, completion_tokens: 1 },
          });
        }

        return originalFetch(url, init);
      }),
    );

    await withServer(createApp(), async (baseUrl) => {
      const fromEnv = await call(baseUrl, '/api/chat', 'POST', { goal: 'consulta ficticia' });
      expect(fromEnv.json.llm_message).toBe('Desde Anthropic.');

      await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'gemini',
        model: 'gemini-test-model',
        apiKey: FAKE_KEY,
      });
      const fromSaved = await call(baseUrl, '/api/chat', 'POST', { goal: 'consulta ficticia' });
      expect(fromSaved.json.llm_message).toBe('Desde Gemini.');

      await call(baseUrl, '/api/settings/llm', 'DELETE');
      const backToEnv = await call(baseUrl, '/api/chat', 'POST', { goal: 'consulta ficticia' });
      expect(backToEnv.json.llm_message).toBe('Desde Anthropic.');
      expectNoSecret(backToEnv, FAKE_KEY, OTHER_FAKE_KEY);
    });

    expect(hosts).toEqual([
      'api.anthropic.com',
      'generativelanguage.googleapis.com',
      'api.anthropic.com',
    ]);
    expect(process.env.ATLAS_LLM_API_KEY).toBe(OTHER_FAKE_KEY);
  });

  it('requires a key on first save, keeps it for the same endpoint, and demands it again when the base URL changes', async () => {
    await withServer(createApp(), async (baseUrl) => {
      const missing = await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'openai-compatible',
        model: 'modelo-ficticio',
        baseUrl: 'https://llm.example.test/v1',
      });
      expect(missing.status).toBe(400);
      expect(missing.json.error).toBe('Escribe la clave de API.');

      await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'openai-compatible',
        model: 'modelo-ficticio',
        baseUrl: 'https://llm.example.test/v1',
        apiKey: FAKE_KEY,
      });

      const modelOnly = await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'openai-compatible',
        model: 'otro-modelo-ficticio',
        baseUrl: 'https://llm.example.test/v1/',
      });
      expect(modelOnly.status).toBe(200);
      expect(modelOnly.json).toMatchObject({
        model: 'otro-modelo-ficticio',
        apiKeyMasked: '…a3f2',
      });

      const redirected = await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'openai-compatible',
        model: 'otro-modelo-ficticio',
        baseUrl: 'https://attacker.example.test/v1',
      });
      expect(redirected.status).toBe(400);
      expect(redirected.json.error).toContain('vuelve a escribir la clave');
      expectNoSecret(redirected, FAKE_KEY);
    });

    expect(JSON.parse(readFileSync(settingsFile, 'utf8'))).toMatchObject({
      baseUrl: 'https://llm.example.test/v1/',
      apiKey: FAKE_KEY,
    });
  });

  it('accepts Ollama without a key and fills its default base URL', async () => {
    await withServer(createApp(), async (baseUrl) => {
      const saved = await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'ollama',
        model: 'modelo-local-ficticio',
      });

      expect(saved.status).toBe(200);
      expect(saved.json).toMatchObject({
        source: 'saved',
        configured: true,
        provider: 'ollama',
        baseUrl: 'http://localhost:11434/v1',
        hasApiKey: false,
      });
    });

    expect(process.env.ATLAS_LLM_API_KEY).toBeUndefined();
    expect(
      toAtlasLlmOptions({
        version: 1,
        provider: 'ollama',
        model: 'modelo-local-ficticio',
        baseUrl: 'http://localhost:11434/v1',
        updatedAt: '2026-01-01T00:00:00.000Z',
      }),
    ).toEqual({
      providerId: 'openai-compatible',
      model: 'modelo-local-ficticio',
      apiKey: 'ollama',
      baseUrl: 'http://localhost:11434/v1',
    });
  });

  it.each([
    [{ provider: 'desconocido', model: 'x' }, 'Elige un proveedor válido.'],
    [{ provider: 'gemini', model: '  ', apiKey: FAKE_KEY }, 'Escribe el nombre del modelo.'],
    [
      {
        provider: 'openai-compatible',
        model: 'x',
        baseUrl: 'ftp://llm.example.test',
        apiKey: FAKE_KEY,
      },
      'La URL base debe empezar',
    ],
    [
      {
        provider: 'openai-compatible',
        model: 'x',
        baseUrl: 'https://user:pass@llm.example.test/v1',
        apiKey: FAKE_KEY,
      },
      'La URL base debe empezar',
    ],
    [{ provider: 'gemini', model: 'x', apiKey: `${FAKE_KEY} con espacio` }, 'formato no válido'],
  ])('rejects invalid input with a readable message (%#)', async (body, expected) => {
    await withServer(createApp(), async (baseUrl) => {
      const result = await call(baseUrl, '/api/settings/llm', 'PUT', body);

      expect(result.status).toBe(400);
      expect(String(result.json.error)).toContain(expected);
      expectNoSecret(result, FAKE_KEY);
    });

    expect(existsSync(settingsFile)).toBe(false);
  });

  it('returns a generic message when saving fails, without leaking the key', async () => {
    mkdirSync(settingsFile, { recursive: true });

    await withServer(createApp(), async (baseUrl) => {
      const result = await call(baseUrl, '/api/settings/llm', 'PUT', {
        provider: 'gemini',
        model: 'gemini-test-model',
        apiKey: FAKE_KEY,
      });

      expect(result.status).toBe(500);
      expect(result.json).toEqual({ error: 'Ocurrió un error inesperado con la configuración.' });
    });
  });

  describe('POST /api/settings/llm/test', () => {
    it.each([
      [400, 'bad_request', '(400)'],
      [401, 'unauthorized', 'La clave no es válida'],
      [403, 'forbidden', '(403)'],
      [404, 'not_found', '(404)'],
      [429, 'rate_limited', '(429)'],
      [503, 'unavailable', '(503)'],
      [418, 'http_error', '(418)'],
    ])('maps HTTP %i to a readable error without exposing the key', async (status, code, text) => {
      // The provider body echoes the key to prove it is never forwarded.
      const fetchImpl = vi.fn(async () =>
        Response.json({ error: { message: `bad key ${FAKE_KEY}` } }, { status }),
      );

      await withServer(createApp({ fetchImpl }), async (baseUrl) => {
        const result = await call(baseUrl, '/api/settings/llm/test', 'POST', {
          provider: 'gemini',
          model: 'gemini-test-model',
          apiKey: FAKE_KEY,
        });

        expect(result.status).toBe(200);
        expect(result.json).toMatchObject({ ok: false, code, status });
        expect(String(result.json.message)).toContain(text);
        expectNoSecret(result, FAKE_KEY);
      });
    });

    it('reports success with latency and never contacts the provider without being asked', async () => {
      const fetchImpl = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
        Response.json({ choices: [] }),
      );

      await withServer(createApp({ fetchImpl }), async (baseUrl) => {
        expect(fetchImpl).not.toHaveBeenCalled();

        const result = await call(baseUrl, '/api/settings/llm/test', 'POST', {
          provider: 'anthropic',
          model: 'claude-test-model',
          apiKey: FAKE_KEY,
        });

        expect(result.json).toMatchObject({ ok: true, code: 'ok' });
        expect(String(result.json.message)).toMatch(/^Conexión correcta \(\d+ ms\)\.$/);
        expectNoSecret(result, FAKE_KEY);
      });

      expect(String(fetchImpl.mock.calls[0]?.[0])).toBe('https://api.anthropic.com/v1/messages');
      expect(new Headers(fetchImpl.mock.calls[0]?.[1]?.headers).get('x-api-key')).toBe(FAKE_KEY);
    });

    it('hides network error details that could contain the key', async () => {
      const fetchImpl = vi.fn(async () => {
        throw new Error(`connect failed for ${FAKE_KEY}`);
      });

      await withServer(createApp({ fetchImpl }), async (baseUrl) => {
        const result = await call(baseUrl, '/api/settings/llm/test', 'POST', {
          provider: 'ollama',
          model: 'modelo-local-ficticio',
          apiKey: FAKE_KEY,
        });

        expect(result.json).toMatchObject({ ok: false, code: 'network' });
        expectNoSecret(result, FAKE_KEY);
      });
    });

    it('tests the saved configuration when no proposal is sent', async () => {
      const fetchImpl = vi.fn(async (_url: string | URL | Request, _init?: RequestInit) =>
        Response.json({ choices: [] }),
      );

      await withServer(createApp({ fetchImpl }), async (baseUrl) => {
        const empty = await call(baseUrl, '/api/settings/llm/test', 'POST', {});
        expect(empty.status).toBe(400);
        expect(empty.json).toMatchObject({ ok: false, code: 'invalid' });

        await call(baseUrl, '/api/settings/llm', 'PUT', {
          provider: 'gemini',
          model: 'gemini-test-model',
          apiKey: FAKE_KEY,
        });

        const result = await call(baseUrl, '/api/settings/llm/test', 'POST', {});
        expect(result.json).toMatchObject({ ok: true });
        expectNoSecret(result, FAKE_KEY);
      });

      expect(new Headers(fetchImpl.mock.calls[0]?.[1]?.headers).get('authorization')).toBe(
        `Bearer ${FAKE_KEY}`,
      );
    });

    it('does not send the saved key to a different base URL', async () => {
      const fetchImpl = vi.fn(async () => Response.json({ choices: [] }));

      await withServer(createApp({ fetchImpl }), async (baseUrl) => {
        await call(baseUrl, '/api/settings/llm', 'PUT', {
          provider: 'gemini',
          model: 'gemini-test-model',
          apiKey: FAKE_KEY,
        });

        const result = await call(baseUrl, '/api/settings/llm/test', 'POST', {
          provider: 'openai-compatible',
          model: 'gemini-test-model',
          baseUrl: 'https://attacker.example.test/v1',
        });

        expect(result.status).toBe(400);
        expect(result.json).toMatchObject({ ok: false, code: 'invalid' });
        expectNoSecret(result, FAKE_KEY);
      });

      expect(fetchImpl).not.toHaveBeenCalled();
    });
  });
});
