import type { MemoryQuery, MemoryRecord, SearchResult } from '../../domain/types/memory-types.js';

/**
 * ATLAS-MEMORY-CONTRACT-004 — Retrieval Provider (internal).
 */
export interface RetrievalProviderHealth {
  readonly available: boolean;
}

export interface RetrievalProviderStatistics {
  readonly totalRetrievals: number;
}

export interface RetrievalProvider {
  retrieveById(recordId: string): Promise<MemoryRecord | undefined>;
  retrieveBatch(recordIds: readonly string[]): Promise<readonly MemoryRecord[]>;
  search(query: MemoryQuery): Promise<SearchResult>;
  statistics(): Promise<RetrievalProviderStatistics>;
  health(): Promise<RetrievalProviderHealth>;
}
