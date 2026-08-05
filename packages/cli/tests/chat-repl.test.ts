import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { CliApp } from '../src/application/cli-app.js';
import { createContainer } from '../src/application/container.js';
import type { ChatLineReader, ChatTurnPayload } from '../src/chat/chat-repl.js';
import { runChatRepl } from '../src/chat/chat-repl.js';

const memorySuiteDir = mkdtempSync(join(tmpdir(), 'atlas-chat-memory-suite-'));
const memoryFilePath = join(memorySuiteDir, 'memory.json');

beforeAll(() => {
  process.env.ATLAS_MEMORY_FILE = memoryFilePath;
});

afterAll(() => {
  delete process.env.ATLAS_MEMORY_FILE;
  rmSync(memorySuiteDir, { recursive: true, force: true });
});

beforeEach(() => {
  rmSync(memoryFilePath, { force: true });
});

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

describe('runChatRepl', () => {
  it('keeps the same chat session id and retrieves prior memory on similar goals', async () => {
    const container = createContainer();
    const payloads: ChatTurnPayload[] = [];

    await runChatRepl(container, {
      json: true,
      reader: new ScriptLineReader([
        'procesar pedido cliente',
        'procesar pedido urgente',
        '/exit',
      ]),
      onTurn: (payload) => {
        payloads.push(payload);
      },
    });

    expect(payloads).toHaveLength(2);
    expect(payloads[0]?.session_id).toBe(payloads[1]?.session_id);
    expect(payloads[0]?.retrieval.selected).toBe(0);
    expect(payloads[1]?.retrieval.selected).toBeGreaterThan(0);
    expect(payloads[1]?.retrieval.prior_goals.some((goal) => goal.includes('procesar pedido'))).toBe(
      true,
    );
  });
});

describe('atlas chat command registry', () => {
  it('registers chat in the CLI command list', () => {
    const container = createContainer();
    const names = container.commandRegistry.list().map((command) => command.name);

    expect(names).toContain('chat');
  });
});

describe('runChatRepl with LLM configured', () => {
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

  it('uses LLM mode and passes prior conversation history on the second fetch call', async () => {
    const fetchBodies: unknown[] = [];

    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, init?: RequestInit) => {
        fetchBodies.push(JSON.parse(String(init?.body)));

        const turnIndex = fetchBodies.length - 1;

        return new Response(
          JSON.stringify({
            content: [{ type: 'text', text: turnIndex === 0 ? 'First reply' : 'Second reply' }],
            stop_reason: 'end_turn',
            usage: { input_tokens: 1, output_tokens: 1 },
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      }),
    );

    const container = createContainer();
    const payloads: ChatTurnPayload[] = [];

    await runChatRepl(container, {
      json: true,
      reader: new ScriptLineReader(['hello there', 'follow up question', '/exit']),
      onTurn: (payload) => {
        payloads.push(payload);
      },
    });

    expect(payloads).toHaveLength(2);
    expect(payloads[0]?.mode).toBe('llm');
    expect(payloads[1]?.mode).toBe('llm');
    expect(fetchBodies).toHaveLength(2);

    const secondBody = fetchBodies[1] as {
      messages: Array<{ role: string; content: string }>;
    };
    const serialized = JSON.stringify(secondBody.messages);

    expect(serialized).toContain('hello there');
    expect(serialized).toContain('First reply');
    expect(serialized).toContain('follow up question');
  });
});
