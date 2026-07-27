import type { MemoryRecord } from '../../domain/types/memory-types.js';
import type { ValidationResult } from '../../domain/types/memory-types.js';

import type {
  IndexProvider,
  IndexProviderHealth,
  IndexProviderStatistics,
} from './index-provider.js';

interface IndexEntry {
  readonly recordId: string;
  readonly recordType: string;
  readonly namespaceId?: string;
  readonly collectionId?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export class InMemoryIndexProvider implements IndexProvider {
  private readonly entries = new Map<string, IndexEntry>();

  async updateIndex(record: MemoryRecord): Promise<void> {
    this.entries.set(
      record.id,
      Object.freeze({
        recordId: record.id,
        recordType: record.type,
        namespaceId:
          typeof record.metadata.namespaceId === 'string' ? record.metadata.namespaceId : undefined,
        collectionId:
          typeof record.metadata.collectionId === 'string'
            ? record.metadata.collectionId
            : undefined,
        metadata: Object.freeze({ ...record.metadata }),
      }),
    );
  }

  async deleteIndexEntry(recordId: string): Promise<void> {
    this.entries.delete(recordId);
  }

  async validateIndex(): Promise<ValidationResult> {
    return Object.freeze({ valid: true, issues: [] });
  }

  async statistics(): Promise<IndexProviderStatistics> {
    return Object.freeze({ entryCount: this.entries.size });
  }

  async healthCheck(): Promise<IndexProviderHealth> {
    return Object.freeze({ available: true });
  }

  /** @internal Used by Retrieval Provider */
  listEntries(): readonly IndexEntry[] {
    return Object.freeze([...this.entries.values()]);
  }

  /** @internal Used by Retrieval Provider */
  getEntry(recordId: string): IndexEntry | undefined {
    return this.entries.get(recordId);
  }
}
