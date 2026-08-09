import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Express } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveWebHost } from '../src/config.js';
import { createWebServer } from '../src/server.js';
import {
  loadOrCreateBrandProfile,
  resolveWorkspacePaths,
} from '@atlas/cli';

const originalFetch = globalThis.fetch;

type ChatApiPayload = {
  mode?: string;
  success?: boolean;
  llm_message?: string;
};

function stubLlmFetch(
  impl: (url: string, init?: RequestInit) => Response | Promise<Response>,
): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const urlString = String(url);

      if (urlString.includes('anthropic.com')) {
        return impl(urlString, init);
      }

      return originalFetch(url, init);
    }),
  );
}

async function withServer<T>(
  app: Express,
  run: (baseUrl: string) => Promise<T>,
): Promise<T> {
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
    await new Promise<void>((resolve, reject) => {
      if (server === undefined) {
        resolve();
        return;
      }

      server.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

describe('createWebServer', () => {
  const savedCwd = process.cwd();
  const savedApiKey = process.env.ATLAS_LLM_API_KEY;
  const savedModel = process.env.ATLAS_LLM_MODEL;
  const savedMemoryFile = process.env.ATLAS_MEMORY_FILE;
  let testRoot = '';

  beforeEach(() => {
    testRoot = mkdtempSync(join(tmpdir(), 'atlas-web-server-'));
    process.chdir(testRoot);
    mkdirSync(join(testRoot, '.atlas', 'workspaces'), { recursive: true });
    delete process.env.ATLAS_LLM_API_KEY;
    delete process.env.ATLAS_LLM_MODEL;
    delete process.env.ATLAS_MEMORY_FILE;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    process.chdir(savedCwd);
    rmSync(testRoot, { recursive: true, force: true });

    if (savedApiKey !== undefined) {
      process.env.ATLAS_LLM_API_KEY = savedApiKey;
    } else {
      delete process.env.ATLAS_LLM_API_KEY;
    }

    if (savedModel !== undefined) {
      process.env.ATLAS_LLM_MODEL = savedModel;
    } else {
      delete process.env.ATLAS_LLM_MODEL;
    }

    if (savedMemoryFile !== undefined) {
      process.env.ATLAS_MEMORY_FILE = savedMemoryFile;
    } else {
      delete process.env.ATLAS_MEMORY_FILE;
    }
  });

  it('returns ok from GET /api/health', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/health`);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ ok: true });
    });
  });

  it('lists default and existing brand workspaces', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/workspaces`);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        workspaces: ['default', 'geeks'],
      });
    });
  });

  it('uses deterministic mode when LLM is not configured', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ goal: 'procesar pedido cliente' }),
      });

      expect(response.status).toBe(200);
      const payload = (await response.json()) as ChatApiPayload;
      expect(payload.mode).toBe('deterministic');
      expect(payload.success).toBe(true);
    });
  });

  it('uses LLM mode when configured with fetch stubbed', async () => {
    process.env.ATLAS_LLM_API_KEY = 'test-key';
    process.env.ATLAS_LLM_MODEL = 'claude-test-model';

    stubLlmFetch(async () =>
      new Response(
          JSON.stringify({
            content: [{ type: 'text', text: 'Draft campaign copy.' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 1, output_tokens: 1 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        ),
    );

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ goal: 'draft campaign' }),
      });

      expect(response.status).toBe(200);
      const payload = (await response.json()) as ChatApiPayload;
      expect(payload.mode).toBe('llm');
      expect(payload.llm_message).toBe('Draft campaign copy.');
    });
  });

  it('isolates brand memory across workspaces over HTTP', async () => {
    process.env.ATLAS_LLM_API_KEY = 'test-key';
    process.env.ATLAS_LLM_MODEL = 'claude-test-model';

    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    const revitalPaths = resolveWorkspacePaths('revital', workspacesRoot);
    loadOrCreateBrandProfile(geeksPaths, 'Geeks');
    loadOrCreateBrandProfile(revitalPaths, 'Revital');

    let fetchCalls = 0;
    stubLlmFetch(async (_url, init) => {
        fetchCalls += 1;
        const body = JSON.parse(String(init?.body)) as { messages?: Array<{ role: string; content: unknown }> };
        const lastUserMessage = [...(body.messages ?? [])]
          .reverse()
          .find((message) => message.role === 'user');
        const goal = typeof lastUserMessage?.content === 'string' ? lastUserMessage.content : '';

        if (goal.includes('remember geeks-only-secret')) {
          return new Response(
            JSON.stringify({
              content: [
                {
                  type: 'tool_use',
                  id: 'toolu_store',
                  name: 'memory_store',
                  input: { content: 'geeks-only-secret', recordType: 'Note' },
                },
              ],
              stop_reason: 'tool_use',
              usage: { input_tokens: 1, output_tokens: 1 },
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          );
        }

        if (goal.includes('search for geeks-only-secret')) {
          return new Response(
            JSON.stringify({
              content: [
                {
                  type: 'tool_use',
                  id: 'toolu_search',
                  name: 'memory_search',
                  input: { query: 'geeks-only-secret' },
                },
              ],
              stop_reason: 'tool_use',
              usage: { input_tokens: 1, output_tokens: 1 },
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          );
        }

        return new Response(
          JSON.stringify({
            content: [{ type: 'text', text: 'Acknowledged.' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 1, output_tokens: 1 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
    });

    writeFileSync(
      geeksPaths.memoryFilePath,
      JSON.stringify(
        {
          records: [
            {
              id: 'record.geeks.note',
              namespaceId: 'cli.default',
              recordType: 'Note',
              content: { text: 'geeks-only-secret' },
              metadata: { source: 'seed' },
              timestamp: '2026-08-05T00:00:00.000Z',
            },
          ],
        },
        null,
        2,
      ),
      'utf8',
    );

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const geeksSearch = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workspace: 'geeks',
          goal: 'search for geeks-only-secret',
        }),
      });
      expect(geeksSearch.status).toBe(200);
      const geeksPayload = (await geeksSearch.json()) as ChatApiPayload;
      expect(geeksPayload.mode).toBe('llm');

      const revitalSearch = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workspace: 'revital',
          goal: 'search for geeks-only-secret',
        }),
      });
      expect(revitalSearch.status).toBe(200);
      const revitalPayload = (await revitalSearch.json()) as ChatApiPayload;
      expect(revitalPayload.mode).toBe('llm');

      const geeksMemory = JSON.parse(readFileSync(geeksPaths.memoryFilePath, 'utf8')) as {
        records: Array<{ content?: { text?: string } }>;
      };
      const revitalMemory = existsSync(revitalPaths.memoryFilePath)
        ? (JSON.parse(readFileSync(revitalPaths.memoryFilePath, 'utf8')) as {
            records: Array<{ content?: { text?: string } }>;
          })
        : { records: [] };

      expect(
        geeksMemory.records.some((record) => record.content?.text === 'geeks-only-secret'),
      ).toBe(true);
      expect(
        revitalMemory.records.some((record) => record.content?.text === 'geeks-only-secret'),
      ).toBe(false);
    });

    expect(fetchCalls).toBeGreaterThan(0);
  });

  it('returns no_prior_turn from POST /api/correct without a prior LLM turn', async () => {
    process.env.ATLAS_LLM_API_KEY = 'test-key';
    process.env.ATLAS_LLM_MODEL = 'claude-test-model';

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/correct`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ correction: 'too early' }),
      });

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        status: 'no_prior_turn',
      });
    });
  });
});

describe('resolveWebHost', () => {
  const savedHost = process.env.ATLAS_WEB_HOST;

  afterEach(() => {
    if (savedHost !== undefined) {
      process.env.ATLAS_WEB_HOST = savedHost;
    } else {
      delete process.env.ATLAS_WEB_HOST;
    }
  });

  it('defaults to 127.0.0.1 when ATLAS_WEB_HOST is unset', () => {
    delete process.env.ATLAS_WEB_HOST;
    expect(resolveWebHost()).toBe('127.0.0.1');
  });
});
