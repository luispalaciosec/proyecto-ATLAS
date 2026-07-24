import type { MemoryRecord, SearchResult } from '../types/memory-types.js';

/**
 * ATLAS-MEMORY-008 §11 / ATLAS-MEMORY-CONTRACT-007
 */
export interface MemoryStore {
  put(): Promise<void>;
  get(): Promise<MemoryRecord | undefined>;
  remove(): Promise<void>;
  search(): Promise<SearchResult>;
}
