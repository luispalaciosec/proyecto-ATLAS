import type { MemoryQuery } from '../../domain/types/memory-types.js';

export interface SearchMemoryRequest {
  readonly sessionId?: string;
  readonly query: MemoryQuery;
}
