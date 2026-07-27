import type { MemoryRecord } from '../../domain/types/memory-types.js';

/**
 * ATLAS-MEMORY-CONTRACT-002 — Storage Provider (internal).
 */
export interface StorageProviderStatistics {
  readonly recordCount: number;
}

export interface StorageProviderHealth {
  readonly available: boolean;
}

export interface StorageProvider {
  store(record: MemoryRecord): Promise<void>;
  update(record: MemoryRecord): Promise<void>;
  delete(recordId: string): Promise<void>;
  load(recordId: string): Promise<MemoryRecord | undefined>;
  exists(recordId: string): Promise<boolean>;
  loadBatch(recordIds: readonly string[]): Promise<readonly MemoryRecord[]>;
  statistics(): Promise<StorageProviderStatistics>;
  health(): Promise<StorageProviderHealth>;
}
