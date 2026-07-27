import type { ConsistencyProvider } from '../domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../domain/interfaces/memory-store.js';
import { InMemoryIndexProvider } from './index/in-memory-index-provider.js';
import { InMemoryRetrievalProvider } from './retrieval/in-memory-retrieval-provider.js';
import {
  createInMemoryMemoryStore,
  requireMemoryStoreWithProvider,
  resolveIndexProvider,
  resolveRetrievalProvider,
  resolveStorageProvider,
} from './storage/memory-store-from-storage-provider.js';
import type { IndexProvider } from './index/index-provider.js';
import type { RetrievalProvider } from './retrieval/retrieval-provider.js';
import type { StorageProvider } from './storage/storage-provider.js';

export interface MemoryProviderStack {
  readonly storageProvider: StorageProvider;
  readonly indexProvider: IndexProvider;
  readonly retrievalProvider: RetrievalProvider;
  readonly memoryStore: MemoryStore;
}

export function createInMemoryProviderStack(): MemoryProviderStack {
  const memoryStore = createInMemoryMemoryStore();

  return Object.freeze({
    storageProvider: memoryStore.__storageProvider,
    indexProvider: memoryStore.__indexProvider ?? new InMemoryIndexProvider(),
    retrievalProvider:
      memoryStore.__retrievalProvider ??
      new InMemoryRetrievalProvider(
        memoryStore.__storageProvider,
        (memoryStore.__indexProvider ?? new InMemoryIndexProvider()) as InMemoryIndexProvider,
      ),
    memoryStore,
  });
}

export function resolveProviderStack(store: MemoryStore): MemoryProviderStack {
  requireMemoryStoreWithProvider(store);
  const storageProvider = resolveStorageProvider(store);
  const indexProvider = resolveIndexProvider(store);
  const retrievalProvider = resolveRetrievalProvider(store, storageProvider, indexProvider);

  return Object.freeze({
    storageProvider,
    indexProvider,
    retrievalProvider,
    memoryStore: store,
  });
}

export function createDefaultConsistencyProvider(): ConsistencyProvider {
  return {
    validateRecord: async () => ({ valid: true, issues: [] }),
    validateStore: async () => ({ valid: true, issues: [] }),
    validateIndexes: async () => ({ valid: true, issues: [] }),
    validateSessions: async () => ({ valid: true, issues: [] }),
    repair: async () => ({ repaired: 0, skipped: 0, failed: 0 }),
  };
}
