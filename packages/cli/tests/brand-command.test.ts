import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createContainer } from '../src/application/container.js';
import type { ChatLineReader } from '../src/chat/chat-repl.js';
import { runChatRepl } from '../src/chat/chat-repl.js';
import { AtlasService } from '../src/services/atlas-service.js';
import {
  loadOrCreateBrandProfile,
  renderProfileAsContext,
  resolveWorkspacePaths,
} from '../src/workspace/brand-profile.js';
import {
  combineBrandContextPrompt,
  loadRecentFeedbackContext,
} from '../src/workspace/feedback-context.js';

class ScriptLineReader implements ChatLineReader {
  readonly #lines: string[];
  #index = 0;

  constructor(lines: readonly string[]) {
    this.#lines = [...lines];
  }

  readLine(_prompt: string): Promise<string | null> {
    if (this.#index >= this.#lines.length) {
      return Promise.resolve(null);
    }

    const line = this.#lines[this.#index];
    this.#index += 1;
    return Promise.resolve(line ?? null);
  }

  async close(): Promise<void> {
    return undefined;
  }
}

describe('AtlasService.createBrandClient', () => {
  it('isolates memory physically between brands', async () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-brand-isolation-'));
    const service = new AtlasService();
    const geeksPaths = resolveWorkspacePaths('geeks', join(root, 'workspaces'));
    const revitalPaths = resolveWorkspacePaths('revital', join(root, 'workspaces'));

    loadOrCreateBrandProfile(geeksPaths, 'Geeks');

    const geeksClient = service.createBrandClient(
      geeksPaths,
      renderProfileAsContext(loadOrCreateBrandProfile(geeksPaths, 'Geeks')),
    );
    await geeksClient.memory.storeContent({ content: 'geeks-only-secret' });

    const revitalClient = service.createBrandClient(
      revitalPaths,
      renderProfileAsContext(loadOrCreateBrandProfile(revitalPaths, 'Revital')),
    );
    const crossSearch = await revitalClient.memory.searchContent({ query: 'geeks-only-secret' });
    expect(crossSearch.total).toBe(0);

    const geeksSearch = await geeksClient.memory.searchContent({ query: 'geeks-only-secret' });
    expect(geeksSearch.total).toBe(1);

    rmSync(root, { recursive: true, force: true });
  });
});

