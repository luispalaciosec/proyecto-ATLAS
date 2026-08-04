import type { ConsistencyProvider } from '../../domain/interfaces/consistency-provider.js';
import { MemoryEngine } from '../../engine/MemoryEngine.js';
import { createDefaultConsistencyProvider } from '../create-memory-providers.js';
import { InMemoryIndexProvider } from '../index/in-memory-index-provider.js';

import { JsonFileStorageProvider } from './json-file-storage-provider.js';
import { createMemoryStoreFromStorageProvider } from './memory-store-from-storage-provider.js';

/**
 * Creates a MemoryEngine backed by a JSON file Storage Provider.
 */
export function createJsonFileMemoryEngine(
  filePath: string,
  consistencyProvider: ConsistencyProvider = createDefaultConsistencyProvider(),
): MemoryEngine {
  const storageProvider = new JsonFileStorageProvider({ filePath });
  const indexProvider = new InMemoryIndexProvider();

  for (const record of storageProvider.listAll()) {
    void indexProvider.updateIndex(record);
  }

  const memoryStore = createMemoryStoreFromStorageProvider(storageProvider, indexProvider);

  return new MemoryEngine(memoryStore, consistencyProvider);
}
