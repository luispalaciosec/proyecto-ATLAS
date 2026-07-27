import type { MemoryRecord } from '../../domain/types/memory-types.js';

import type {
  StorageProvider,
  StorageProviderHealth,
  StorageProviderStatistics,
} from './storage-provider.js';

function cloneRecord(record: MemoryRecord): MemoryRecord {
  return Object.freeze({
    ...record,
    metadata: Object.freeze({ ...record.metadata }),
  });
}

export class InMemoryStorageProvider implements StorageProvider {
  private readonly records = new Map<string, MemoryRecord>();

  async store(record: MemoryRecord): Promise<void> {
    this.records.set(record.id, cloneRecord(record));
  }

  async update(record: MemoryRecord): Promise<void> {
    this.records.set(record.id, cloneRecord(record));
  }

  async delete(recordId: string): Promise<void> {
    this.records.delete(recordId);
  }

  async load(recordId: string): Promise<MemoryRecord | undefined> {
    return this.records.get(recordId);
  }

  async exists(recordId: string): Promise<boolean> {
    return this.records.has(recordId);
  }

  async loadBatch(recordIds: readonly string[]): Promise<readonly MemoryRecord[]> {
    return Object.freeze(
      recordIds
        .map((recordId) => this.records.get(recordId))
        .filter((record): record is MemoryRecord => record !== undefined),
    );
  }

  async statistics(): Promise<StorageProviderStatistics> {
    return Object.freeze({ recordCount: this.records.size });
  }

  async health(): Promise<StorageProviderHealth> {
    return Object.freeze({ available: true });
  }

  /** @internal Test and gateway support */
  listAll(): readonly MemoryRecord[] {
    return Object.freeze([...this.records.values()]);
  }
}
