import type { Result } from '@atlas/core';

import { validateEngineMemoryQuery, validateRetrieveEngineRequest } from '../internal/engine-query-validation.js';
import { buildUpdatedMemoryRecord } from '../internal/memory-record-update.js';
import { memoryErr, memoryOk } from '../internal/result.js';
import { createStoreGateway, type InternalStoreGateway } from '../internal/store-gateway.js';
import type { ConsistencyProvider } from '../domain/interfaces/consistency-provider.js';
import type { MemoryStore } from '../domain/interfaces/memory-store.js';
import type { MemoryQuery, MemoryRecord, SearchResult } from '../domain/types/memory-types.js';
import { isValid, validateMemoryRecord } from '../domain/validators/memory-validators.js';
import { resolveProviderStack } from '../providers/create-memory-providers.js';
import type { IndexProvider } from '../providers/index/index-provider.js';
import type { RetrievalProvider } from '../providers/retrieval/retrieval-provider.js';
import type { StorageProvider } from '../providers/storage/storage-provider.js';
import { CollectionRepository } from '../repositories/CollectionRepository.js';
import { NamespaceRepository } from '../repositories/NamespaceRepository.js';
import { RecordRepository } from '../repositories/RecordRepository.js';
import { RelationshipRepository } from '../repositories/RelationshipRepository.js';
import { VersionRepository } from '../repositories/VersionRepository.js';

import type { RetrieveMemoryEngineRequest } from './engine-requests.js';
import {
  createEngineError,
  ENGINE_CONSISTENCY,
  ENGINE_DOMAIN_VALIDATION,
  ENGINE_NOT_FOUND,
  ENGINE_RETRIEVAL,
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
  private readonly storageProvider: StorageProvider;
  private readonly indexProvider: IndexProvider;
  private readonly retrievalProvider: RetrievalProvider;
  private readonly storeGateway: InternalStoreGateway;
  private readonly collaborators: MemoryEngineCollaborators;

  constructor(
    store: MemoryStore,
    private readonly consistencyProvider: ConsistencyProvider,
  ) {
    const providers = resolveProviderStack(store);
    this.storageProvider = providers.storageProvider;
    this.indexProvider = providers.indexProvider;
    this.retrievalProvider = providers.retrievalProvider;
    this.storeGateway = createStoreGateway(this.storageProvider);
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
      await this.storageProvider.store(record);
      await this.indexProvider.updateIndex(record);
    } catch (cause) {
      return memoryErr(createEngineError(ENGINE_STORE, 'StorageProvider.store failed', { cause }));
    }

    return memoryOk(record);
  }

  async retrieve(
    request: RetrieveMemoryEngineRequest,
  ): Promise<Result<MemoryRecord, EngineError>> {
    const identityValidation = validateRetrieveEngineRequest(request.recordId);
    if (!identityValidation.ok) {
      return identityValidation;
    }

    try {
      const record = await this.retrievalProvider.retrieveById(identityValidation.value);
      if (record === undefined) {
        return memoryErr(
          createEngineError(
            ENGINE_NOT_FOUND,
            `Record "${identityValidation.value}" was not found`,
          ),
        );
      }

      return memoryOk(record);
    } catch (cause) {
      return memoryErr(
        createEngineError(ENGINE_RETRIEVAL, 'MemoryEngine.retrieve failed', { cause }),
      );
    }
  }

  async search(query: MemoryQuery): Promise<Result<SearchResult, EngineError>> {
    const queryValidation = validateEngineMemoryQuery(query);
    if (!queryValidation.ok) {
      return queryValidation;
    }

    try {
      const result = await this.retrievalProvider.search(queryValidation.value);
      return memoryOk(result);
    } catch (cause) {
      return memoryErr(createEngineError(ENGINE_RETRIEVAL, 'MemoryEngine.search failed', { cause }));
    }
  }

  async update(record: MemoryRecord): Promise<Result<MemoryRecord, EngineError>> {
    const domainIssues = validateMemoryRecord(record);
    if (!isValid(domainIssues)) {
      return memoryErr(
        createEngineError(ENGINE_DOMAIN_VALIDATION, 'MemoryRecord domain validation failed', {
          issues: domainIssues,
        }),
      );
    }

    const updatedRecord = buildUpdatedMemoryRecord(record);

    const consistencyResult = await this.consistencyProvider.validateRecord(updatedRecord);
    if (!consistencyResult.valid) {
      return memoryErr(
        createEngineError(ENGINE_CONSISTENCY, 'MemoryRecord consistency validation failed', {
          issues: consistencyResult.issues,
        }),
      );
    }

    try {
      await this.storageProvider.update(updatedRecord);
      await this.indexProvider.updateIndex(updatedRecord);
    } catch (cause) {
      return memoryErr(createEngineError(ENGINE_STORE, 'StorageProvider.update failed', { cause }));
    }

    return memoryOk(updatedRecord);
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
      await this.storageProvider.delete(record.id);
      await this.indexProvider.deleteIndexEntry(record.id);
    } catch (cause) {
      return memoryErr(createEngineError(ENGINE_STORE, 'StorageProvider.delete failed', { cause }));
    }

    return memoryOk(undefined);
  }
}
