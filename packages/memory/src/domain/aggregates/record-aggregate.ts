import type { Record } from '../entities/record.js';
import type { Version } from '../entities/version.js';
import { createMemoryError, MEMORY_IMMUTABLE_VERSION } from '../errors/create-memory-error.js';

export interface RecordAggregate {
  readonly record: Record;
  readonly versions: readonly Version[];
}

export function createRecordAggregate(record: Record, versions: readonly Version[]): RecordAggregate {
  return Object.freeze({
    record,
    versions: Object.freeze([...versions]),
  });
}

export function getCurrentVersion(aggregate: RecordAggregate): Version | undefined {
  return aggregate.versions.find(
    (version) => version.revision.equals(aggregate.record.currentVersion),
  );
}

export function assertVersionImmutable(existing: Version, candidate: Version): void {
  if (
    existing.versionId.equals(candidate.versionId) &&
    (existing.content !== candidate.content ||
      !existing.checksum.equals(candidate.checksum) ||
      !existing.revision.equals(candidate.revision))
  ) {
    throw createMemoryError(
      MEMORY_IMMUTABLE_VERSION,
      'Version content is immutable after creation',
    );
  }
}
