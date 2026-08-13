import { normalizeForSearch } from '@atlas/core';
import type { EventBus } from '@atlas/events';
import {
  createJsonFileMemoryEngine,
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

export interface StorePlanExecutionOptions {
  readonly goal: string;
  readonly goalId: string;
  readonly workflowId: string;
  readonly strategyId: string;
  readonly sessionId: string;
  readonly outputCount: number;
  readonly artifactCount: number;
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
const PLAN_EXECUTION_RECORD_TYPE = 'PlanExecution';
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

const MIN_SEARCH_TOKEN_LENGTH = 3;
const MAX_SINGULAR_PREFIX_GAP = 2;

function tokenizeForSearch(text: string): readonly string[] {
  return normalizeForSearch(text).split(/\s+/).filter((token) => token.length > 0);
}

function tokenMatchesQuery(queryToken: string, textTokens: readonly string[]): boolean {
  return textTokens.some((textToken) => {
    if (textToken.startsWith(queryToken)) {
      return true;
    }

    if (!queryToken.startsWith(textToken)) {
      return false;
    }

    return queryToken.length - textToken.length <= MAX_SINGULAR_PREFIX_GAP;
  });
}

export function matchesContentQuery(record: MemoryRecord, query: string): boolean {
  const normalizedQuery = normalizeForSearch(query.trim());

  if (normalizedQuery.length === 0) {
    return true;
  }

  const normalizedText = normalizeForSearch(extractSearchableText(record));
  const queryTokens = tokenizeForSearch(normalizedQuery).filter(
    (token) => token.length >= MIN_SEARCH_TOKEN_LENGTH,
  );

  if (queryTokens.length === 0) {
    return normalizedText.includes(normalizedQuery);
  }

  const textTokens = tokenizeForSearch(normalizedText);

  return queryTokens.every((queryToken) => tokenMatchesQuery(queryToken, textTokens));
}

function createRecordId(): string {
  return `record.cli.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
}

function createMemoryEngineForOptions(memoryOptions: AtlasMemoryOptions): MemoryEngine {
  const consistencyProvider = createInlineConsistencyProvider();
  const storageFilePath =
    typeof memoryOptions.storageFilePath === 'string' ? memoryOptions.storageFilePath : undefined;

  if (storageFilePath !== undefined && storageFilePath.trim().length > 0) {
    return createJsonFileMemoryEngine(storageFilePath, consistencyProvider);
  }

  return createMemoryEngine(consistencyProvider);
}

/**
 * Public memory facade — wraps @atlas/memory MemoryEngine via its public API only.
 */
export class MemoryModule {
  readonly #engine: MemoryEngine;
  readonly #defaultWorkspace: AtlasWorkspaceOptions;

  constructor(
    _bus: EventBus,
    memoryOptions: AtlasMemoryOptions = {},
    workspace: AtlasWorkspaceOptions = {},
  ) {
    this.#defaultWorkspace = workspace;
    this.#engine = createMemoryEngineForOptions(memoryOptions);
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

  async storePlanExecution(options: StorePlanExecutionOptions): Promise<StoreMemoryContentResult> {
    return this.storeContent({
      content: options.goal,
      recordType: PLAN_EXECUTION_RECORD_TYPE,
      metadata: Object.freeze({
        goalId: options.goalId,
        workflowId: options.workflowId,
        strategyId: options.strategyId,
        sessionId: options.sessionId,
        outputCount: options.outputCount,
        artifactCount: options.artifactCount,
        source: 'atlas-plan',
      }),
    });
  }

  async searchContent(options: SearchMemoryContentOptions): Promise<SearchMemoryContentResult> {
    const query: MemoryQuery = Object.freeze({
      namespaceId: DEFAULT_NAMESPACE_ID,
      ...(options.recordType !== undefined ? { recordType: options.recordType } : {}),
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
