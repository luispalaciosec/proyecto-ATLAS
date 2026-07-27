import type { MemoryRecord, SearchResult } from '../domain/types/memory-types.js';

import type { StorageProvider } from '../providers/storage/storage-provider.js';

/**
 * Internal persistence facade subordinate to Storage Provider (ADR-0003).
 */
export interface InternalStoreGateway {
  put(record: MemoryRecord): Promise<void>;
  get(recordId?: string): Promise<MemoryRecord | undefined>;
  remove(recordId: string): Promise<void>;
  search(): Promise<SearchResult>;
}

export function createStoreGateway(storageProvider: StorageProvider): InternalStoreGateway {
  return Object.freeze({
    put: (record: MemoryRecord) => storageProvider.store(record),
    get: (recordId?: string) => {
      if (recordId === undefined) {
        const listable = storageProvider as StorageProvider & {
          listAll?: () => readonly MemoryRecord[];
        };
        if (typeof listable.listAll === 'function') {
          return Promise.resolve(listable.listAll()[0]);
        }

        return Promise.resolve(undefined);
      }

      return storageProvider.load(recordId);
    },
    remove: (recordId: string) => storageProvider.delete(recordId),
    search: async (): Promise<SearchResult> => {
      const listable = storageProvider as StorageProvider & {
        listAll?: () => readonly MemoryRecord[];
      };

      if (typeof listable.listAll === 'function') {
        const records = listable.listAll();
        return Object.freeze({ records, total: records.length });
      }

      return Object.freeze({ records: [], total: 0 });
    },
  });
}
