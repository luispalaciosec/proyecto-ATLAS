import type { Result } from '@atlas/core';

import type { InternalStoreGateway } from '../internal/store-gateway.js';
import { memoryErr, memoryOk } from '../internal/result.js';
import type { Namespace } from '../domain/entities/namespace.js';
import { isValid, validateNamespace } from '../domain/validators/memory-validators.js';
import type { NamespaceId } from '../domain/value-objects/namespace-id.js';

import {
  createRepositoryError,
  REPOSITORY_DOMAIN_VALIDATION,
  REPOSITORY_NOT_FOUND,
  type RepositoryError,
} from './repository-errors.js';
import {
  filterEntityMemoryRecords,
  findEntityMemoryRecord,
  memoryRecordToNamespace,
  namespaceToMemoryRecord,
  REPOSITORY_ENTITY_NAMESPACE,
} from './repository-projections.js';
import {
  invokeStoreGet,
  invokeStorePut,
  invokeStoreRemove,
  invokeStoreSearch,
} from './repository-store.js';

export class NamespaceRepository {
  constructor(private readonly storeGateway: InternalStoreGateway) {}

  async createNamespace(namespace: Namespace): Promise<Result<Namespace, RepositoryError>> {
    const issues = validateNamespace(namespace);
    if (!isValid(issues)) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Namespace domain validation failed', {
          issues,
        }),
      );
    }

    const memoryRecord = namespaceToMemoryRecord(namespace);
    const storeResult = await invokeStorePut(this.storeGateway, memoryRecord);
    if (!storeResult.ok) {
      return storeResult;
    }

    return memoryOk(namespace);
  }

  async deleteNamespace(namespaceId: NamespaceId): Promise<Result<void, RepositoryError>> {
    const namespaceResult = await this.getNamespace(namespaceId);
    if (!namespaceResult.ok) {
      return namespaceResult;
    }

    return invokeStoreRemove(this.storeGateway, namespaceId.toString());
  }

  async getNamespace(namespaceId: NamespaceId): Promise<Result<Namespace, RepositoryError>> {
    const directResult = await invokeStoreGet(this.storeGateway, namespaceId.toString());
    if (!directResult.ok) {
      return directResult;
    }

    if (
      directResult.value !== undefined &&
      directResult.value.id === namespaceId.toString() &&
      directResult.value.type === REPOSITORY_ENTITY_NAMESPACE
    ) {
      return memoryOk(memoryRecordToNamespace(directResult.value));
    }

    const searchResult = await invokeStoreSearch(this.storeGateway);
    if (!searchResult.ok) {
      return searchResult;
    }

    const match = findEntityMemoryRecord(
      searchResult.value.records,
      REPOSITORY_ENTITY_NAMESPACE,
      namespaceId.toString(),
    );

    if (match === undefined) {
      return memoryErr(
        createRepositoryError(REPOSITORY_NOT_FOUND, `Namespace "${namespaceId.toString()}" was not found`),
      );
    }

    return memoryOk(memoryRecordToNamespace(match));
  }

  async listNamespaces(): Promise<Result<readonly Namespace[], RepositoryError>> {
    const searchResult = await invokeStoreSearch(this.storeGateway);
    if (!searchResult.ok) {
      return searchResult;
    }

    const namespaces = filterEntityMemoryRecords(
      searchResult.value.records,
      REPOSITORY_ENTITY_NAMESPACE,
    ).map((record) => memoryRecordToNamespace(record));

    return memoryOk(Object.freeze(namespaces));
  }
}
