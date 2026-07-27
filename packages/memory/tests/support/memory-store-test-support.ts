import { vi } from 'vitest';

import type { MemoryStore } from '../../src/domain/interfaces/memory-store.js';
import type { MemoryRecord, SearchResult } from '../../src/domain/types/memory-types.js';
import { LegacyMemoryStoreStorageAdapter } from '../../src/providers/storage/legacy-memory-store-storage-adapter.js';
import type { MemoryStoreWithProvider } from '../../src/providers/storage/memory-store-from-storage-provider.js';

/**
 * Explicit test-only bridge for historical MemoryStore mocks.
 * Production code must never construct MemoryEngine without __storageProvider.
 */
export function attachLegacyStorageProviderForTests(
  store: MemoryStore,
): MemoryStoreWithProvider {
  return Object.freeze({
    ...store,
    __storageProvider: new LegacyMemoryStoreStorageAdapter(store),
  });
}

export function createMockMemoryStore(
  overrides: Partial<MemoryStore> = {},
  defaultRecord?: MemoryRecord,
): MemoryStore {
  return {
    put: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue(defaultRecord),
    remove: vi.fn().mockResolvedValue(undefined),
    search: vi.fn().mockResolvedValue(
      Object.freeze({
        records: defaultRecord === undefined ? [] : [defaultRecord],
        total: defaultRecord === undefined ? 0 : 1,
      } satisfies SearchResult),
    ),
    ...overrides,
  };
}

export function createTestMemoryStoreWithLegacyAdapter(
  overrides: Partial<MemoryStore> = {},
  defaultRecord?: MemoryRecord,
): MemoryStoreWithProvider {
  return attachLegacyStorageProviderForTests(createMockMemoryStore(overrides, defaultRecord));
}
