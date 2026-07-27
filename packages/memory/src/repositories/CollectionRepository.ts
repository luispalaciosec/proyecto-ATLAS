import type { Result } from '@atlas/core';

import type { InternalStoreGateway } from '../internal/store-gateway.js';
import { memoryErr, memoryOk } from '../internal/result.js';
import type { Collection } from '../domain/entities/collection.js';
import type { Namespace } from '../domain/entities/namespace.js';
import { isValid, validateCollection } from '../domain/validators/memory-validators.js';
import type { CollectionId } from '../domain/value-objects/collection-id.js';
import type { NamespaceId } from '../domain/value-objects/namespace-id.js';

import {
  createRepositoryError,
  REPOSITORY_DOMAIN_VALIDATION,
  REPOSITORY_NOT_FOUND,
  type RepositoryError,
} from './repository-errors.js';
import {
  collectionToMemoryRecord,
  filterEntityMemoryRecords,
  findEntityMemoryRecord,
  memoryRecordToCollection,
  REPOSITORY_ENTITY_COLLECTION,
} from './repository-projections.js';
import {
  invokeStoreGet,
  invokeStorePut,
  invokeStoreRemove,
  invokeStoreSearch,
} from './repository-store.js';

export class CollectionRepository {
  constructor(private readonly storeGateway: InternalStoreGateway) {}

  async createCollection(
    collection: Collection,
    namespace: Namespace,
  ): Promise<Result<Collection, RepositoryError>> {
    const issues = validateCollection(collection, namespace);
    if (!isValid(issues)) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Collection domain validation failed', {
          issues,
        }),
      );
    }

    const memoryRecord = collectionToMemoryRecord(collection);
    const storeResult = await invokeStorePut(this.storeGateway, memoryRecord);
    if (!storeResult.ok) {
      return storeResult;
    }

    return memoryOk(collection);
  }

  async deleteCollection(collectionId: CollectionId): Promise<Result<void, RepositoryError>> {
    const collectionResult = await this.getCollection(collectionId);
    if (!collectionResult.ok) {
      return collectionResult;
    }

    return invokeStoreRemove(this.storeGateway, collectionId.toString());
  }

  async getCollection(collectionId: CollectionId): Promise<Result<Collection, RepositoryError>> {
    const directResult = await invokeStoreGet(this.storeGateway, collectionId.toString());
    if (!directResult.ok) {
      return directResult;
    }

    if (
      directResult.value !== undefined &&
      directResult.value.id === collectionId.toString() &&
      directResult.value.type === REPOSITORY_ENTITY_COLLECTION
    ) {
      return memoryOk(memoryRecordToCollection(directResult.value));
    }

    const searchResult = await invokeStoreSearch(this.storeGateway);
    if (!searchResult.ok) {
      return searchResult;
    }

    const match = findEntityMemoryRecord(
      searchResult.value.records,
      REPOSITORY_ENTITY_COLLECTION,
      collectionId.toString(),
    );

    if (match === undefined) {
      return memoryErr(
        createRepositoryError(REPOSITORY_NOT_FOUND, `Collection "${collectionId.toString()}" was not found`),
      );
    }

    return memoryOk(memoryRecordToCollection(match));
  }

  async listCollections(namespaceId: NamespaceId): Promise<Result<readonly Collection[], RepositoryError>> {
    const searchResult = await invokeStoreSearch(this.storeGateway);
    if (!searchResult.ok) {
      return searchResult;
    }

    const collections = filterEntityMemoryRecords(
      searchResult.value.records,
      REPOSITORY_ENTITY_COLLECTION,
    )
      .map((record) => memoryRecordToCollection(record))
      .filter((collection) => collection.namespaceId.equals(namespaceId));

    return memoryOk(Object.freeze(collections));
  }
}
