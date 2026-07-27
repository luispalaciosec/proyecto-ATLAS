import { describe, expect, it } from 'vitest';

import type { MemoryRecord } from '../../src/domain/types/memory-types.js';
import { InMemoryIndexProvider } from '../../src/providers/index/in-memory-index-provider.js';

function createMemoryRecord(overrides: Partial<MemoryRecord> = {}): MemoryRecord {
  return Object.freeze({
    id: 'record.fact.1',
    type: 'Fact',
    content: { fact: 'Memory preserves experience' },
    metadata: { namespaceId: 'namespace.1', collectionId: 'collection.1' },
    timestamp: '2026-07-24T00:00:00.000Z',
    ...overrides,
  });
}

describe('CONTRACT-003 — InMemoryIndexProvider', () => {
  it('indexes records on updateIndex', async () => {
    const provider = new InMemoryIndexProvider();
    const record = createMemoryRecord();

    await provider.updateIndex(record);

    const entry = provider.getEntry('record.fact.1');
    expect(entry?.recordId).toBe('record.fact.1');
    expect(entry?.recordType).toBe('Fact');
    expect(entry?.namespaceId).toBe('namespace.1');
    expect(entry?.collectionId).toBe('collection.1');
  });

  it('removes indexed entries on deleteIndexEntry', async () => {
    const provider = new InMemoryIndexProvider();
    await provider.updateIndex(createMemoryRecord());

    await provider.deleteIndexEntry('record.fact.1');

    expect(provider.getEntry('record.fact.1')).toBeUndefined();
    expect(provider.listEntries()).toHaveLength(0);
  });

  it('updates index entries when records change', async () => {
    const provider = new InMemoryIndexProvider();
    await provider.updateIndex(createMemoryRecord({ type: 'Fact' }));
    await provider.updateIndex(createMemoryRecord({ type: 'Observation' }));

    expect(provider.getEntry('record.fact.1')?.recordType).toBe('Observation');
  });

  it('validates index integrity', async () => {
    const provider = new InMemoryIndexProvider();
    await provider.updateIndex(createMemoryRecord());

    expect(await provider.validateIndex()).toEqual({ valid: true, issues: [] });
  });

  it('reports statistics and health', async () => {
    const provider = new InMemoryIndexProvider();
    await provider.updateIndex(createMemoryRecord({ id: 'record.1' }));
    await provider.updateIndex(createMemoryRecord({ id: 'record.2' }));

    expect(await provider.statistics()).toEqual({ entryCount: 2 });
    expect(await provider.healthCheck()).toEqual({ available: true });
  });
});
