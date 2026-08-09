import { normalizeForSearch } from '@atlas/core';
import type { MemoryEngine, MemoryRecord } from '@atlas/memory';

export interface RetrievalRequest {
  readonly query: string;
  readonly namespaceId?: string;
  readonly limit?: number;
}

export interface RetrievedMemoryItem {
  readonly recordId: string;
  readonly recordType: string;
  readonly text: string;
  readonly score: number;
  readonly timestamp: string;
}

export interface RetrievalContext {
  readonly query: string;
  readonly items: readonly RetrievedMemoryItem[];
  readonly totalCandidates: number;
}

export interface RetrievalResult {
  readonly success: boolean;
  readonly context: RetrievalContext;
}

function extractSearchableText(record: MemoryRecord): string {
  if (typeof record.content === 'string') {
    return record.content;
  }

  if (
    record.content !== null &&
    typeof record.content === 'object' &&
    'text' in record.content &&
    typeof (record.content as { text?: unknown }).text === 'string'
  ) {
    return (record.content as { text: string }).text;
  }

  return JSON.stringify(record.content);
}

function scoreRecord(record: MemoryRecord, query: string): number {
  const text = normalizeForSearch(extractSearchableText(record));
  const terms = query
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 0)
    .map((term) => normalizeForSearch(term));

  if (terms.length === 0) {
    return 0;
  }

  return terms.reduce((score, term) => (text.includes(term) ? score + 1 : score), 0);
}

function rankCandidates(records: readonly MemoryRecord[], query: string): MemoryRecord[] {
  return [...records].sort((left, right) => {
    const scoreDifference = scoreRecord(right, query) - scoreRecord(left, query);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return right.timestamp.localeCompare(left.timestamp);
  });
}

function toRetrievedItem(record: MemoryRecord, query: string): RetrievedMemoryItem {
  return Object.freeze({
    recordId: record.id,
    recordType: record.type,
    text: extractSearchableText(record),
    score: scoreRecord(record, query),
    timestamp: record.timestamp,
  });
}

function emptyContext(query: string): RetrievalContext {
  return Object.freeze({
    query,
    items: Object.freeze([]),
    totalCandidates: 0,
  });
}

/**
 * ADR-0005 D8 — canonical Retrieval pipeline (MVP).
 * Memory Access → Candidate Retrieval → Ranking → Filtering/Selection → Context
 */
export async function runRetrievalPipeline(
  memoryEngine: MemoryEngine,
  request: RetrievalRequest,
): Promise<RetrievalResult> {
  const namespaceId = request.namespaceId ?? 'cli.default';
  const limit = request.limit ?? 5;

  const searchResult = await memoryEngine.search({ namespaceId });

  if (!searchResult.ok) {
    return Object.freeze({
      success: false,
      context: emptyContext(request.query),
    });
  }

  const candidates = searchResult.value.records;
  const ranked = rankCandidates(candidates, request.query);
  const relevant = ranked.filter((record) => scoreRecord(record, request.query) > 0);
  const selected = (relevant.length > 0 ? relevant : ranked).slice(0, limit);
  const items = Object.freeze(selected.map((record) => toRetrievedItem(record, request.query)));

  return Object.freeze({
    success: true,
    context: Object.freeze({
      query: request.query,
      items,
      totalCandidates: candidates.length,
    }),
  });
}
