import type { MemoryStore } from '../../domain/interfaces/memory-store.js';
import type { MemoryRecord } from '../../domain/types/memory-types.js';

import type {
  StorageProvider,
  StorageProviderHealth,
  StorageProviderStatistics,
} from './storage-provider.js';

/**
 * Adapts parameterless MemoryStore mocks to StorageProvider for backward-compatible tests.
 */
export class LegacyMemoryStoreStorageAdapter implements StorageProvider {
  private readonly records = new Map<string, MemoryRecord>();

  constructor(private readonly memoryStore: MemoryStore) {}

  async store(record: MemoryRecord): Promise<void> {
    this.records.set(record.id, record);
    await this.memoryStore.put();
  }

  async update(record: MemoryRecord): Promise<void> {
    this.records.set(record.id, record);
    await this.memoryStore.put();
  }

  async delete(recordId: string): Promise<void> {
    this.records.delete(recordId);
    await this.memoryStore.remove();
  }

  async load(recordId: string): Promise<MemoryRecord | undefined> {
    const cached = this.records.get(recordId);
    if (cached !== undefined) {
      return cached;
    }

    const loaded = await this.memoryStore.get();
    if (loaded !== undefined && loaded.id === recordId) {
      return loaded;
    }

    const searchResult = await this.memoryStore.search();
    return searchResult.records.find((record) => record.id === recordId);
  }

  async exists(recordId: string): Promise<boolean> {
    return (await this.load(recordId)) !== undefined;
  }

  async loadBatch(recordIds: readonly string[]): Promise<readonly MemoryRecord[]> {
    const records = await Promise.all(recordIds.map((recordId) => this.load(recordId)));
    return Object.freeze(records.filter((record): record is MemoryRecord => record !== undefined));
  }

  async statistics(): Promise<StorageProviderStatistics> {
    return Object.freeze({ recordCount: this.records.size });
  }

  async health(): Promise<StorageProviderHealth> {
    return Object.freeze({ available: true });
  }

  /** @internal Backing store search for legacy test mocks */
  listAll(): readonly MemoryRecord[] {
    return Object.freeze([...this.records.values()]);
  }

  /** @internal Backing store search for legacy test mocks without prior store() calls */
  async loadAllRecords(): Promise<readonly MemoryRecord[]> {
    if (this.records.size > 0) {
      return Object.freeze([...this.records.values()]);
    }

    const searchResult = await this.memoryStore.search();
    return searchResult.records;
  }
}
