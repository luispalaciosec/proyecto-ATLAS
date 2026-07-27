import { describe, expect, it } from 'vitest';

import type { MemoryRecord } from '../../src/domain/types/memory-types.js';
import { InMemoryIndexProvider } from '../../src/providers/index/in-memory-index-provider.js';
import { InMemoryRetrievalProvider } from '../../src/providers/retrieval/in-memory-retrieval-provider.js';
import { InMemoryStorageProvider } from '../../src/providers/storage/in-memory-storage-provider.js';

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

function createProviderStack() {
  const storageProvider = new InMemoryStorageProvider();
  const indexProvider = new InMemoryIndexProvider();
  const retrievalProvider = new InMemoryRetrievalProvider(storageProvider, indexProvider);

  return { storageProvider, indexProvider, retrievalProvider };
}

describe('CONTRACT-004 — InMemoryRetrievalProvider', () => {
  it('retrieves records by canonical identity', async () => {
    const { storageProvider, indexProvider, retrievalProvider } = createProviderStack();
    const record = createMemoryRecord();

    await storageProvider.store(record);
    await indexProvider.updateIndex(record);

    const retrieved = await retrievalProvider.retrieveById('record.fact.1');
    expect(retrieved).toEqual(record);
  });

  it('retrieves batches by canonical identities', async () => {
    const { storageProvider, indexProvider, retrievalProvider } = createProviderStack();
    const first = createMemoryRecord({ id: 'record.1' });
    const second = createMemoryRecord({ id: 'record.2' });

    await storageProvider.store(first);
    await storageProvider.store(second);
    await indexProvider.updateIndex(first);
    await indexProvider.updateIndex(second);

    const batch = await retrievalProvider.retrieveBatch(['record.1', 'record.missing', 'record.2']);
    expect(batch.map((record) => record.id)).toEqual(['record.1', 'record.2']);
  });

  it('searches using index-backed records and MemoryQuery filters', async () => {
    const { storageProvider, indexProvider, retrievalProvider } = createProviderStack();
    const matching = createMemoryRecord({
      id: 'record.1',
      type: 'Fact',
      metadata: { namespaceId: 'namespace.1' },
    });
    const other = createMemoryRecord({
      id: 'record.2',
      type: 'Observation',
      metadata: { namespaceId: 'namespace.2' },
    });

    await storageProvider.store(matching);
    await storageProvider.store(other);
    await indexProvider.updateIndex(matching);
    await indexProvider.updateIndex(other);

    const result = await retrievalProvider.search({
      recordType: 'Fact',
      namespaceId: 'namespace.1',
    });

    expect(result.total).toBe(1);
    expect(result.records[0]?.id).toBe('record.1');
  });

  it('does not mutate stored records during retrieval', async () => {
    const { storageProvider, indexProvider, retrievalProvider } = createProviderStack();
    const record = createMemoryRecord();

    await storageProvider.store(record);
    await indexProvider.updateIndex(record);

    await retrievalProvider.search({ recordType: 'Fact' });

    expect(await storageProvider.load('record.fact.1')).toEqual(record);
  });

  it('reports statistics and health', async () => {
    const { storageProvider, indexProvider, retrievalProvider } = createProviderStack();
    const record = createMemoryRecord();

    await storageProvider.store(record);
    await indexProvider.updateIndex(record);
    await retrievalProvider.retrieveById('record.fact.1');
    await retrievalProvider.search({});

    const stats = await retrievalProvider.statistics();
    expect(stats.totalRetrievals).toBeGreaterThanOrEqual(2);
    expect(await retrievalProvider.health()).toEqual({ available: true });
  });
});
