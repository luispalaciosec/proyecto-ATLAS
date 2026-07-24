import { describe, expect, it, vi } from 'vitest';

import type { ConsistencyProvider } from '../../src/domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../../src/domain/interfaces/memory-store.js';
import type { MemoryRecord, SearchResult } from '../../src/domain/types/memory-types.js';
import { INVALID_MEMORY_RECORD, MEMORY_STORAGE_ERROR } from '../../src/domain/index.js';
import {
  ENGINE_CONSISTENCY,
  ENGINE_DOMAIN_VALIDATION,
  ENGINE_STORE,
  MemoryEngine,
} from '../../src/engine/index.js';

function createMemoryRecord(overrides: Partial<MemoryRecord> = {}): MemoryRecord {
  return Object.freeze({
    id: 'record.fact.1',
    type: 'Fact',
    content: { fact: 'Memory preserves experience' },
    metadata: {},
    timestamp: '2026-07-24T00:00:00.000Z',
    ...overrides,
  });
}

function createSearchResult(): SearchResult {
  return Object.freeze({
    records: [createMemoryRecord()],
    total: 1,
  });
}

function createConsistencyProvider(
  overrides: Partial<ConsistencyProvider> = {},
): ConsistencyProvider {
  return {
    validateRecord: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
    validateStore: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
    validateIndexes: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
    validateSessions: vi.fn().mockResolvedValue({ valid: true, issues: [] }),
    repair: vi.fn().mockResolvedValue({ repaired: 0, skipped: 0, failed: 0 }),
    ...overrides,
  };
}

function createMemoryStore(overrides: Partial<MemoryStore> = {}): MemoryStore {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(createMemoryRecord()),
    remove: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue(createSearchResult()),
    ...overrides,
  };
}

