import type { MemoryRecord } from '../../domain/types/memory-types.js';

export interface StoreMemoryResponse {
  readonly record: MemoryRecord;
  readonly created: boolean;
  readonly version: number;
}