describe('atlas brand LLM context', () => {
  const savedApiKey = process.env.ATLAS_LLM_API_KEY;
  const savedModel = process.env.ATLAS_LLM_MODEL;

  beforeEach(() => {
    process.env.ATLAS_LLM_API_KEY = 'test-key';
    process.env.ATLAS_LLM_MODEL = 'claude-test-model';
  });

  afterEach(() => {
    vi.unstubAllGlobals();

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
  });

  it('includes brand profile context in the LLM system prompt but not in default chat', async () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-brand-llm-context-'));
    const fetchBodies: unknown[] = [];

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        fetchBodies.push(JSON.parse(String(init?.body)));

        return new Response(
          JSON.stringify({
            content: [{ type: 'text', text: 'Acknowledged.' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 1, output_tokens: 1 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    const container = createContainer();
    const geeksPaths = resolveWorkspacePaths('geeks', join(root, 'workspaces'));
    const profile = loadOrCreateBrandProfile(geeksPaths, 'Geeks');
    writeFileSync(
      geeksPaths.profilePath,
      `${JSON.stringify({ ...profile, purpose: 'Electronics retail for enthusiasts', tone: 'Expert', rules: ['No discounts without approval'] }, null, 2)}\n`,
      'utf8',
    );
    const loaded = loadOrCreateBrandProfile(geeksPaths, 'Geeks');
    const brandClient = container.atlasService.createBrandClient(
      geeksPaths,
      renderProfileAsContext(loaded),
    );

    await runChatRepl(container, {
      json: true,
      client: brandClient,
      reader: new ScriptLineReader(['hello brand', '/exit']),
    });

    const brandBody = fetchBodies[0] as { system?: string };
    expect(brandBody.system).toContain('Electronics retail for enthusiasts');
    expect(brandBody.system).toContain('No discounts without approval');

    fetchBodies.length = 0;

    await runChatRepl(container, {
      json: true,
      reader: new ScriptLineReader(['hello chat', '/exit']),
    });

    const chatBody = fetchBodies[0] as { system?: string };
    expect(chatBody.system).not.toContain('Electronics retail for enthusiasts');

    rmSync(root, { recursive: true, force: true });
  });

  it('isolates memory_store results across brand sessions with fetch stubbed', async () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-brand-llm-isolation-'));
    let fetchCall = 0;

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        fetchCall += 1;

        if (fetchCall === 1) {
          return new Response(
            JSON.stringify({
              content: [
                {
                  type: 'tool_use',
                  id: 'toolu_store',
                  name: 'memory_store',
                  input: { content: 'geeks-only-secret' },
                },
              ],
              stop_reason: 'tool_use',
              usage: { input_tokens: 1, output_tokens: 1 },
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          );
        }

        if (fetchCall === 2) {
          return new Response(
            JSON.stringify({
              content: [{ type: 'text', text: 'Stored in Geeks memory.' }],
              stop_reason: 'end_turn',
              usage: { input_tokens: 1, output_tokens: 1 },
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          );
        }

        if (fetchCall === 3) {
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
            content: [{ type: 'text', text: 'Nothing found in Revital.' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 1, output_tokens: 1 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    const container = createContainer();
    const geeksPaths = resolveWorkspacePaths('geeks', join(root, 'workspaces'));
    const revitalPaths = resolveWorkspacePaths('revital', join(root, 'workspaces'));
    const geeksClient = container.atlasService.createBrandClient(
      geeksPaths,
      renderProfileAsContext(loadOrCreateBrandProfile(geeksPaths, 'Geeks')),
    );
    const revitalClient = container.atlasService.createBrandClient(
      revitalPaths,
      renderProfileAsContext(loadOrCreateBrandProfile(revitalPaths, 'Revital')),
    );

    await runChatRepl(container, {
      json: true,
      client: geeksClient,
      reader: new ScriptLineReader(['remember geeks-only-secret', '/exit']),
    });

    const revitalPayloads: Array<{ llm_message?: string }> = [];
    await runChatRepl(container, {
      json: true,
      client: revitalClient,
      onTurn: (payload) => {
        revitalPayloads.push(payload);
      },
      reader: new ScriptLineReader(['search for geeks-only-secret', '/exit']),
    });

    const searchTurn = revitalPayloads.find((payload) =>
      payload.llm_message?.includes('Nothing found'),
    );
    expect(searchTurn).toBeDefined();

    const geeksSearch = await geeksClient.memory.searchContent({ query: 'geeks-only-secret' });
    expect(geeksSearch.total).toBe(1);

    const revitalSearch = await revitalClient.memory.searchContent({ query: 'geeks-only-secret' });
    expect(revitalSearch.total).toBe(0);

    rmSync(root, { recursive: true, force: true });
  });
});

describe('atlas brand command registry', () => {
  it('registers brand in the CLI command list', () => {
    const container = createContainer();
    const names = container.commandRegistry.list().map((command) => command.name);

    expect(names).toContain('brand');
  });
});

describe('atlas brand proactive feedback context', () => {
  const savedApiKey = process.env.ATLAS_LLM_API_KEY;
  const savedModel = process.env.ATLAS_LLM_MODEL;

  beforeEach(() => {
    process.env.ATLAS_LLM_API_KEY = 'test-key';
    process.env.ATLAS_LLM_MODEL = 'claude-test-model';
  });

  afterEach(() => {
    vi.unstubAllGlobals();

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
  });

  it('injects prior /correct feedback into the system prompt on a new brand session', async () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-brand-feedback-context-'));
    const geeksPaths = resolveWorkspacePaths('geeks', join(root, 'workspaces'));
    const profile = loadOrCreateBrandProfile(geeksPaths, 'Geeks');
    const profileContext = renderProfileAsContext(profile);
    const container = createContainer();

    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              content: [{ type: 'text', text: 'Draft campaign copy.' }],
              stop_reason: 'end_turn',
              usage: { input_tokens: 1, output_tokens: 1 },
            }),
            { status: 200, headers: { 'content-type': 'application/json' } },
          ),
      ),
    );

    const firstClient = container.atlasService.createBrandClient(geeksPaths, profileContext);

    await runChatRepl(container, {
      client: firstClient,
      json: true,
      reader: new ScriptLineReader(['draft campaign', '/correct mention free shipping', '/exit']),
    });

    const feedbackContext = await loadRecentFeedbackContext(geeksPaths.memoryFilePath);
    const secondClient = container.atlasService.createBrandClient(
      geeksPaths,
      combineBrandContextPrompt(profileContext, feedbackContext),
    );

    const fetchBodies: unknown[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        fetchBodies.push(JSON.parse(String(init?.body)));

        return new Response(
          JSON.stringify({
            content: [{ type: 'text', text: 'Acknowledged.' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 1, output_tokens: 1 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    await runChatRepl(container, {
      client: secondClient,
      json: true,
      reader: new ScriptLineReader(['new campaign', '/exit']),
    });

    const firstFetch = fetchBodies[0] as { system?: string };
    expect(firstFetch.system).toContain('mention free shipping');
    expect(firstFetch.system).toContain('Known corrections from previous sessions');

    rmSync(root, { recursive: true, force: true });
  });
});
