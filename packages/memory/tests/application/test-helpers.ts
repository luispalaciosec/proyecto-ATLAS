import { vi } from 'vitest';

import type { ConsistencyProvider } from '../../src/domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../../src/domain/interfaces/memory-store.js';
import type { MemoryRecord, SearchResult } from '../../src/domain/types/memory-types.js';
import { createMemoryEngine, type MemoryEngine } from '../../src/engine/index.js';

export function createMemoryRecord(overrides: Partial<MemoryRecord> = {}): MemoryRecord {
  return Object.freeze({
    id: 'record.fact.1',
    type: 'Fact',
    content: { fact: 'Memory preserves experience' },
    metadata: {},
    timestamp: '2026-07-24T00:00:00.000Z',
    ...overrides,
  });
}

export function createSearchResult(records: readonly MemoryRecord[] = [createMemoryRecord()]): SearchResult {
  return Object.freeze({
    records,
    total: records.length,
  });
}

export function createConsistencyProvider(
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

export function createMemoryStore(overrides: Partial<MemoryStore> = {}): MemoryStore {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(createMemoryRecord()),
    remove: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue(createSearchResult()),
    ...overrides,
  };
}

export function createTestEngine(overrides: Partial<MemoryStore> = {}): MemoryEngine {
  return createMemoryEngine(createMemoryStore(overrides), createConsistencyProvider());
}

export function createEngineSpy(): MemoryEngine {
  return {
    store: vi.fn(),
    retrieve: vi.fn(),
    delete: vi.fn(),
    search: vi.fn(),
    getCollaborators: vi.fn(),
  } as unknown as MemoryEngine;
}
