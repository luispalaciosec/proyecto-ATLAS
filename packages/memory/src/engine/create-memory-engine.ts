import type { ConsistencyProvider } from '../domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../domain/interfaces/memory-store.js';
import { createInMemoryProviderStack } from '../providers/create-memory-providers.js';

import { MemoryEngine } from './MemoryEngine.js';

export function createMemoryEngine(consistencyProvider: ConsistencyProvider): MemoryEngine;
export function createMemoryEngine(
  store: MemoryStore,
  consistencyProvider: ConsistencyProvider,
): MemoryEngine;
export function createMemoryEngine(
  storeOrConsistency: MemoryStore | ConsistencyProvider,
  consistencyProvider?: ConsistencyProvider,
): MemoryEngine {
  if (consistencyProvider === undefined) {
    const stack = createInMemoryProviderStack();
    return new MemoryEngine(stack.memoryStore, storeOrConsistency as ConsistencyProvider);
  }

  return new MemoryEngine(storeOrConsistency as MemoryStore, consistencyProvider);
}
