import type { Result } from '@atlas/core';

import { createStoreGateway, type InternalStoreGateway } from '../internal/store-gateway.js';
import { memoryErr, memoryOk } from '../internal/result.js';
import type { ConsistencyProvider } from '../domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../domain/interfaces/memory-store.js';
import type { MemoryRecord, SearchResult } from '../domain/types/memory-types.js';
import { isValid, validateMemoryRecord } from '../domain/validators/memory-validators.js';
import { CollectionRepository } from '../repositories/CollectionRepository.js';
import { NamespaceRepository } from '../repositories/NamespaceRepository.js';
import { RecordRepository } from '../repositories/RecordRepository.js';
import { RelationshipRepository } from '../repositories/RelationshipRepository.js';
import { VersionRepository } from '../repositories/VersionRepository.js';

import {
  createEngineError,
  ENGINE_CONSISTENCY,
  ENGINE_DOMAIN_VALIDATION,
  ENGINE_STORE,
  type EngineError,
} from './engine-errors.js';

export interface MemoryEngineCollaborators {
  readonly namespace: NamespaceRepository;
  readonly collection: CollectionRepository;
  readonly record: RecordRepository;
  readonly version: VersionRepository;
  readonly relationship: RelationshipRepository;
}

export class MemoryEngine {
  private readonly storeGateway: InternalStoreGateway;
  private readonly collaborators: MemoryEngineCollaborators;

  constructor(
    store: MemoryStore,
    private readonly consistencyProvider: ConsistencyProvider,
  ) {
    this.storeGateway = createStoreGateway(store);
    this.collaborators = Object.freeze({
      namespace: new NamespaceRepository(this.storeGateway),
      collection: new CollectionRepository(this.storeGateway),
      record: new RecordRepository(this.storeGateway),
      version: new VersionRepository(this.storeGateway),
      relationship: new RelationshipRepository(this.storeGateway),
    });
  }

  /** @internal Package-internal accessor for collaborator tests. Not public API. */
  getCollaborators(): MemoryEngineCollaborators {
    return this.collaborators;
  }

  async store(record: MemoryRecord): Promise<Result<MemoryRecord, EngineError>> {
    const domainIssues = validateMemoryRecord(record);
    if (!isValid(domainIssues)) {
      return memoryErr(
        createEngineError(ENGINE_DOMAIN_VALIDATION, 'MemoryRecord domain validation failed', {
          issues: domainIssues,
        }),
      );
    }

    const consistencyResult = await this.consistencyProvider.validateRecord(record);
    if (!consistencyResult.valid) {
      return memoryErr(
        createEngineError(ENGINE_CONSISTENCY, 'MemoryRecord consistency validation failed', {
          issues: consistencyResult.issues,
        }),
      );
    }

    try {
      await this.storeGateway.put();
    } catch (cause) {
      return memoryErr(createEngineError(ENGINE_STORE, 'MemoryStore.put failed', { cause }));
    }

    return memoryOk(record);
  }

  async retrieve(): Promise<Result<MemoryRecord | undefined, EngineError>> {
    try {
      const record = await this.storeGateway.get();
      return memoryOk(record);
    } catch (cause) {
      return memoryErr(createEngineError(ENGINE_STORE, 'MemoryStore.get failed', { cause }));
    }
  }

  async search(): Promise<Result<SearchResult, EngineError>> {
    try {
      const result = await this.storeGateway.search();
      return memoryOk(result);
    } catch (cause) {
      return memoryErr(createEngineError(ENGINE_STORE, 'MemoryStore.search failed', { cause }));
    }
  }

  async delete(record: MemoryRecord): Promise<Result<void, EngineError>> {
    const domainIssues = validateMemoryRecord(record);
    if (!isValid(domainIssues)) {
      return memoryErr(
        createEngineError(ENGINE_DOMAIN_VALIDATION, 'MemoryRecord domain validation failed', {
          issues: domainIssues,
        }),
      );
    }

    const consistencyResult = await this.consistencyProvider.validateRecord(record);
    if (!consistencyResult.valid) {
      return memoryErr(
        createEngineError(ENGINE_CONSISTENCY, 'MemoryRecord consistency validation failed', {
          issues: consistencyResult.issues,
        }),
      );
    }

    try {
      await this.storeGateway.remove();
    } catch (cause) {
      return memoryErr(createEngineError(ENGINE_STORE, 'MemoryStore.remove failed', { cause }));
    }

    return memoryOk(undefined);
  }
}
