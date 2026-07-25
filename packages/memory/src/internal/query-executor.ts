import type { MemoryQuery, MemoryRecord, SearchResult } from '../domain/types/memory-types.js';

function matchesMetadata(
  recordMetadata: Readonly<Record<string, unknown>>,
  queryMetadata: Readonly<Record<string, unknown>>,
): boolean {
  return Object.entries(queryMetadata).every(([key, value]) => recordMetadata[key] === value);
}

export function applyMemoryQuery(
  searchResult: SearchResult,
  query: MemoryQuery,
): SearchResult {
  let records = [...searchResult.records];

  if (query.namespaceId !== undefined) {
    records = records.filter(
      (record) => record.metadata.namespaceId === query.namespaceId,
    );
  }

  if (query.collectionId !== undefined) {
    records = records.filter(
      (record) => record.metadata.collectionId === query.collectionId,
    );
  }

  if (query.recordType !== undefined) {
    records = records.filter((record) => record.type === query.recordType);
  }

  if (query.metadata !== undefined && Object.keys(query.metadata).length > 0) {
    const queryMetadata = query.metadata;
    records = records.filter((record) => matchesMetadata(record.metadata, queryMetadata));
  }

  return Object.freeze({
    records: Object.freeze(records),
    total: records.length,
  });
}

export function findRecordById(
  records: readonly MemoryRecord[],
  recordId: string,
): MemoryRecord | undefined {
  return records.find((record) => record.id === recordId);
}
