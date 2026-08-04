import type { EventBus } from '@atlas/events';
import {
  createMemoryEngine,
  type MemoryEngine,
  type MemoryRecord,
  type MemoryQuery,
} from '@atlas/memory';

import type { AtlasMemoryOptions, AtlasWorkspaceOptions } from '../atlas/options.js';

export interface StoreMemoryContentOptions {
  readonly content: string;
  readonly recordType?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface StoreMemoryContentResult {
  readonly recordId: string;
  readonly record: MemoryRecord;
}

export interface SearchMemoryContentOptions {
  readonly query: string;
  readonly recordType?: string;
}

export interface SearchMemoryContentResult {
  readonly records: readonly MemoryRecord[];
  readonly total: number;
  readonly query: string;
}

const DEFAULT_RECORD_TYPE = 'CliMemory';
const DEFAULT_NAMESPACE_ID = 'cli.default';

function createInlineConsistencyProvider() {
  return {
    validateRecord: async () => ({ valid: true as const, issues: [] as const }),
    validateStore: async () => ({ valid: true as const, issues: [] as const }),
    validateIndexes: async () => ({ valid: true as const, issues: [] as const }),
    validateSessions: async () => ({ valid: true as const, issues: [] as const }),
    repair: async () => ({ repaired: 0, skipped: 0, failed: 0 }),
  };
}

function extractSearchableText(record: MemoryRecord): string {
  if (typeof record.content === 'string') {
    return record.content;
  }

  if (
    record.content !== null &&
    typeof record.content === 'object' &&
    'text' in record.content &&
    typeof (record.content as { text?: unknown }).text === 'string'
  ) {
    return (record.content as { text: string }).text;
  }

  return JSON.stringify(record.content);
}

function matchesContentQuery(record: MemoryRecord, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length === 0) {
    return true;
  }

  return extractSearchableText(record).toLowerCase().includes(normalizedQuery);
}

function createRecordId(): string {
  return `record.cli.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Public memory facade — wraps @atlas/memory MemoryEngine via its public API only.
 */
export class MemoryModule {
  readonly #engine: MemoryEngine;
  readonly #defaultWorkspace: AtlasWorkspaceOptions;

  constructor(
    _bus: EventBus,
    _memoryOptions: AtlasMemoryOptions = {},
    workspace: AtlasWorkspaceOptions = {},
  ) {
    this.#defaultWorkspace = workspace;
    this.#engine = createMemoryEngine(createInlineConsistencyProvider());
  }

  getEngine(): MemoryEngine {
    return this.#engine;
  }

  async storeContent(options: StoreMemoryContentOptions): Promise<StoreMemoryContentResult> {
    const recordType = options.recordType ?? DEFAULT_RECORD_TYPE;
    const record: MemoryRecord = Object.freeze({
      id: createRecordId(),
      type: recordType,
      content: Object.freeze({ text: options.content }),
      metadata: Object.freeze({
        namespaceId: DEFAULT_NAMESPACE_ID,
        workspace: this.#defaultWorkspace.name ?? 'default',
        source: 'atlas-cli',
        ...options.metadata,
      }),
      timestamp: new Date().toISOString(),
    });

    const result = await this.#engine.store(record);

    if (!result.ok) {
      throw new Error(result.error.message);
    }

    return Object.freeze({
      recordId: result.value.id,
      record: result.value,
    });
  }

  async searchContent(options: SearchMemoryContentOptions): Promise<SearchMemoryContentResult> {
    const recordType = options.recordType ?? DEFAULT_RECORD_TYPE;
    const query: MemoryQuery = Object.freeze({
      recordType,
      namespaceId: DEFAULT_NAMESPACE_ID,
    });

    const result = await this.#engine.search(query);

    if (!result.ok) {
      throw new Error(result.error.message);
    }

    const records = Object.freeze(
      result.value.records.filter((record) => matchesContentQuery(record, options.query)),
    );

    return Object.freeze({
      records,
      total: records.length,
      query: options.query,
    });
  }
}
