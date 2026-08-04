import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

import type { MemoryRecord } from '../../domain/types/memory-types.js';

import type {
  StorageProvider,
  StorageProviderHealth,
  StorageProviderStatistics,
} from './storage-provider.js';

interface JsonMemorySnapshot {
  readonly version: 1;
  readonly records: readonly MemoryRecord[];
}

export interface JsonFileStorageProviderOptions {
  readonly filePath: string;
}

function cloneRecord(record: MemoryRecord): MemoryRecord {
  return Object.freeze({
    ...record,
    metadata: Object.freeze({ ...record.metadata }),
  });
}

/**
 * ATLAS-MEMORY-CONTRACT-002 — JSON file Storage Provider (MVP persistence).
 */
export class JsonFileStorageProvider implements StorageProvider {
  readonly #filePath: string;
  readonly #records = new Map<string, MemoryRecord>();

  constructor(options: JsonFileStorageProviderOptions) {
    this.#filePath = options.filePath;
    this.initializeSync();
  }

  initializeSync(): void {
    if (!existsSync(this.#filePath)) {
      return;
    }

    try {
      const raw = JSON.parse(readFileSync(this.#filePath, 'utf8')) as JsonMemorySnapshot;

      if (raw.version !== 1 || !Array.isArray(raw.records)) {
        return;
      }

      for (const record of raw.records) {
        if (typeof record.id === 'string') {
          this.#records.set(record.id, cloneRecord(record));
        }
      }
    } catch {
      return;
    }
  }

  async store(record: MemoryRecord): Promise<void> {
    this.#records.set(record.id, cloneRecord(record));
    this.#persistSync();
  }

  async update(record: MemoryRecord): Promise<void> {
    this.#records.set(record.id, cloneRecord(record));
    this.#persistSync();
  }

  async delete(recordId: string): Promise<void> {
    this.#records.delete(recordId);
    this.#persistSync();
  }

  async load(recordId: string): Promise<MemoryRecord | undefined> {
    return this.#records.get(recordId);
  }

  async exists(recordId: string): Promise<boolean> {
    return this.#records.has(recordId);
  }

  async loadBatch(recordIds: readonly string[]): Promise<readonly MemoryRecord[]> {
    return Object.freeze(
      recordIds
        .map((recordId) => this.#records.get(recordId))
        .filter((record): record is MemoryRecord => record !== undefined),
    );
  }

  async statistics(): Promise<StorageProviderStatistics> {
    return Object.freeze({ recordCount: this.#records.size });
  }

  async health(): Promise<StorageProviderHealth> {
    return Object.freeze({ available: true });
  }

  /** @internal Retrieval and gateway support */
  listAll(): readonly MemoryRecord[] {
    return Object.freeze([...this.#records.values()]);
  }

  /** @internal Retrieval fallback for persisted storage */
  async loadAllRecords(): Promise<readonly MemoryRecord[]> {
    return this.listAll();
  }

  #persistSync(): void {
    mkdirSync(dirname(this.#filePath), { recursive: true });

    const snapshot: JsonMemorySnapshot = Object.freeze({
      version: 1,
      records: Object.freeze([...this.#records.values()]),
    });

    const tempPath = `${this.#filePath}.tmp`;
    writeFileSync(tempPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    renameSync(tempPath, this.#filePath);
  }
}
