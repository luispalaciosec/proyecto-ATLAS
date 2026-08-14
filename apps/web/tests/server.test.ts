import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { createServer, type Server } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import type { Express } from 'express';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveWebHost } from '../src/config.js';
import * as extractTextModule from '../src/lib/knowledge-upload/extract-text.js';
import { EMPTY_EXTRACTION_MESSAGE } from '../src/lib/knowledge-upload/constants.js';
import { createWebServer } from '../src/server.js';
import { SessionStore } from '../src/session-store.js';
import { readFixture } from './fixtures/fixture-utils.js';
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

  it('returns empty history for a workspace without conversation', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/history`);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        workspace: 'default',
        messages: [],
        canCorrect: false,
      });
    });
  });

  it('returns deterministic chat history after POST /api/chat', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const chat = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ goal: 'procesar pedido cliente' }),
      });
      expect(chat.status).toBe(200);

      const history = await fetch(`${baseUrl}/api/history`);
      expect(history.status).toBe(200);
      const payload = (await history.json()) as {
        messages: Array<{ role: string; content: string }>;
      };

      expect(payload.messages.length).toBeGreaterThanOrEqual(2);
      expect(payload.messages[0]?.role).toBe('user');
      expect(payload.messages[0]?.content).toContain('procesar pedido');
      expect(payload.messages.some((message) => message.role === 'assistant')).toBe(true);
    });
  });

  it('returns controlled error when history cannot be loaded', async () => {
    const brokenStore = {
      getOrCreate: vi.fn(async () => {
        throw new Error('session unavailable');
      }),
    } as unknown as SessionStore;

    const app = createWebServer(brokenStore);

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/history`);
      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toMatchObject({
        error: 'session unavailable',
      });
    });
  });

  it('returns readable brand chat errors instead of [object Object]', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    loadOrCreateBrandProfile(geeksPaths, 'Geeks');

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          workspace: 'geeks',
          goal: 'Hola puedo saber mi inventario?',
        }),
      });

      expect(response.status).toBe(500);
      const payload = (await response.json()) as { error: string };
      expect(payload.error).not.toBe('[object Object]');
      expect(payload.error).toContain('CORE_INVALID_IDENTIFIER');
    });
  });

  it('returns LLM chat history after POST /api/chat', async () => {
    process.env.ATLAS_LLM_API_KEY = 'test-key';
    process.env.ATLAS_LLM_MODEL = 'claude-test-model';

    stubLlmFetch(async () =>
      new Response(
        JSON.stringify({
          content: [{ type: 'text', text: 'Hola desde ATLAS.' }],
          stop_reason: 'end_turn',
          usage: { input_tokens: 1, output_tokens: 1 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const chat = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ goal: 'saludo inicial' }),
      });
      expect(chat.status).toBe(200);

      const history = await fetch(`${baseUrl}/api/history`);
      expect(history.status).toBe(200);
      const payload = (await history.json()) as {
        messages: Array<{ role: string; content: string }>;
        canCorrect: boolean;
      };

      expect(payload.messages.some((message) => message.role === 'user')).toBe(true);
      expect(payload.messages.some((message) => message.content.includes('Hola desde ATLAS'))).toBe(
        true,
      );
      expect(payload.canCorrect).toBe(true);
    });
  });

  it('returns empty knowledge search results for default workspace', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/knowledge/search?query=sin-resultados`);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        workspace: 'default',
        query: 'sin-resultados',
        total: 0,
        records: [],
      });
    });
  });

  it('returns no knowledge search results when query is empty', async () => {
    mkdirSync(join(testRoot, '.atlas'), { recursive: true });
    writeFileSync(
      join(testRoot, '.atlas', 'memory.json'),
      JSON.stringify(
        {
          version: 1,
          records: [
            {
              id: 'record.default.note',
              type: 'document',
              content: { text: 'Política de devolución: 30 días.' },
              metadata: { namespaceId: 'cli.default', source: 'seed' },
              timestamp: '2026-08-01T00:00:00.000Z',
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
      const response = await fetch(`${baseUrl}/api/knowledge/search?query=`);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        workspace: 'default',
        query: '',
        total: 0,
        records: [],
      });
    });
  });

  it('filters knowledge search results instead of returning every document', async () => {
    mkdirSync(join(testRoot, '.atlas'), { recursive: true });
    writeFileSync(
      join(testRoot, '.atlas', 'memory.json'),
      JSON.stringify(
        {
          version: 1,
          records: [
            {
              id: 'record.doc.contexto',
              type: 'document',
              content: {
                text: 'Contexto institucional del banco. Productos crediticios y operaciones generales.',
              },
              metadata: {
                namespaceId: 'cli.default',
                source: 'upload',
                fileName: 'Contexto_Banco_Amazonas.md',
              },
              timestamp: '2026-08-01T00:00:00.000Z',
            },
            {
              id: 'record.doc.politica',
              type: 'document',
              content: {
                text: 'Los ejecutivos comerciales pueden aplicar descuentos de hasta el 10%. Un descuento del 15% requiere aprobación escrita del Gerente Comercial.',
              },
              metadata: {
                namespaceId: 'cli.default',
                source: 'upload',
                fileName: 'Politica_Comercial_Banco_Amazonas.md',
              },
              timestamp: '2026-08-02T00:00:00.000Z',
            },
            {
              id: 'record.doc.creditos',
              type: 'document',
              content: { text: 'Líneas de crédito corporativo y garantías hipotecarias.' },
              metadata: {
                namespaceId: 'cli.default',
                source: 'upload',
                fileName: 'Creditos_Corporativos.md',
              },
              timestamp: '2026-08-03T00:00:00.000Z',
            },
            {
              id: 'record.doc.onboarding',
              type: 'document',
              content: { text: 'Proceso de vinculación comercial y documentación KYC.' },
              metadata: {
                namespaceId: 'cli.default',
                source: 'upload',
                fileName: 'Onboarding_Comercial.md',
              },
              timestamp: '2026-08-04T00:00:00.000Z',
            },
            {
              id: 'record.doc.tarifario',
              type: 'document',
              content: { text: 'Tarifario de servicios bancarios y comisiones por producto.' },
              metadata: {
                namespaceId: 'cli.default',
                source: 'upload',
                fileName: 'Tarifario_Servicios.md',
              },
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
      const matching = await fetch(`${baseUrl}/api/knowledge/search?query=descuento`);
      expect(matching.status).toBe(200);
      const matchingPayload = (await matching.json()) as {
        total: number;
        records: Array<{ snippet: string }>;
      };

      expect(matchingPayload.total).toBe(1);
      expect(matchingPayload.records[0]?.snippet).toContain('Gerente Comercial');

      const missing = await fetch(`${baseUrl}/api/knowledge/search?query=terminoinexistente999`);
      expect(missing.status).toBe(200);
      const missingPayload = (await missing.json()) as { total: number; records: unknown[] };

      expect(missingPayload.total).toBe(0);
      expect(missingPayload.records).toEqual([]);
    });
  });

  it('returns knowledge search results from default memory file', async () => {
    mkdirSync(join(testRoot, '.atlas'), { recursive: true });
    writeFileSync(
      join(testRoot, '.atlas', 'memory.json'),
      JSON.stringify(
        {
          version: 1,
          records: [
            {
              id: 'record.default.note',
              type: 'CliMemory',
              content: { text: 'Política de devolución: 30 días.' },
              metadata: { namespaceId: 'cli.default', source: 'seed' },
              timestamp: '2026-08-01T00:00:00.000Z',
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
      const response = await fetch(`${baseUrl}/api/knowledge/search?query=devolución`);
      expect(response.status).toBe(200);
      const payload = (await response.json()) as {
        workspace: string;
        total: number;
        records: Array<{ title: string; snippet: string }>;
      };

      expect(payload.workspace).toBe('default');
      expect(payload.total).toBe(1);
      expect(payload.records[0]?.snippet).toContain('devolución');
    });
  });

  it('supports POST /api/knowledge/search with workspace body', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    loadOrCreateBrandProfile(geeksPaths, 'Geeks');
    writeFileSync(
      geeksPaths.memoryFilePath,
      JSON.stringify(
        {
          version: 1,
          records: [
            {
              id: 'record.geeks.note',
              type: 'CliMemory',
              content: { text: 'Cliente VIP Ana García en Geeks.' },
              metadata: { namespaceId: 'cli.default', source: 'seed' },
              timestamp: '2026-08-02T00:00:00.000Z',
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
      const response = await fetch(`${baseUrl}/api/knowledge/search`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workspace: 'geeks', query: 'Ana García' }),
      });

      expect(response.status).toBe(200);
      const payload = (await response.json()) as {
        workspace: string;
        total: number;
        records: Array<{ contextLabel: string }>;
      };

      expect(payload.workspace).toBe('geeks');
      expect(payload.total).toBe(1);
      expect(payload.records[0]?.contextLabel).toBe('Geeks');
    });
  });

  it('isolates knowledge search between brand workspaces', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    const revitalPaths = resolveWorkspacePaths('revital', workspacesRoot);
    loadOrCreateBrandProfile(geeksPaths, 'Geeks');
    loadOrCreateBrandProfile(revitalPaths, 'Revital');

    writeFileSync(
      geeksPaths.memoryFilePath,
      JSON.stringify(
        {
          version: 1,
          records: [
            {
              id: 'record.geeks.secret',
              type: 'CliMemory',
              content: { text: 'geeks-only-secret' },
              metadata: { namespaceId: 'cli.default', source: 'seed' },
              timestamp: '2026-08-03T00:00:00.000Z',
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
      const geeksSearch = await fetch(
        `${baseUrl}/api/knowledge/search?workspace=geeks&query=geeks-only-secret`,
      );
      expect(geeksSearch.status).toBe(200);
      const geeksPayload = (await geeksSearch.json()) as { total: number };
      expect(geeksPayload.total).toBe(1);

      const revitalSearch = await fetch(
        `${baseUrl}/api/knowledge/search?workspace=revital&query=geeks-only-secret`,
      );
      expect(revitalSearch.status).toBe(200);
      const revitalPayload = (await revitalSearch.json()) as { total: number };
      expect(revitalPayload.total).toBe(0);
    });
  });

  it('returns controlled error when knowledge search fails', async () => {
    const brokenStore = {
      getOrCreate: vi.fn(async () => {
        throw new Error('knowledge unavailable');
      }),
      searchKnowledge: vi.fn(async () => {
        throw new Error('knowledge unavailable');
      }),
    } as unknown as SessionStore;

    const app = createWebServer(brokenStore);

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/knowledge/search?query=test`);
      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toMatchObject({
        error: 'knowledge unavailable',
      });
    });
  });

  it('uploads txt knowledge and makes it searchable', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob([Uint8Array.from(readFixture('sample.txt'))], { type: 'text/plain' }),
        'sample.txt',
      );

      const upload = await fetch(`${baseUrl}/api/knowledge/upload`, {
        method: 'POST',
        body: formData,
      });

      expect(upload.status).toBe(200);
      const uploadPayload = (await upload.json()) as {
        fileName: string;
        chunks: number;
        recordIds: string[];
      };
      expect(uploadPayload.fileName).toBe('sample.txt');
      expect(uploadPayload.chunks).toBeGreaterThan(0);
      expect(uploadPayload.recordIds.length).toBe(uploadPayload.chunks);

      const search = await fetch(`${baseUrl}/api/knowledge/search?query=zeta-quantum-7742`);
      expect(search.status).toBe(200);
      const searchPayload = (await search.json()) as { total: number };
      expect(searchPayload.total).toBeGreaterThan(0);
    });
  });

  it('rejects unsupported upload formats with 400', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const formData = new FormData();
      formData.append(
        'file',
        new Blob(['contenido'], { type: 'application/octet-stream' }),
        'datos.xlsx',
      );

      const response = await fetch(`${baseUrl}/api/knowledge/upload`, {
        method: 'POST',
        body: formData,
      });

      expect(response.status).toBe(400);
      const payload = (await response.json()) as { error: string };
      expect(payload.error).toContain('.xlsx');
      expect(payload.error).not.toBe('[object Object]');
    });
  });

  it('returns 422 when uploaded file has no extractable text', async () => {
    const extractSpy = vi.spyOn(extractTextModule, 'extractTextFromBuffer').mockResolvedValue('');

    try {
      const app = createWebServer();

      await withServer(app, async (baseUrl) => {
        const formData = new FormData();
        formData.append(
          'file',
          new Blob(['%PDF'], { type: 'application/pdf' }),
          'escaneado.pdf',
        );

        const response = await fetch(`${baseUrl}/api/knowledge/upload`, {
          method: 'POST',
          body: formData,
        });

        expect(response.status).toBe(422);
        const payload = (await response.json()) as { error: string };
        expect(payload.error).toBe(EMPTY_EXTRACTION_MESSAGE);
      });
    } finally {
      extractSpy.mockRestore();
    }
  });

  it('aliases GET /api/memory/search to knowledge search', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/memory/search?query=alias-test`);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        workspace: 'default',
        query: 'alias-test',
        total: 0,
      });
    });
  });

  it('returns empty activity for a workspace without events', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/activity`);
      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toMatchObject({
        workspace: 'default',
        items: [],
      });
    });
  });

  it('records conversation activity after POST /api/chat', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const chat = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ goal: 'procesar pedido cliente' }),
      });
      expect(chat.status).toBe(200);

      const activity = await fetch(`${baseUrl}/api/activity`);
      expect(activity.status).toBe(200);
      const payload = (await activity.json()) as {
        items: Array<{ type: string; quote?: string }>;
      };

      expect(payload.items.length).toBeGreaterThan(0);
      expect(payload.items[0]?.type).toBe('conversation');
      expect(payload.items[0]?.quote).toContain('procesar pedido');
    });
  });

  it('records knowledge and correction activity in workspace scope', async () => {
    process.env.ATLAS_LLM_API_KEY = 'test-key';
    process.env.ATLAS_LLM_MODEL = 'claude-test-model';

    stubLlmFetch(async () =>
      new Response(
        JSON.stringify({
          content: [{ type: 'text', text: 'Respuesta previa.' }],
          stop_reason: 'end_turn',
          usage: { input_tokens: 1, output_tokens: 1 },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ goal: 'consulta previa' }),
      });

      await fetch(`${baseUrl}/api/knowledge/search?query=clientes`);

      await fetch(`${baseUrl}/api/correct`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ correction: 'Debería ser más breve' }),
      });

      const allActivity = await fetch(`${baseUrl}/api/activity`);
      const allPayload = (await allActivity.json()) as { items: Array<{ type: string }> };
      const types = allPayload.items.map((item) => item.type);

      expect(types).toContain('conversation');
      expect(types).toContain('knowledge');
      expect(types).toContain('correction');

      const knowledgeOnly = await fetch(`${baseUrl}/api/activity?type=knowledge`);
      const knowledgePayload = (await knowledgeOnly.json()) as { items: Array<{ type: string }> };
      expect(knowledgePayload.items.every((item) => item.type === 'knowledge')).toBe(true);
    });
  });

  it('isolates activity between brand workspaces', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    loadOrCreateBrandProfile(geeksPaths, 'Geeks');

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workspace: 'geeks', goal: 'consulta geeks' }),
      });

      const geeksActivity = await fetch(`${baseUrl}/api/activity?workspace=geeks`);
      const geeksPayload = (await geeksActivity.json()) as { items: Array<{ quote?: string }> };
      expect(geeksPayload.items.length).toBe(1);

      const defaultActivity = await fetch(`${baseUrl}/api/activity`);
      const defaultPayload = (await defaultActivity.json()) as { items: unknown[] };
      expect(defaultPayload.items).toHaveLength(0);
    });
  });

  it('returns controlled error when activity cannot be loaded', async () => {
    const brokenStore = {
      getActivity: vi.fn(() => {
        throw new Error('activity unavailable');
      }),
    } as unknown as SessionStore;

    const app = createWebServer(brokenStore);

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/activity`);
      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toMatchObject({
        error: 'activity unavailable',
      });
    });
  });

  it('lists General and existing brands with product payload', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    loadOrCreateBrandProfile(geeksPaths, 'Geeks');

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/brands?activeWorkspace=geeks`);
      expect(response.status).toBe(200);

      const payload = (await response.json()) as {
        activeBrandId: string;
        brands: Array<{
          id: string;
          name: string;
          isGeneral: boolean;
          isActive: boolean;
          description?: string;
        }>;
      };

      expect(payload.activeBrandId).toBe('geeks');
      expect(payload.brands[0]).toMatchObject({
        id: 'default',
        name: 'General',
        isGeneral: true,
        isActive: false,
      });
      expect(payload.brands.some((brand) => brand.id === 'geeks' && brand.isActive)).toBe(true);
      expect(payload.brands.find((brand) => brand.id === 'geeks')?.name).toBe('Geeks');
    });
  });

  it('includes purpose and knowledge count when profile and memory exist', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    const profile = loadOrCreateBrandProfile(geeksPaths, 'Geeks');
    writeFileSync(
      geeksPaths.profilePath,
      `${JSON.stringify({ ...profile, purpose: 'Agencia de marketing y publicidad' }, null, 2)}\n`,
      'utf8',
    );
    writeFileSync(
      geeksPaths.memoryFilePath,
      JSON.stringify(
        {
          version: 1,
          records: [
            {
              id: 'note.1',
              type: 'CliMemory',
              content: { text: 'Cliente VIP Ana García' },
              metadata: { namespaceId: 'cli.default', source: 'seed' },
              timestamp: '2026-08-09T10:00:00.000Z',
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
      const response = await fetch(`${baseUrl}/api/brands?activeWorkspace=default`);
      const payload = (await response.json()) as {
        brands: Array<{ id: string; description?: string; knowledgeCount?: number }>;
      };
      const geeks = payload.brands.find((brand) => brand.id === 'geeks');

      expect(geeks?.description).toBe('Agencia de marketing y publicidad');
      expect(geeks?.knowledgeCount).toBe(1);
    });
  });

  it('creates a brand with canonical slug and optional purpose', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/brands`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: 'Banco Machala',
          purpose: 'Banca regional',
          activeWorkspace: 'default',
        }),
      });

      expect(response.status).toBe(201);

      const payload = (await response.json()) as {
        brand: {
          id: string;
          name: string;
          description?: string;
          isActive: boolean;
        };
      };

      expect(payload.brand.id).toBe('banco-machala');
      expect(payload.brand.name).toBe('Banco Machala');
      expect(payload.brand.description).toBe('Banca regional');
      expect(payload.brand.isActive).toBe(false);

      const listResponse = await fetch(`${baseUrl}/api/brands`);
      const listPayload = (await listResponse.json()) as { brands: Array<{ id: string }> };
      expect(listPayload.brands.some((brand) => brand.id === 'banco-machala')).toBe(true);
    });
  });

  it('rejects empty brand names with product error', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/brands`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: '   ' }),
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        error: 'El nombre de la marca es obligatorio.',
      });
    });
  });

  it('rejects invalid brand names with product error', async () => {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/brands`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: '!!!' }),
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        error: 'Revisa el nombre e inténtalo nuevamente.',
      });
    });
  });

  it('rejects duplicate brand names including canonical collisions', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    loadOrCreateBrandProfile(geeksPaths, 'Geeks');

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const duplicateResponse = await fetch(`${baseUrl}/api/brands`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'Geeks' }),
      });

      expect(duplicateResponse.status).toBe(409);
      await expect(duplicateResponse.json()).resolves.toMatchObject({
        error: 'Ya existe una marca con ese nombre.',
      });

      const collisionResponse = await fetch(`${baseUrl}/api/brands`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: 'GEEKS' }),
      });

      expect(collisionResponse.status).toBe(409);
    });
  });

  it('includes recent activity on brand listing when session activity exists', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    loadOrCreateBrandProfile(geeksPaths, 'Geeks');

    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ workspace: 'geeks', goal: 'consulta geeks' }),
      });

      const response = await fetch(`${baseUrl}/api/brands?activeWorkspace=geeks`);
      const payload = (await response.json()) as {
        brands: Array<{ id: string; recentActivity?: Array<{ title: string }> }>;
      };
      const geeks = payload.brands.find((brand) => brand.id === 'geeks');

      expect(geeks?.recentActivity?.length).toBeGreaterThan(0);
      expect(geeks?.recentActivity?.[0]?.title.length).toBeGreaterThan(0);
    });
  });

  it('isolates brand listings by workspace knowledge without mixing counts', async () => {
    const workspacesRoot = join(testRoot, '.atlas', 'workspaces');
    const geeksPaths = resolveWorkspacePaths('geeks', workspacesRoot);
    const revitalPaths = resolveWorkspacePaths('revital', workspacesRoot);
    loadOrCreateBrandProfile(geeksPaths, 'Geeks');
    loadOrCreateBrandProfile(revitalPaths, 'Revital');

    writeFileSync(
      geeksPaths.memoryFilePath,
      JSON.stringify(
        {
          version: 1,
          records: [
            {
              id: 'g1',
              type: 'CliMemory',
              content: { text: 'geeks-only' },
              metadata: { namespaceId: 'cli.default', source: 'seed' },
              timestamp: '2026-08-09T10:00:00.000Z',
            },
          ],
        },
        null,
        2,
      ),
      'utf8',
    );

    writeFileSync(
      revitalPaths.memoryFilePath,
      JSON.stringify(
        {
          version: 1,
          records: [
            {
              id: 'r1',
              type: 'CliMemory',
              content: { text: 'revital-only' },
              metadata: { namespaceId: 'cli.default', source: 'seed' },
              timestamp: '2026-08-09T10:00:00.000Z',
            },
            {
              id: 'r2',
              type: 'CliMemory',
              content: { text: 'revital-two' },
              metadata: { namespaceId: 'cli.default', source: 'seed' },
              timestamp: '2026-08-09T10:01:00.000Z',
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
      const response = await fetch(`${baseUrl}/api/brands`);
      const payload = (await response.json()) as {
        brands: Array<{ id: string; knowledgeCount?: number }>;
      };

      expect(payload.brands.find((brand) => brand.id === 'geeks')?.knowledgeCount).toBe(1);
      expect(payload.brands.find((brand) => brand.id === 'revital')?.knowledgeCount).toBe(2);
      expect(payload.brands.find((brand) => brand.id === 'default')?.knowledgeCount).toBe(0);
    });
  });

  it('returns controlled error when brands cannot be loaded', async () => {
    const brokenStore = {
      listBrands: vi.fn(async () => {
        throw new Error('brands unavailable');
      }),
    } as unknown as SessionStore;

    const app = createWebServer(brokenStore);

    await withServer(app, async (baseUrl) => {
      const response = await fetch(`${baseUrl}/api/brands`);
      expect(response.status).toBe(500);
      await expect(response.json()).resolves.toMatchObject({
        error: 'brands unavailable',
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
