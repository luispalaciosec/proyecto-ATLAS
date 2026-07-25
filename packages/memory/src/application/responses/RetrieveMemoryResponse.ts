import type { MemoryRecord } from '../../domain/types/memory-types.js';

export interface RetrieveMemoryResponse {
  readonly record?: MemoryRecord;
  readonly found: boolean;
}
