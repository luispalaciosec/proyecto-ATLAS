import { describe, expect, it, vi } from 'vitest';

import type { ConsistencyProvider } from '../../src/domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../../src/domain/interfaces/memory-store.js';
import type { MemoryRecord, SearchResult } from '../../src/domain/types/memory-types.js';
import { INVALID_MEMORY_RECORD, MEMORY_STORAGE_ERROR } from '../../src/domain/errors/memory-error-codes.js';
import {
  ENGINE_CONSISTENCY,
  ENGINE_DOMAIN_VALIDATION,
  ENGINE_STORE,
} from '../../src/engine/engine-errors.js';
import { createMemoryEngine, MemoryEngine } from '../../src/engine/index.js';

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
  it('orchestrates successful store operations', async () => {
    const record = createMemoryRecord();
    const store = createMemoryStore();
    const consistencyProvider = createConsistencyProvider();
    const engine = createMemoryEngine(store, consistencyProvider);

    const result = await engine.store(record);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(record);
    }
    expect(store.put).toHaveBeenCalledTimes(1);
    expect(consistencyProvider.validateRecord).toHaveBeenCalledWith(record);
  });

  it('orchestrates successful retrieve operations', async () => {
    const record = createMemoryRecord();
    const store = createMemoryStore({
      get: vi.fn().mockResolvedValue(record),
    });
    const engine = createMemoryEngine(store, createConsistencyProvider());

    const result = await engine.retrieve();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(record);
    }
    expect(store.get).toHaveBeenCalledTimes(1);
  });

  it('orchestrates successful delete operations', async () => {
    const record = createMemoryRecord();
    const store = createMemoryStore();
    const consistencyProvider = createConsistencyProvider();
    const engine = createMemoryEngine(store, consistencyProvider);

    const result = await engine.delete(record);

    expect(result.ok).toBe(true);
    expect(store.remove).toHaveBeenCalledTimes(1);
    expect(consistencyProvider.validateRecord).toHaveBeenCalledWith(record);
  });

  it('delegates search operations through the internal store gateway', async () => {
    const searchResult = createSearchResult();
    const store = createMemoryStore({
      search: vi.fn().mockResolvedValue(searchResult),
    });
    const engine = createMemoryEngine(store, createConsistencyProvider());

    const result = await engine.search();

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual(searchResult);
    }
    expect(store.search).toHaveBeenCalledTimes(1);
  });

  it('returns domain validation failures without invoking providers', async () => {
    const store = createMemoryStore();
    const consistencyProvider = createConsistencyProvider();
    const engine = createMemoryEngine(store, consistencyProvider);

    const result = await engine.store(
      createMemoryRecord({
        id: '',
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(ENGINE_DOMAIN_VALIDATION);
      expect(result.error.canonicalCode).toBe(INVALID_MEMORY_RECORD);
    }
    expect(consistencyProvider.validateRecord).not.toHaveBeenCalled();
    expect(store.put).not.toHaveBeenCalled();
  });

  it('returns domain validation failures on delete without invoking providers', async () => {
    const store = createMemoryStore();
    const consistencyProvider = createConsistencyProvider();
    const engine = createMemoryEngine(store, consistencyProvider);

    const result = await engine.delete(
      createMemoryRecord({
        type: '',
      }),
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
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
    const engine = createMemoryEngine(store, consistencyProvider);

    const result = await engine.store(record);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(ENGINE_CONSISTENCY);
    }
    expect(store.put).not.toHaveBeenCalled();
  });

  it('propagates MemoryStore errors as engine failures', async () => {
    const store = createMemoryStore({
      put: vi.fn().mockRejectedValue(new Error('store unavailable')),
    });
    const engine = createMemoryEngine(store, createConsistencyProvider());

    const result = await engine.store(createMemoryRecord());

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(ENGINE_STORE);
      expect(result.error.canonicalCode).toBe(MEMORY_STORAGE_ERROR);
      expect(result.error.cause).toBeInstanceOf(Error);
    }
  });

  it('propagates MemoryStore retrieve errors as engine failures', async () => {
    const store = createMemoryStore({
      get: vi.fn().mockRejectedValue(new Error('read unavailable')),
    });
    const engine = createMemoryEngine(store, createConsistencyProvider());

    const result = await engine.retrieve();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(ENGINE_STORE);
      expect(result.error.canonicalCode).toBe(MEMORY_STORAGE_ERROR);
      expect(result.error.cause).toBeInstanceOf(Error);
    }
  });

  it('propagates MemoryStore search errors as engine failures', async () => {
    const store = createMemoryStore({
      search: vi.fn().mockRejectedValue(new Error('search unavailable')),
    });
    const engine = createMemoryEngine(store, createConsistencyProvider());

    const result = await engine.search();

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(ENGINE_STORE);
      expect(result.error.canonicalCode).toBe(MEMORY_STORAGE_ERROR);
    }
  });

  it('propagates ConsistencyProvider errors', async () => {
    const consistencyProvider = createConsistencyProvider({
      validateRecord: vi.fn().mockRejectedValue(new Error('consistency unavailable')),
    });
    const engine = createMemoryEngine(createMemoryStore(), consistencyProvider);

    await expect(engine.store(createMemoryRecord())).rejects.toThrow('consistency unavailable');
  });

  it('invokes MemoryStore.put exactly once on successful store', async () => {
    const store = createMemoryStore();
    const engine = createMemoryEngine(store, createConsistencyProvider());

    await engine.store(createMemoryRecord());

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
    const engine = createMemoryEngine(store, consistencyProvider);

    await engine.store(createMemoryRecord());

    expect(callOrder).toEqual(['consistency', 'put']);
  });

  it('owns internal entity repositories as collaborators', () => {
    const engine = createMemoryEngine(createMemoryStore(), createConsistencyProvider());
    const collaborators = engine.getCollaborators();

    expect(collaborators.namespace).toBeDefined();
    expect(collaborators.collection).toBeDefined();
    expect(collaborators.record).toBeDefined();
    expect(collaborators.version).toBeDefined();
    expect(collaborators.relationship).toBeDefined();
  });
});

describe('MemoryEngine ADR-0003 single entry point', () => {
  it('routes persistence through the internal store gateway owned by the engine', async () => {
    const store = createMemoryStore();
    const engine = new MemoryEngine(store, createConsistencyProvider());

    await engine.store(createMemoryRecord());

    expect(store.put).toHaveBeenCalledTimes(1);
  });
});
