import { describe, expect, it } from 'vitest';

import type { MemoryRecord } from '../../src/domain/types/memory-types.js';
import { createMemoryEngine } from '../../src/engine/index.js';
import {
  createDefaultConsistencyProvider,
  createInMemoryProviderStack,
} from '../../src/providers/create-memory-providers.js';
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

describe('MemoryEngine provider integration', () => {
  it('routes store through Storage Provider and Index Provider', async () => {
    const { memoryStore, storageProvider, indexProvider } = createInMemoryProviderStack();
    const engine = createMemoryEngine(memoryStore, createDefaultConsistencyProvider());
    const record = createMemoryRecord();

    const result = await engine.store(record);

    expect(result.ok).toBe(true);
    expect(await storageProvider.load('record.fact.1')).toEqual(record);
    expect((indexProvider as InMemoryIndexProvider).getEntry('record.fact.1')?.recordType).toBe('Fact');
  });

  it('routes retrieve and search through Retrieval Provider', async () => {
    const { memoryStore } = createInMemoryProviderStack();
    const engine = createMemoryEngine(memoryStore, createDefaultConsistencyProvider());
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

    await engine.store(matching);
    await engine.store(other);

    const retrieveResult = await engine.retrieve({ recordId: 'record.1' });
    expect(retrieveResult.ok).toBe(true);
    if (retrieveResult.ok) {
      expect(retrieveResult.value.id).toBe('record.1');
    }

    const searchResult = await engine.search({
      recordType: 'Fact',
      namespaceId: 'namespace.1',
    });
    expect(searchResult.ok).toBe(true);
    if (searchResult.ok) {
      expect(searchResult.value.total).toBe(1);
      expect(searchResult.value.records[0]?.id).toBe('record.1');
    }
  });

  it('routes update and delete through Storage Provider and Index Provider', async () => {
    const { memoryStore, storageProvider, indexProvider } = createInMemoryProviderStack();
    const engine = createMemoryEngine(memoryStore, createDefaultConsistencyProvider());
    const record = createMemoryRecord({ metadata: { revision: 1 } });

    await engine.store(record);

    const updateResult = await engine.update(record);
    expect(updateResult.ok).toBe(true);
    if (updateResult.ok) {
      expect(updateResult.value.metadata.revision).toBe(2);
      expect((await storageProvider.load('record.fact.1'))?.metadata.revision).toBe(2);
    }

    const deleteResult = await engine.delete(record);
    expect(deleteResult.ok).toBe(true);
    expect(await storageProvider.load('record.fact.1')).toBeUndefined();
    expect((indexProvider as InMemoryIndexProvider).getEntry('record.fact.1')).toBeUndefined();
  });

  it('keeps ConsistencyProvider orchestrated exclusively by MemoryEngine', async () => {
    const { memoryStore } = createInMemoryProviderStack();
    const consistencyProvider = createDefaultConsistencyProvider();
    const engine = createMemoryEngine(memoryStore, consistencyProvider);
    const record = createMemoryRecord();

    await engine.store(record);

    expect(await consistencyProvider.validateRecord(record)).toEqual({
      valid: true,
      issues: [],
    });
  });
});
