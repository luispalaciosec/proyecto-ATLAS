import type { ConsistencyProvider } from '../domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../domain/interfaces/memory-store.js';
import type { MemoryRecord, SearchResult } from '../domain/types/memory-types.js';
import { isValid, validateMemoryRecord } from '../domain/validators/memory-validators.js';

import {
  createEngineError,
  ENGINE_CONSISTENCY,
  ENGINE_DOMAIN_VALIDATION,
  ENGINE_STORE,
} from './engine-errors.js';
import { engineFailure, engineSuccess, type EngineResult } from './engine-result.js';

export class MemoryEngine {
  constructor(
    private readonly store: MemoryStore,
    private readonly consistencyProvider: ConsistencyProvider,
  ) {}

  async write(record: MemoryRecord): Promise<EngineResult<MemoryRecord>> {
    const domainIssues = validateMemoryRecord(record);
    if (!isValid(domainIssues)) {
      return engineFailure(
        createEngineError(ENGINE_DOMAIN_VALIDATION, 'MemoryRecord domain validation failed', {
          issues: domainIssues,
        }),
      );
    }

    const consistencyResult = await this.consistencyProvider.validateRecord(record);
    if (!consistencyResult.valid) {
      return engineFailure(
        createEngineError(ENGINE_CONSISTENCY, 'MemoryRecord consistency validation failed', {
          issues: consistencyResult.issues,
        }),
      );
    }

    try {
      await this.store.put();
    } catch (cause) {
      return engineFailure(
        createEngineError(ENGINE_STORE, 'MemoryStore.put failed', { cause }),
      );
    }

    return engineSuccess(record);
  }

  async read(): Promise<EngineResult<MemoryRecord | undefined>> {
    try {
      const record = await this.store.get();
      return engineSuccess(record);
    } catch (cause) {
      return engineFailure(
        createEngineError(ENGINE_STORE, 'MemoryStore.get failed', { cause }),
      );
    }
  }

  async search(): Promise<SearchResult> {
    return this.store.search();
  }

  async remove(record: MemoryRecord): Promise<EngineResult<void>> {
    const domainIssues = validateMemoryRecord(record);
    if (!isValid(domainIssues)) {
      return engineFailure(
        createEngineError(ENGINE_DOMAIN_VALIDATION, 'MemoryRecord domain validation failed', {
          issues: domainIssues,
        }),
      );
    }

    const consistencyResult = await this.consistencyProvider.validateRecord(record);
    if (!consistencyResult.valid) {
      return engineFailure(
        createEngineError(ENGINE_CONSISTENCY, 'MemoryRecord consistency validation failed', {
          issues: consistencyResult.issues,
        }),
      );
    }

    try {
      await this.store.remove();
    } catch (cause) {
      return engineFailure(
        createEngineError(ENGINE_STORE, 'MemoryStore.remove failed', { cause }),
      );
    }

    return engineSuccess(undefined);
  }
}
