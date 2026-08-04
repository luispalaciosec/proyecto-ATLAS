import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';

describe('MemoryModule persistent storage', () => {
  it('reloads stored content from disk in a new Atlas instance', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-sdk-memory-file-'));
    const storageFilePath = join(dir, 'memory.json');

    const first = createAtlas({ memory: { storageFilePath } });
    await first.memory.storeContent({ content: 'persist in sdk' });

    const second = createAtlas({ memory: { storageFilePath } });
    const search = await second.memory.searchContent({ query: 'persist' });

    expect(search.total).toBe(1);
    expect(search.records[0]?.content).toEqual({ text: 'persist in sdk' });

    rmSync(dir, { recursive: true, force: true });
  });
});
