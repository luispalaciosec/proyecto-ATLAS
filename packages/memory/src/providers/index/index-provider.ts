import type { MemoryRecord } from '../../domain/types/memory-types.js';
import type { ValidationResult } from '../../domain/types/memory-types.js';

/**
 * ATLAS-MEMORY-CONTRACT-003 — Index Provider (internal).
 */
export interface IndexProviderHealth {
  readonly available: boolean;
}

export interface IndexProviderStatistics {
  readonly entryCount: number;
}

export interface IndexProvider {
  updateIndex(record: MemoryRecord): Promise<void>;
  deleteIndexEntry(recordId: string): Promise<void>;
  validateIndex(): Promise<ValidationResult>;
  statistics(): Promise<IndexProviderStatistics>;
  healthCheck(): Promise<IndexProviderHealth>;
}
