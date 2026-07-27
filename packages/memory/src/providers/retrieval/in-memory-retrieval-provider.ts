import { applyMemoryQuery } from '../../internal/query-executor.js';
import type { MemoryQuery, MemoryRecord, SearchResult } from '../../domain/types/memory-types.js';
import type { InMemoryIndexProvider } from '../index/in-memory-index-provider.js';
import type { StorageProvider } from '../storage/storage-provider.js';

import type {
  RetrievalProvider,
  RetrievalProviderHealth,
  RetrievalProviderStatistics,
} from './retrieval-provider.js';

export class InMemoryRetrievalProvider implements RetrievalProvider {
  private retrievalCount = 0;

  constructor(
    private readonly storageProvider: StorageProvider,
    private readonly indexProvider: InMemoryIndexProvider,
  ) {}

  async retrieveById(recordId: string): Promise<MemoryRecord | undefined> {
    this.retrievalCount += 1;
    return this.storageProvider.load(recordId);
  }

  async retrieveBatch(recordIds: readonly string[]): Promise<readonly MemoryRecord[]> {
    this.retrievalCount += recordIds.length;
    return this.storageProvider.loadBatch(recordIds);
  }

  async search(query: MemoryQuery): Promise<SearchResult> {
    this.retrievalCount += 1;

    const indexedIds = this.indexProvider.listEntries().map((entry) => entry.recordId);
    const records =
      indexedIds.length > 0
        ? await this.storageProvider.loadBatch(indexedIds)
        : await this.loadAllFromStorageFallback();

    return applyMemoryQuery(
      Object.freeze({
        records,
        total: records.length,
      }),
      query,
    );
  }

  async statistics(): Promise<RetrievalProviderStatistics> {
    return Object.freeze({ totalRetrievals: this.retrievalCount });
  }

  async health(): Promise<RetrievalProviderHealth> {
    return Object.freeze({ available: true });
  }

  private async loadAllFromStorageFallback(): Promise<readonly MemoryRecord[]> {
    const storage = this.storageProvider as StorageProvider & {
      listAll?: () => readonly MemoryRecord[];
      loadAllRecords?: () => Promise<readonly MemoryRecord[]>;
    };

    if (typeof storage.listAll === 'function') {
      const records = storage.listAll();
      if (records.length > 0) {
        return records;
      }
    }

    if (typeof storage.loadAllRecords === 'function') {
      return storage.loadAllRecords();
    }

    return Object.freeze([]);
  }
}
