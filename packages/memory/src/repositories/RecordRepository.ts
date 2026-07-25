import type { Result } from '@atlas/core';

import type { InternalStoreGateway } from '../internal/store-gateway.js';
import { memoryErr, memoryOk } from '../internal/result.js';
import type { Collection } from '../domain/entities/collection.js';
import type { Namespace } from '../domain/entities/namespace.js';
import type { Record } from '../domain/entities/record.js';
import type { Version } from '../domain/entities/version.js';
import {
  isValid,
  validateRecord,
  validateRecordPersistence,
} from '../domain/validators/memory-validators.js';
import type { MemoryRecord } from '../domain/types/memory-types.js';
import type { CollectionId } from '../domain/value-objects/collection-id.js';
import type { RecordId } from '../domain/value-objects/record-id.js';

import {
  createRepositoryError,
  REPOSITORY_DOMAIN_VALIDATION,
  REPOSITORY_NOT_FOUND,
  type RepositoryError,
} from './repository-errors.js';
import {
  memoryRecordToRecord,
  recordToMemoryRecord,
  REPOSITORY_ENTITY_COLLECTION,
  REPOSITORY_ENTITY_NAMESPACE,
  REPOSITORY_ENTITY_RELATIONSHIP,
  REPOSITORY_ENTITY_VERSION,
} from './repository-projections.js';
import {
  invokeStoreGet,
  invokeStorePut,
  invokeStoreRemove,
  invokeStoreSearch,
} from './repository-store.js';

export class RecordRepository {
  constructor(private readonly storeGateway: InternalStoreGateway) {}

  async createRecord(
    record: Record,
    namespace: Namespace,
    collection: Collection,
    initialVersion: Version,
  ): Promise<Result<Record, RepositoryError>> {
    const issues = validateRecordPersistence(record, [initialVersion], namespace, collection);
    if (!isValid(issues)) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Record domain validation failed', {
          issues,
        }),
      );
    }

    recordToMemoryRecord(record, initialVersion);
    const storeResult = await invokeStorePut(this.storeGateway);
    if (!storeResult.ok) {
      return storeResult;
    }

    return memoryOk(record);
  }

  async getRecord(recordId: RecordId): Promise<Result<Record, RepositoryError>> {
    const directResult = await invokeStoreGet(this.storeGateway);
    if (!directResult.ok) {
      return directResult;
    }

    if (directResult.value !== undefined && directResult.value.id === recordId.toString()) {
      return memoryOk(memoryRecordToRecord(directResult.value));
    }

    const searchResult = await invokeStoreSearch(this.storeGateway);
    if (!searchResult.ok) {
      return searchResult;
    }

    const match = searchResult.value.records.find(
      (candidate: MemoryRecord) => candidate.id === recordId.toString(),
    );
    if (match === undefined) {
      return memoryErr(
        createRepositoryError(REPOSITORY_NOT_FOUND, `Record "${recordId.toString()}" was not found`),
      );
    }

    return memoryOk(memoryRecordToRecord(match));
  }

  async deleteRecord(
    record: Record,
    namespace: Namespace,
    collection: Collection,
  ): Promise<Result<void, RepositoryError>> {
    const issues = validateRecord(record, namespace, collection);
    if (!isValid(issues)) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Record domain validation failed', {
          issues,
        }),
      );
    }

    const storeResult = await invokeStoreRemove(this.storeGateway);
    if (!storeResult.ok) {
      return storeResult;
    }

    return memoryOk(undefined);
  }

  async moveRecord(
    record: Record,
    targetCollection: Collection,
    namespace: Namespace,
    sourceCollection: Collection,
  ): Promise<Result<Record, RepositoryError>> {
    if (!record.collectionId.equals(sourceCollection.collectionId)) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Record move validation failed', {
          issues: [
            {
              code: 'MEMORY_INVALID_RECORD',
              message: 'Record collectionId must match the source collection',
              path: 'collectionId',
            },
          ],
        }),
      );
    }

    const movedRecord = Object.freeze({
      ...record,
      collectionId: targetCollection.collectionId,
      updatedAt: record.updatedAt,
    });

    const issues = validateRecord(movedRecord, namespace, targetCollection);
    if (!isValid(issues)) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Record move validation failed', {
          issues,
        }),
      );
    }

    const storeResult = await invokeStorePut(this.storeGateway);
    if (!storeResult.ok) {
      return storeResult;
    }

    return memoryOk(movedRecord);
  }

  async listRecords(collectionId: CollectionId): Promise<Result<readonly Record[], RepositoryError>> {
    const searchResult = await invokeStoreSearch(this.storeGateway);
    if (!searchResult.ok) {
      return searchResult;
    }

    const excludedTypes = new Set<string>([
      REPOSITORY_ENTITY_NAMESPACE,
      REPOSITORY_ENTITY_COLLECTION,
      REPOSITORY_ENTITY_VERSION,
      REPOSITORY_ENTITY_RELATIONSHIP,
    ]);

    const records = searchResult.value.records
      .filter((candidate) => !excludedTypes.has(candidate.type))
      .map((candidate) => memoryRecordToRecord(candidate))
      .filter((record) => record.collectionId.equals(collectionId));

    return memoryOk(Object.freeze(records));
  }
}
