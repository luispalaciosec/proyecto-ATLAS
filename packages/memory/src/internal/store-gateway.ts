import type { MemoryStore } from '../domain/interfaces/memory-store.js';
import type { MemoryRecord, SearchResult } from '../domain/types/memory-types.js';

/**
 * Internal persistence port owned by MemoryEngine.
 * Entity repositories MUST use this gateway — never MemoryStore directly.
 */
export interface InternalStoreGateway {
  put(): Promise<void>;
  get(): Promise<MemoryRecord | undefined>;
  remove(): Promise<void>;
  search(): Promise<SearchResult>;
}

export function createStoreGateway(store: MemoryStore): InternalStoreGateway {
  return Object.freeze({
    put: () => store.put(),
    get: () => store.get(),
    remove: () => store.remove(),
    search: () => store.search(),
  });
}
