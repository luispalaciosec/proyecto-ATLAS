import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

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
