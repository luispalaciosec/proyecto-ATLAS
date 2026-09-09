import type { EventBus } from '@atlas/events';
import type { MemoryEngine } from '@atlas/memory';
import {
  runRetrievalPipeline,
  type RetrievalRequest,
  type RetrievalResult,
} from '@atlas/retrieval';

import type { AtlasRetrievalOptions, AtlasWorkspaceOptions } from '../atlas/options.js';
import type { SearchMemoryContentResult } from './memory-module.js';
import { searchContentViaRetrieval } from '../retrieval/retrieval-content-search.js';

export interface SearchContentOptions {
  readonly query: string;
  readonly limit?: number;
}

export interface RetrieveForGoalOptions {
  readonly namespaceId?: string;
  readonly limit?: number;
}

/**
 * Public retrieval facade — ADR-0005 D8 via @atlas/retrieval, MemoryEngine public API only.
 */
export class RetrievalModule {
  readonly #memoryEngine: MemoryEngine;
  readonly #defaultWorkspace: AtlasWorkspaceOptions;
  readonly #defaultNamespaceId: string;

  constructor(
    _bus: EventBus,
    _retrievalOptions: AtlasRetrievalOptions = {},
    memoryEngine: MemoryEngine,
    workspace: AtlasWorkspaceOptions = {},
  ) {
    this.#memoryEngine = memoryEngine;
    this.#defaultWorkspace = workspace;
    this.#defaultNamespaceId =
      typeof _retrievalOptions.namespaceId === 'string'
        ? _retrievalOptions.namespaceId
        : 'cli.default';
  }

  retrieveForGoal(goal: string, options: RetrieveForGoalOptions = {}): Promise<RetrievalResult> {
    const request: RetrievalRequest = Object.freeze({
      query: goal,
      namespaceId: options.namespaceId ?? this.#defaultNamespaceId,
      limit: options.limit ?? 5,
    });

    return runRetrievalPipeline(this.#memoryEngine, request);
  }

  searchContent(options: SearchContentOptions): Promise<SearchMemoryContentResult> {
    return searchContentViaRetrieval(this.#memoryEngine, {
      query: options.query,
      namespaceId: this.#defaultNamespaceId,
      ...(options.limit !== undefined ? { limit: options.limit } : {}),
    });
  }

  getDefaultWorkspace(): AtlasWorkspaceOptions {
    return this.#defaultWorkspace;
  }
}

export type { RetrievalContext, RetrievalResult, RetrievedMemoryItem } from '@atlas/retrieval';
