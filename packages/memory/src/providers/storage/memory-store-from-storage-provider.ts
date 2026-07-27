import type { MemoryStore } from '../../domain/interfaces/memory-store.js';
import type { MemoryRecord, SearchResult } from '../../domain/types/memory-types.js';

import { InMemoryIndexProvider } from '../index/in-memory-index-provider.js';
import { InMemoryRetrievalProvider } from '../retrieval/in-memory-retrieval-provider.js';

import { InMemoryStorageProvider } from './in-memory-storage-provider.js';
import type { IndexProvider } from '../index/index-provider.js';
import type { RetrievalProvider } from '../retrieval/retrieval-provider.js';
import type { StorageProvider } from './storage-provider.js';

export class MemoryProviderStackRequiredError extends Error {
  constructor() {
    super(
      'MemoryStore must expose __storageProvider. Use createMemoryEngine(consistencyProvider) for the official in-memory stack, or attach an explicit StorageProvider before constructing MemoryEngine.',
    );
    this.name = 'MemoryProviderStackRequiredError';
  }
}

export function isInMemoryStorageProvider(
  provider: StorageProvider,
): provider is InMemoryStorageProvider {
  return typeof (provider as InMemoryStorageProvider).listAll === 'function';
}

export interface MemoryStoreWithProvider extends MemoryStore {
  readonly __storageProvider: StorageProvider;
  readonly __indexProvider?: IndexProvider;
  readonly __retrievalProvider?: RetrievalProvider;
}

export function requireMemoryStoreWithProvider(
  store: MemoryStore,
): asserts store is MemoryStoreWithProvider {
  if ((store as MemoryStoreWithProvider).__storageProvider === undefined) {
    throw new MemoryProviderStackRequiredError();
  }
}

export function createInMemoryMemoryStore(): MemoryStoreWithProvider {
  const storageProvider = new InMemoryStorageProvider();
  const indexProvider = new InMemoryIndexProvider();
  const retrievalProvider = new InMemoryRetrievalProvider(storageProvider, indexProvider);

  const store: MemoryStoreWithProvider = {
    __storageProvider: storageProvider,
    __indexProvider: indexProvider,
    __retrievalProvider: retrievalProvider,
    put: async () => undefined,
    get: async (): Promise<MemoryRecord | undefined> => storageProvider.listAll()[0],
    remove: async () => undefined,
    search: async (): Promise<SearchResult> => {
      const records = storageProvider.listAll();
      return Object.freeze({ records, total: records.length });
    },
  };

  return Object.freeze(store);
}

export function resolveIndexProvider(store: MemoryStoreWithProvider): IndexProvider {
  if (store.__indexProvider !== undefined) {
    return store.__indexProvider;
  }

  return new InMemoryIndexProvider();
}

export function resolveRetrievalProvider(
  store: MemoryStoreWithProvider,
  storageProvider: StorageProvider,
  indexProvider: IndexProvider,
): RetrievalProvider {
  if (store.__retrievalProvider !== undefined) {
    return store.__retrievalProvider;
  }

  return new InMemoryRetrievalProvider(storageProvider, indexProvider as InMemoryIndexProvider);
}

export function resolveStorageProvider(store: MemoryStoreWithProvider): StorageProvider {
  return store.__storageProvider;
}
