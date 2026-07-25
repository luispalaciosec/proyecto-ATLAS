import type { MemoryRecord } from '../../domain/types/memory-types.js';

export interface UpdateMemoryResponse {
  readonly record: MemoryRecord;
  readonly updated: boolean;
  readonly version: number;
}
