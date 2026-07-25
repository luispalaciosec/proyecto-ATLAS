import type { Result } from '@atlas/core';

import type { InternalStoreGateway } from '../internal/store-gateway.js';
import { memoryErr, memoryOk } from '../internal/result.js';
import type { Relationship } from '../domain/entities/relationship.js';
import { isValid, validateRelationship } from '../domain/validators/memory-validators.js';
import type { RecordId } from '../domain/value-objects/record-id.js';
import type { RelationshipId } from '../domain/value-objects/relationship-id.js';

import {
  createRepositoryError,
  REPOSITORY_DOMAIN_VALIDATION,
  REPOSITORY_NOT_FOUND,
  type RepositoryError,
} from './repository-errors.js';
import {
  findEntityMemoryRecord,
  memoryRecordToRelationship,
  relationshipToMemoryRecord,
  REPOSITORY_ENTITY_RELATIONSHIP,
} from './repository-projections.js';
import {
  invokeStoreGet,
  invokeStorePut,
  invokeStoreRemove,
  invokeStoreSearch,
} from './repository-store.js';

export class RelationshipRepository {
  constructor(private readonly storeGateway: InternalStoreGateway) {}

  async link(
    relationship: Relationship,
    knownRecordIds: ReadonlySet<string>,
  ): Promise<Result<Relationship, RepositoryError>> {
    const issues = validateRelationship(relationship, knownRecordIds);
    if (!isValid(issues)) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Relationship domain validation failed', {
          issues,
        }),
      );
    }

    relationshipToMemoryRecord(relationship);
    const storeResult = await invokeStorePut(this.storeGateway);
    if (!storeResult.ok) {
      return storeResult;
    }

    return memoryOk(relationship);
  }

  async unlink(relationshipId: RelationshipId): Promise<Result<void, RepositoryError>> {
    const relationshipResult = await this.getRelationship(relationshipId);
    if (!relationshipResult.ok) {
      return relationshipResult;
    }

    relationshipToMemoryRecord(relationshipResult.value);
    return invokeStoreRemove(this.storeGateway);
  }

  async getRelationships(
    recordId: RecordId,
    relationships: readonly Relationship[],
  ): Promise<Result<readonly Relationship[], RepositoryError>> {
    const matches = Object.freeze(
      relationships.filter(
        (relationship) =>
          relationship.sourceRecord.equals(recordId) ||
          relationship.targetRecord.equals(recordId),
      ),
    );

    return memoryOk(matches);
  }

  private async getRelationship(
    relationshipId: RelationshipId,
  ): Promise<Result<Relationship, RepositoryError>> {
    const directResult = await invokeStoreGet(this.storeGateway);
    if (!directResult.ok) {
      return directResult;
    }

    if (
      directResult.value !== undefined &&
      directResult.value.id === relationshipId.toString() &&
      directResult.value.type === REPOSITORY_ENTITY_RELATIONSHIP
    ) {
      return memoryOk(memoryRecordToRelationship(directResult.value));
    }

    const searchResult = await invokeStoreSearch(this.storeGateway);
    if (!searchResult.ok) {
      return searchResult;
    }

    const match = findEntityMemoryRecord(
      searchResult.value.records,
      REPOSITORY_ENTITY_RELATIONSHIP,
      relationshipId.toString(),
    );

    if (match === undefined) {
      return memoryErr(
        createRepositoryError(
          REPOSITORY_NOT_FOUND,
          `Relationship "${relationshipId.toString()}" was not found`,
        ),
      );
    }

    return memoryOk(memoryRecordToRelationship(match));
  }
}
