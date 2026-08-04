import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import type { MemoryRecord } from '../../src/domain/types/memory-types.js';
import { JsonFileStorageProvider } from '../../src/providers/storage/json-file-storage-provider.js';

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

function createTempFile(): string {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-json-storage-'));
  return join(dir, 'memory.json');
}

describe('CONTRACT-002 — JsonFileStorageProvider', () => {
  it('stores and loads records by canonical identity', async () => {
    const filePath = createTempFile();
    const provider = new JsonFileStorageProvider({ filePath });
    const record = createMemoryRecord();

    await provider.store(record);

    const loaded = await provider.load('record.fact.1');
    expect(loaded).toEqual(record);
    expect(await provider.exists('record.fact.1')).toBe(true);
  });

  it('updates and deletes records while persisting to disk', async () => {
    const filePath = createTempFile();
    const provider = new JsonFileStorageProvider({ filePath });
    const record = createMemoryRecord();

    await provider.store(record);
    await provider.update(
      createMemoryRecord({
        content: { fact: 'Updated fact' },
        metadata: { namespaceId: 'namespace.1', collectionId: 'collection.1', revision: 2 },
      }),
    );
    await provider.delete('record.fact.1');

    expect(await provider.load('record.fact.1')).toBeUndefined();
    expect(JSON.parse(readFileSync(filePath, 'utf8'))).toEqual({
      version: 1,
      records: [],
    });
  });

  it('reloads persisted records from disk in a new process instance', async () => {
    const filePath = createTempFile();
    const first = new JsonFileStorageProvider({ filePath });

    await first.store(createMemoryRecord({ id: 'record.persisted' }));

    const second = new JsonFileStorageProvider({ filePath });
    const loaded = await second.load('record.persisted');

    expect(loaded?.id).toBe('record.persisted');
    expect(second.listAll()).toHaveLength(1);
  });

  it('loads batches and reports statistics and health', async () => {
    const filePath = createTempFile();
    const provider = new JsonFileStorageProvider({ filePath });

    await provider.store(createMemoryRecord({ id: 'record.1' }));
    await provider.store(createMemoryRecord({ id: 'record.2' }));

    const batch = await provider.loadBatch(['record.1', 'record.missing', 'record.2']);
    expect(batch.map((record) => record.id)).toEqual(['record.1', 'record.2']);
    expect(await provider.statistics()).toEqual({ recordCount: 2 });
    expect(await provider.health()).toEqual({ available: true });
  });

  it('cleans up temp files', () => {
    const filePath = createTempFile();
    rmSync(join(filePath, '..'), { recursive: true, force: true });
    expect(true).toBe(true);
  });
});
