import { describe, expect, it } from 'vitest';

import type { MemoryRecord } from '../../src/domain/types/memory-types.js';
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

describe('CONTRACT-002 — InMemoryStorageProvider', () => {
  it('stores and loads records by canonical identity', async () => {
    const provider = new InMemoryStorageProvider();
    const record = createMemoryRecord();

    await provider.store(record);

    const loaded = await provider.load('record.fact.1');
    expect(loaded).toEqual(record);
    expect(await provider.exists('record.fact.1')).toBe(true);
  });

  it('updates records without changing identity', async () => {
    const provider = new InMemoryStorageProvider();
    const record = createMemoryRecord();

    await provider.store(record);
    const updated = createMemoryRecord({
      content: { fact: 'Updated fact' },
      metadata: { namespaceId: 'namespace.1', collectionId: 'collection.1', revision: 2 },
    });

    await provider.update(updated);

    const loaded = await provider.load('record.fact.1');
    expect(loaded?.content).toEqual({ fact: 'Updated fact' });
    expect(loaded?.metadata.revision).toBe(2);
  });

  it('deletes records by canonical identity', async () => {
    const provider = new InMemoryStorageProvider();
    await provider.store(createMemoryRecord());

    await provider.delete('record.fact.1');

    expect(await provider.load('record.fact.1')).toBeUndefined();
    expect(await provider.exists('record.fact.1')).toBe(false);
  });

  it('loads batches preserving only existing records', async () => {
    const provider = new InMemoryStorageProvider();
    const first = createMemoryRecord({ id: 'record.1' });
    const second = createMemoryRecord({ id: 'record.2' });

    await provider.store(first);
    await provider.store(second);

    const batch = await provider.loadBatch(['record.1', 'record.missing', 'record.2']);
    expect(batch.map((record) => record.id)).toEqual(['record.1', 'record.2']);
  });

  it('reports statistics and health', async () => {
    const provider = new InMemoryStorageProvider();
    await provider.store(createMemoryRecord({ id: 'record.1' }));
    await provider.store(createMemoryRecord({ id: 'record.2' }));

    expect(await provider.statistics()).toEqual({ recordCount: 2 });
    expect(await provider.health()).toEqual({ available: true });
  });

  it('preserves metadata exactly as received', async () => {
    const provider = new InMemoryStorageProvider();
    const record = createMemoryRecord({
      metadata: { namespaceId: 'ns.custom', customField: 'value' },
    });

    await provider.store(record);

    const loaded = await provider.load('record.fact.1');
    expect(loaded?.metadata).toEqual({ namespaceId: 'ns.custom', customField: 'value' });
  });
});
