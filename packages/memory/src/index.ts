/**
 * @atlas/memory — public API
 * @see ADR-0003 — Memory Architecture Resolution
 * @see ATLAS-MEMORY-008 — Public API
 */
export { MemoryEngine, createMemoryEngine } from './engine/index.js';
export { createJsonFileMemoryEngine } from './providers/storage/create-json-file-memory-engine.js';

export type {
  MemoryRecord,
  MemorySnapshot,
  MemoryQuery,
  SearchResult,
  RetrievalResult,
  SimilarityResult,
  MemoryStatistics,
} from './domain/types/memory-types.js';

export type { MemoryMetadataData as MemoryMetadata } from './domain/value-objects/memory-metadata.js';

export {
  MEMORY_NOT_FOUND,
  MEMORY_STORAGE_ERROR,
  MEMORY_INDEX_ERROR,
  MEMORY_RETRIEVAL_ERROR,
  INVALID_MEMORY_RECORD,
  INVALID_QUERY,
} from './domain/errors/memory-error-codes.js';

export type { Result } from '@atlas/core';
