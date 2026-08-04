import type { EventBus } from '@atlas/events';
import type { MemoryEngine } from '@atlas/memory';
import {
  runRetrievalPipeline,
  type RetrievalContext,
  type RetrievalRequest,
  type RetrievalResult,
} from '@atlas/retrieval';

import type { AtlasRetrievalOptions, AtlasWorkspaceOptions } from '../atlas/options.js';

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

  getDefaultWorkspace(): AtlasWorkspaceOptions {
    return this.#defaultWorkspace;
  }
}

export type { RetrievalContext, RetrievalResult, RetrievedMemoryItem } from '@atlas/retrieval';
