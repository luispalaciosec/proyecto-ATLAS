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

import { wrapConsistencyProviderWithSessionValidation } from './memory-engine-consistency.js';
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
import {
  MemoryEngineSessionOrchestrator,
  resolveMemoryEngineNamespaceId,
  type MemoryEngineExecutionContext,
  type MemoryEngineSessionScope,
} from './memory-engine-session-orchestrator.js';
import { MemoryEngineSessionRegistry } from './memory-engine-session-registry.js';

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
  private readonly consistencyProvider: ConsistencyProvider;
  private readonly sessionRegistry: MemoryEngineSessionRegistry;
  private readonly sessionOrchestrator: MemoryEngineSessionOrchestrator;

  constructor(
    store: MemoryStore,
    consistencyProvider: ConsistencyProvider,
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
    this.sessionRegistry = new MemoryEngineSessionRegistry();
    this.sessionOrchestrator = new MemoryEngineSessionOrchestrator(this.sessionRegistry);
    this.consistencyProvider = wrapConsistencyProviderWithSessionValidation(
      consistencyProvider,
      this.sessionRegistry,
    );
  }

  /** @internal Package-internal accessor for collaborator tests. Not public API. */
  getCollaborators(): MemoryEngineCollaborators {
    return this.collaborators;
  }

  /** @internal Package-internal accessor for session integration tests. Not public API. */
  getLastCompletedSession() {
    return this.sessionOrchestrator.getLastCompletedSession();
  }

  /** @internal Package-internal accessor for session integration tests. Not public API. */
  getCompletedSessions() {
    return this.sessionRegistry.getCompletedSessions();
  }

  /** @internal Package-internal accessor for session integration tests. Not public API. */
  getConsistencyProvider(): ConsistencyProvider {
    return this.consistencyProvider;
  }

  private async withMemorySession<T>(
    context: MemoryEngineExecutionContext,
    execute: (scope: MemoryEngineSessionScope) => Promise<Result<T, EngineError>>,
  ): Promise<Result<T, EngineError>> {
    const scope = this.sessionOrchestrator.beginExecution(context);

    try {
      const result = await execute(scope);

      if (result.ok) {
        scope.finalizeSuccess();
      } else {
        if (result.error.issues !== undefined && result.error.issues.length > 0) {
          scope.recordWarning(result.error.message);
        } else {
          scope.recordProviderFailure(result.error.canonicalCode, result.error.message);
        }
        scope.finalizeFailure(result.error);
      }

      return result;
    } catch (cause) {
      const error = createEngineError(ENGINE_STORE, 'MemoryEngine execution failed unexpectedly', {
        cause,
      });
      scope.recordProviderFailure(error.canonicalCode, error.message);
      scope.finalizeFailure(error);
      throw cause;
    }
  }

  async store(record: MemoryRecord): Promise<Result<MemoryRecord, EngineError>> {
    return this.withMemorySession(
      {
        operationName: 'store',
        namespaceId: resolveMemoryEngineNamespaceId(record.metadata),
        executionKey: record.id,
      },
      async (scope) => {
        const domainIssues = validateMemoryRecord(record);
        scope.recordValidationOperation({ phase: 'domain', valid: isValid(domainIssues) });
        if (!isValid(domainIssues)) {
          return memoryErr(
            createEngineError(ENGINE_DOMAIN_VALIDATION, 'MemoryRecord domain validation failed', {
              issues: domainIssues,
            }),
          );
        }

        const consistencyStartedAt = Date.now();
        const consistencyResult = await this.consistencyProvider.validateRecord(record);
        scope.recordValidationOperation({
          phase: 'consistency',
          valid: consistencyResult.valid,
        });
        scope.recordProviderLatency(
          'storageLatencyMs',
          Date.now() - consistencyStartedAt,
        );
        if (!consistencyResult.valid) {
          scope.recordWarning('MemoryRecord consistency validation failed');
          return memoryErr(
            createEngineError(ENGINE_CONSISTENCY, 'MemoryRecord consistency validation failed', {
              issues: consistencyResult.issues,
            }),
          );
        }

        scope.recordStorageRequest({ recordId: record.id });
        try {
          const storageStartedAt = Date.now();
          await this.storageProvider.store(record);
          scope.recordStorageResult({ recordId: record.id });
          scope.recordProviderLatency('storageLatencyMs', Date.now() - storageStartedAt);

          const indexStartedAt = Date.now();
          await this.indexProvider.updateIndex(record);
          scope.recordIndexOperation({ recordId: record.id });
          scope.recordProviderLatency('indexLatencyMs', Date.now() - indexStartedAt);
        } catch (cause) {
          scope.recordProviderFailure(ENGINE_STORE, 'StorageProvider.store failed');
          return memoryErr(createEngineError(ENGINE_STORE, 'StorageProvider.store failed', { cause }));
        }

        return memoryOk(record);
      },
    );
  }

  async retrieve(
    request: RetrieveMemoryEngineRequest,
  ): Promise<Result<MemoryRecord, EngineError>> {
    return this.withMemorySession(
      {
        operationName: 'retrieve',
        namespaceId: 'memory.default',
        executionKey: request.recordId,
      },
      async (scope) => {
        const identityValidation = validateRetrieveEngineRequest(request.recordId);
        scope.recordValidationOperation({
          phase: 'identity',
          valid: identityValidation.ok,
        });
        if (!identityValidation.ok) {
          return identityValidation;
        }

        scope.recordRetrievalRequest({ recordId: identityValidation.value });
        try {
          const retrievalStartedAt = Date.now();
          const record = await this.retrievalProvider.retrieveById(identityValidation.value);
          scope.recordProviderLatency('retrievalLatencyMs', Date.now() - retrievalStartedAt);

          if (record === undefined) {
            scope.recordWarning(`Record "${identityValidation.value}" was not found`);
            return memoryErr(
              createEngineError(
                ENGINE_NOT_FOUND,
                `Record "${identityValidation.value}" was not found`,
              ),
            );
          }

          scope.recordRetrievalResult({ recordId: record.id });
          return memoryOk(record);
        } catch (cause) {
          scope.recordProviderFailure(ENGINE_RETRIEVAL, 'MemoryEngine.retrieve failed');
          return memoryErr(
            createEngineError(ENGINE_RETRIEVAL, 'MemoryEngine.retrieve failed', { cause }),
          );
        }
      },
    );
  }

  async search(query: MemoryQuery): Promise<Result<SearchResult, EngineError>> {
    return this.withMemorySession(
      {
        operationName: 'search',
        namespaceId: resolveMemoryEngineNamespaceId(undefined, query.namespaceId),
        executionKey: JSON.stringify(query),
      },
      async (scope) => {
        const queryValidation = validateEngineMemoryQuery(query);
        scope.recordValidationOperation({ phase: 'query', valid: queryValidation.ok });
        if (!queryValidation.ok) {
          return queryValidation;
        }

        scope.recordRetrievalRequest({ query: queryValidation.value });
        try {
          const retrievalStartedAt = Date.now();
          const result = await this.retrievalProvider.search(queryValidation.value);
          scope.recordProviderLatency('retrievalLatencyMs', Date.now() - retrievalStartedAt);
          scope.recordRetrievalResult({ total: result.total });
          return memoryOk(result);
        } catch (cause) {
          scope.recordProviderFailure(ENGINE_RETRIEVAL, 'MemoryEngine.search failed');
          return memoryErr(createEngineError(ENGINE_RETRIEVAL, 'MemoryEngine.search failed', { cause }));
        }
      },
    );
  }

  async update(record: MemoryRecord): Promise<Result<MemoryRecord, EngineError>> {
    return this.withMemorySession(
      {
        operationName: 'update',
        namespaceId: resolveMemoryEngineNamespaceId(record.metadata),
        executionKey: record.id,
      },
      async (scope) => {
        const domainIssues = validateMemoryRecord(record);
        scope.recordValidationOperation({ phase: 'domain', valid: isValid(domainIssues) });
        if (!isValid(domainIssues)) {
          return memoryErr(
            createEngineError(ENGINE_DOMAIN_VALIDATION, 'MemoryRecord domain validation failed', {
              issues: domainIssues,
            }),
          );
        }

        const updatedRecord = buildUpdatedMemoryRecord(record);

        const consistencyResult = await this.consistencyProvider.validateRecord(updatedRecord);
        scope.recordValidationOperation({
          phase: 'consistency',
          valid: consistencyResult.valid,
        });
        if (!consistencyResult.valid) {
          scope.recordWarning('MemoryRecord consistency validation failed');
          return memoryErr(
            createEngineError(ENGINE_CONSISTENCY, 'MemoryRecord consistency validation failed', {
              issues: consistencyResult.issues,
            }),
          );
        }

        scope.recordStorageRequest({ recordId: updatedRecord.id });
        try {
          await this.storageProvider.update(updatedRecord);
          scope.recordStorageResult({ recordId: updatedRecord.id });
          await this.indexProvider.updateIndex(updatedRecord);
          scope.recordIndexOperation({ recordId: updatedRecord.id });
        } catch (cause) {
          scope.recordProviderFailure(ENGINE_STORE, 'StorageProvider.update failed');
          return memoryErr(createEngineError(ENGINE_STORE, 'StorageProvider.update failed', { cause }));
        }

        return memoryOk(updatedRecord);
      },
    );
  }

  async delete(record: MemoryRecord): Promise<Result<void, EngineError>> {
    return this.withMemorySession(
      {
        operationName: 'delete',
        namespaceId: resolveMemoryEngineNamespaceId(record.metadata),
        executionKey: record.id,
      },
      async (scope) => {
        const domainIssues = validateMemoryRecord(record);
        scope.recordValidationOperation({ phase: 'domain', valid: isValid(domainIssues) });
        if (!isValid(domainIssues)) {
          return memoryErr(
            createEngineError(ENGINE_DOMAIN_VALIDATION, 'MemoryRecord domain validation failed', {
              issues: domainIssues,
            }),
          );
        }

        const consistencyResult = await this.consistencyProvider.validateRecord(record);
        scope.recordValidationOperation({
          phase: 'consistency',
          valid: consistencyResult.valid,
        });
        if (!consistencyResult.valid) {
          scope.recordWarning('MemoryRecord consistency validation failed');
          return memoryErr(
            createEngineError(ENGINE_CONSISTENCY, 'MemoryRecord consistency validation failed', {
              issues: consistencyResult.issues,
            }),
          );
        }

        scope.recordStorageRequest({ recordId: record.id });
        try {
          await this.storageProvider.delete(record.id);
          scope.recordStorageResult({ recordId: record.id });
          await this.indexProvider.deleteIndexEntry(record.id);
          scope.recordIndexOperation({ recordId: record.id });
        } catch (cause) {
          scope.recordProviderFailure(ENGINE_STORE, 'StorageProvider.delete failed');
          return memoryErr(createEngineError(ENGINE_STORE, 'StorageProvider.delete failed', { cause }));
        }

        return memoryOk(undefined);
      },
    );
  }
}
