import type { MemoryRecord } from '../../domain/types/memory-types.js';

export interface DeleteMemoryRequest {
  readonly sessionId?: string;
  readonly record: MemoryRecord;
}
