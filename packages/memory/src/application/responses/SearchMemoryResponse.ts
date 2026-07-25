import type { MemoryQuery, MemoryRecord } from '../../domain/types/memory-types.js';

export interface SearchMemoryResponse {
  readonly records: readonly MemoryRecord[];
  readonly total: number;
  readonly query: MemoryQuery;
}
