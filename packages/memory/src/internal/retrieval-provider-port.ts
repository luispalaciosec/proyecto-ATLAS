import type { MemoryQuery, MemoryRecord, SearchResult } from '../domain/types/memory-types.js';

import { applyMemoryQuery, findRecordById } from './query-executor.js';
import type { InternalStoreGateway } from './store-gateway.js';

/**
 * Internal retrieval port (CONTRACT-004 pipeline) — stub until Sprint 11D.
 */
export interface RetrievalProviderPort {
  retrieveById(recordId: string): Promise<MemoryRecord | undefined>;
  search(query: MemoryQuery): Promise<SearchResult>;
}

export function createRetrievalProviderPort(
  gateway: InternalStoreGateway,
): RetrievalProviderPort {
  return Object.freeze({
    async retrieveById(recordId: string): Promise<MemoryRecord | undefined> {
      const direct = await gateway.get();
      if (direct !== undefined && direct.id === recordId) {
        return direct;
      }

      const searchResult = await gateway.search();
      return findRecordById(searchResult.records, recordId);
    },

    async search(query: MemoryQuery): Promise<SearchResult> {
      const searchResult = await gateway.search();
      return applyMemoryQuery(searchResult, query);
    },
  });
}
