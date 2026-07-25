import type { MemoryRecord } from '../../domain/types/memory-types.js';

export interface UpdateMemoryRequest {
  readonly sessionId?: string;
  readonly record: MemoryRecord;
  readonly metadata?: Readonly<Record<string, unknown>>;
}
