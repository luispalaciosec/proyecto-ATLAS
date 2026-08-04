import { describe, expect, it } from 'vitest';

import {
  createJsonFileMemoryEngine,
  createMemoryEngine,
  INVALID_MEMORY_RECORD,
  INVALID_QUERY,
  MEMORY_INDEX_ERROR,
  MEMORY_NOT_FOUND,
  MEMORY_RETRIEVAL_ERROR,
  MEMORY_STORAGE_ERROR,
  MemoryEngine,
  type MemoryMetadata,
  type MemoryQuery,
  type MemoryRecord,
  type MemorySnapshot,
  type MemoryStatistics,
  type Result,
  type RetrievalResult,
  type SearchResult,
  type SimilarityResult,
} from '../src/index.js';

describe('@atlas/memory public API', () => {
  it('exports MemoryEngine and createMemoryEngine', () => {
    expect(MemoryEngine).toBeDefined();
    expect(createMemoryEngine).toBeTypeOf('function');
    expect(createJsonFileMemoryEngine).toBeTypeOf('function');
  });

  it('exports public error codes from MEMORY-008', () => {
    expect(MEMORY_NOT_FOUND).toBe('MemoryNotFoundError');
    expect(MEMORY_STORAGE_ERROR).toBe('MemoryStorageError');
    expect(MEMORY_INDEX_ERROR).toBe('MemoryIndexError');
    expect(MEMORY_RETRIEVAL_ERROR).toBe('MemoryRetrievalError');
    expect(INVALID_MEMORY_RECORD).toBe('InvalidMemoryRecordError');
    expect(INVALID_QUERY).toBe('InvalidQueryError');
  });

  it('exports public type aliases without leaking internal modules', () => {
    const _record: MemoryRecord = {
      id: 'record.fact.1',
      type: 'Fact',
      content: {},
      metadata: {},
      timestamp: '2026-07-24T00:00:00.000Z',
    };
    const _snapshot: MemorySnapshot = {
      id: 'snapshot.1',
      created_at: '2026-07-24T00:00:00.000Z',
      records: [_record],
      checksum: 'sha256:abc',
    };
    const _query: MemoryQuery = {};
    const _search: SearchResult = { records: [], total: 0 };
    const _retrieval: RetrievalResult = { records: [], total: 0 };
    const _similarity: SimilarityResult = { records: [], scores: [] };
    const _stats: MemoryStatistics = { entries: 0, indexes: 0, size_bytes: 0 };
    const _metadata: MemoryMetadata = { creator: 'system' };
    const _result: Result<MemoryRecord, string> = { ok: true, value: _record };

    expect(_snapshot.records).toHaveLength(1);
    expect(_query).toEqual({});
    expect(_search.total).toBe(0);
    expect(_retrieval.total).toBe(0);
    expect(_similarity.scores).toHaveLength(0);
    expect(_stats.entries).toBe(0);
    expect(_metadata.creator).toBe('system');
    expect(_result.ok).toBe(true);
  });
});
