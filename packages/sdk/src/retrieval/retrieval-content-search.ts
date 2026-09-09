import type { MemoryEngine, MemoryRecord } from '@atlas/memory';
import { runRetrievalPipeline, type RetrievedMemoryItem } from '@atlas/retrieval';

import type { SearchMemoryContentResult } from '../modules/memory-module.js';

export interface SearchContentViaRetrievalOptions {
  readonly query: string;
  readonly namespaceId?: string;
  readonly limit?: number;
}

const DEFAULT_SEARCH_LIMIT = 128;

async function resolveRecordsFromItems(
  memoryEngine: MemoryEngine,
  items: readonly RetrievedMemoryItem[],
): Promise<readonly MemoryRecord[]> {
  const records: MemoryRecord[] = [];

  for (const item of items) {
    const result = await memoryEngine.retrieve({ recordId: item.recordId });

    if (result.ok) {
      records.push(result.value);
    }
  }

  return Object.freeze(records);
}

/**
 * Canonical product search path — ADR-0005 via @atlas/retrieval.
 * Returns only items with score > 0 (no ranked fallback for zero-match queries).
 */
export async function searchContentViaRetrieval(
  memoryEngine: MemoryEngine,
  options: SearchContentViaRetrievalOptions,
): Promise<SearchMemoryContentResult> {
  const trimmedQuery = options.query.trim();
  const namespaceId = options.namespaceId ?? 'cli.default';
  const limit = options.limit ?? DEFAULT_SEARCH_LIMIT;

  if (trimmedQuery.length === 0) {
    return Object.freeze({
      records: Object.freeze([]),
      total: 0,
      query: options.query,
    });
  }

  const retrieval = await runRetrievalPipeline(memoryEngine, {
    query: trimmedQuery,
    namespaceId,
    limit,
  });

  if (!retrieval.success) {
    return Object.freeze({
      records: Object.freeze([]),
      total: 0,
      query: options.query,
    });
  }

  const matchedItems = retrieval.context.items.filter((item) => item.score > 0);
  const records = await resolveRecordsFromItems(memoryEngine, matchedItems);

  return Object.freeze({
    records,
    total: records.length,
    query: options.query,
  });
}
