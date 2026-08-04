import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';

describe('MemoryModule', () => {
  it('stores and searches content through the public memory facade', async () => {
    const atlas = createAtlas({ workspace: { name: 'memory-module-test' } });

    const stored = await atlas.memory.storeContent({ content: 'hola mundo' });

    expect(stored.recordId).toMatch(/^record\.cli\./);
    expect(stored.record.type).toBe('CliMemory');

    const search = await atlas.memory.searchContent({ query: 'hola' });

    expect(search.total).toBe(1);
    expect(search.records[0]?.id).toBe(stored.recordId);
  });

  it('returns empty results when query does not match stored content', async () => {
    const atlas = createAtlas();

    await atlas.memory.storeContent({ content: 'alpha content' });
    const search = await atlas.memory.searchContent({ query: 'beta' });

    expect(search.total).toBe(0);
    expect(search.records).toHaveLength(0);
  });
});
