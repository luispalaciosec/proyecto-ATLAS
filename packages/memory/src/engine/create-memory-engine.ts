import type { ConsistencyProvider } from '../domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../domain/interfaces/memory-store.js';

import { MemoryEngine } from './MemoryEngine.js';

export function createMemoryEngine(
  store: MemoryStore,
  consistencyProvider: ConsistencyProvider,
): MemoryEngine {
  return new MemoryEngine(store, consistencyProvider);
}
