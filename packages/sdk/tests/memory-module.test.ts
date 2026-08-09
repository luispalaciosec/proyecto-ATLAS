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

  it('matches queries with or without accents', async () => {
    const atlas = createAtlas();

    const stored = await atlas.memory.storeContent({ content: 'Cliente VIP Ana García — pedido laptop' });

    const withAccent = await atlas.memory.searchContent({ query: 'García' });
    const withoutAccent = await atlas.memory.searchContent({ query: 'Garcia' });

    expect(withAccent.total).toBe(1);
    expect(withoutAccent.total).toBe(1);
    expect(withAccent.records[0]?.id).toBe(stored.recordId);
    expect(withoutAccent.records[0]?.id).toBe(stored.recordId);
  });
});
