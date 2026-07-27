import type { Result } from '@atlas/core';

import type { InternalStoreGateway } from '../internal/store-gateway.js';
import { memoryErr, memoryOk } from '../internal/result.js';
import type { Collection } from '../domain/entities/collection.js';
import type { Namespace } from '../domain/entities/namespace.js';
import type { Record } from '../domain/entities/record.js';
import type { Version } from '../domain/entities/version.js';
import {
  getCurrentVersion as resolveCurrentVersion,
  type RecordAggregate,
} from '../domain/aggregates/record-aggregate.js';
import { evolveRecord } from '../domain/factories/memory-factories.js';
import {
  isValid,
  validateRecordPersistence,
  validateRevisionMonotonicity,
  validateVersion,
} from '../domain/validators/memory-validators.js';
import type { VersionId } from '../domain/value-objects/version-id.js';

import {
  createRepositoryError,
  REPOSITORY_DOMAIN_VALIDATION,
  REPOSITORY_NOT_FOUND,
  type RepositoryError,
} from './repository-errors.js';
import { recordToMemoryRecord, versionToMemoryRecord } from './repository-projections.js';
import { invokeStorePut } from './repository-store.js';

export class VersionRepository {
  constructor(private readonly storeGateway: InternalStoreGateway) {}

  async appendVersion(
    record: Record,
    version: Version,
    existingVersions: readonly Version[],
    namespace: Namespace,
    collection: Collection,
    updatedAt: string,
  ): Promise<Result<{ readonly record: Record; readonly version: Version }, RepositoryError>> {
    const versionIssues = [
      ...validateVersion(version, record),
      ...validateRevisionMonotonicity(record.currentVersion, version.revision),
    ];

    if (!isValid(versionIssues)) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Version domain validation failed', {
          issues: versionIssues,
        }),
      );
    }

    let evolvedRecord: Record;
    try {
      evolvedRecord = evolveRecord(record, version, updatedAt, existingVersions);
    } catch (cause) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Version evolution failed', {
          cause,
        }),
      );
    }

    const nextVersions = Object.freeze([...existingVersions, version]);
    const persistenceIssues = validateRecordPersistence(
      evolvedRecord,
      nextVersions,
      namespace,
      collection,
    );

    if (!isValid(persistenceIssues)) {
      return memoryErr(
        createRepositoryError(REPOSITORY_DOMAIN_VALIDATION, 'Version persistence validation failed', {
          issues: persistenceIssues,
        }),
      );
    }

    const versionRecord = versionToMemoryRecord(version);
    const recordMemoryRecord = recordToMemoryRecord(evolvedRecord, version);

    const versionStoreResult = await invokeStorePut(this.storeGateway, versionRecord);
    if (!versionStoreResult.ok) {
      return versionStoreResult;
    }

    const storeResult = await invokeStorePut(this.storeGateway, recordMemoryRecord);
    if (!storeResult.ok) {
      return storeResult;
    }

    return memoryOk(
      Object.freeze({
        record: evolvedRecord,
        version,
      }),
    );
  }

  async getVersion(
    versionId: VersionId,
    versions: readonly Version[],
  ): Promise<Result<Version, RepositoryError>> {
    const match = versions.find((version) => version.versionId.equals(versionId));
    if (match === undefined) {
      return memoryErr(
        createRepositoryError(REPOSITORY_NOT_FOUND, `Version "${versionId.toString()}" was not found`),
      );
    }

    return memoryOk(match);
  }

  async getCurrentVersion(aggregate: RecordAggregate): Promise<Result<Version, RepositoryError>> {
    const currentVersion = resolveCurrentVersion(aggregate);
    if (currentVersion === undefined) {
      return memoryErr(
        createRepositoryError(
          REPOSITORY_NOT_FOUND,
          `Current version for record "${aggregate.record.recordId.toString()}" was not found`,
        ),
      );
    }

    return memoryOk(currentVersion);
  }

  async getHistory(aggregate: RecordAggregate): Promise<Result<readonly Version[], RepositoryError>> {
    const history = Object.freeze(
      [...aggregate.versions].sort(
        (left, right) => left.revision.value - right.revision.value,
      ),
    );

    return memoryOk(history);
  }
}