describe('MemoryEngine orchestration', () => {
  it('orchestrates successful write operations', async () => {
    const record = createMemoryRecord();
    const store = createMemoryStore();
    const consistencyProvider = createConsistencyProvider();
    const engine = new MemoryEngine(store, consistencyProvider);

    const result = await engine.write(record);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(record);
    }
    expect(store.put).toHaveBeenCalledTimes(1);
    expect(consistencyProvider.validateRecord).toHaveBeenCalledWith(record);
  });

  it('orchestrates successful read operations', async () => {
    const record = createMemoryRecord();
    const store = createMemoryStore({
      get: vi.fn().mockResolvedValue(record),
    });
    const engine = new MemoryEngine(store, createConsistencyProvider());

    const result = await engine.read();

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(record);
    }
    expect(store.get).toHaveBeenCalledTimes(1);
  });

  it('orchestrates successful remove operations', async () => {
    const record = createMemoryRecord();
    const store = createMemoryStore();
    const consistencyProvider = createConsistencyProvider();
    const engine = new MemoryEngine(store, consistencyProvider);

    const result = await engine.remove(record);

    expect(result.success).toBe(true);
    expect(store.remove).toHaveBeenCalledTimes(1);
    expect(consistencyProvider.validateRecord).toHaveBeenCalledWith(record);
  });

  it('delegates search operations to MemoryStore', async () => {
    const searchResult = createSearchResult();
    const store = createMemoryStore({
      search: vi.fn().mockResolvedValue(searchResult),
    });
    const engine = new MemoryEngine(store, createConsistencyProvider());

    await expect(engine.search()).resolves.toEqual(searchResult);
    expect(store.search).toHaveBeenCalledTimes(1);
  });

  it('returns domain validation failures without invoking providers', async () => {
    const store = createMemoryStore();
    const consistencyProvider = createConsistencyProvider();
    const engine = new MemoryEngine(store, consistencyProvider);

    const result = await engine.write(
      createMemoryRecord({
        id: '',
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ENGINE_DOMAIN_VALIDATION);
      expect(result.error.canonicalCode).toBe(INVALID_MEMORY_RECORD);
    }
    expect(consistencyProvider.validateRecord).not.toHaveBeenCalled();
    expect(store.put).not.toHaveBeenCalled();
  });

  it('returns domain validation failures on remove without invoking providers', async () => {
    const store = createMemoryStore();
    const consistencyProvider = createConsistencyProvider();
    const engine = new MemoryEngine(store, consistencyProvider);

    const result = await engine.remove(
      createMemoryRecord({
        type: '',
      }),
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ENGINE_DOMAIN_VALIDATION);
      expect(result.error.canonicalCode).toBe(INVALID_MEMORY_RECORD);
    }
    expect(consistencyProvider.validateRecord).not.toHaveBeenCalled();
    expect(store.remove).not.toHaveBeenCalled();
  });

  it('returns consistency failures without invoking MemoryStore.put', async () => {
    const record = createMemoryRecord();
    const store = createMemoryStore();
    const consistencyProvider = createConsistencyProvider({
      validateRecord: vi.fn().mockResolvedValue({
        valid: false,
        issues: [{ code: 'BrokenReference', message: 'Invalid record graph' }],
      }),
    });
    const engine = new MemoryEngine(store, consistencyProvider);

    const result = await engine.write(record);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ENGINE_CONSISTENCY);
    }
    expect(store.put).not.toHaveBeenCalled();
  });

  it('propagates MemoryStore errors as engine failures', async () => {
    const store = createMemoryStore({
      put: vi.fn().mockRejectedValue(new Error('store unavailable')),
    });
    const engine = new MemoryEngine(store, createConsistencyProvider());

    const result = await engine.write(createMemoryRecord());

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ENGINE_STORE);
      expect(result.error.canonicalCode).toBe(MEMORY_STORAGE_ERROR);
      expect(result.error.cause).toBeInstanceOf(Error);
    }
  });

  it('propagates MemoryStore read errors as engine failures', async () => {
    const store = createMemoryStore({
      get: vi.fn().mockRejectedValue(new Error('read unavailable')),
    });
    const engine = new MemoryEngine(store, createConsistencyProvider());

    const result = await engine.read();

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe(ENGINE_STORE);
      expect(result.error.canonicalCode).toBe(MEMORY_STORAGE_ERROR);
      expect(result.error.cause).toBeInstanceOf(Error);
    }
  });

  it('propagates MemoryStore search errors', async () => {
    const store = createMemoryStore({
      search: vi.fn().mockRejectedValue(new Error('search unavailable')),
    });
    const engine = new MemoryEngine(store, createConsistencyProvider());

    await expect(engine.search()).rejects.toThrow('search unavailable');
  });

  it('propagates ConsistencyProvider errors', async () => {
    const consistencyProvider = createConsistencyProvider({
      validateRecord: vi.fn().mockRejectedValue(new Error('consistency unavailable')),
    });
    const engine = new MemoryEngine(createMemoryStore(), consistencyProvider);

    await expect(engine.write(createMemoryRecord())).rejects.toThrow('consistency unavailable');
  });

  it('invokes MemoryStore.put exactly once on successful write', async () => {
    const store = createMemoryStore();
    const engine = new MemoryEngine(store, createConsistencyProvider());

    await engine.write(createMemoryRecord());

    expect(store.put).toHaveBeenCalledTimes(1);
  });

  it('invokes ConsistencyProvider before MemoryStore.put', async () => {
    const callOrder: string[] = [];
    const store = createMemoryStore({
      put: vi.fn(async () => {
        callOrder.push('put');
      }),
    });
    const consistencyProvider = createConsistencyProvider({
      validateRecord: vi.fn(async () => {
        callOrder.push('consistency');
        return { valid: true, issues: [] };
      }),
    });
    const engine = new MemoryEngine(store, consistencyProvider);

    await engine.write(createMemoryRecord());

    expect(callOrder).toEqual(['consistency', 'put']);
  });
});
