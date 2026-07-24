import type { Collection } from '../entities/collection.js';
import type { Namespace } from '../entities/namespace.js';
import type { Record } from '../entities/record.js';
import type { Relationship } from '../entities/relationship.js';
import type { Version } from '../entities/version.js';
import type { RevisionNumber } from '../value-objects/revision-number.js';
import {
  DUPLICATE_IDENTIFIER,
  MEMORY_IMMUTABLE_VERSION,
  MEMORY_INVALID_COLLECTION,
  MEMORY_INVALID_NAMESPACE,
  MEMORY_INVALID_RECORD,
  MEMORY_INVALID_RELATIONSHIP,
  MEMORY_INVALID_VERSION,
  BROKEN_REFERENCE,
} from '../errors/create-memory-error.js';
import type { MemoryRecord } from '../types/memory-types.js';
import type { ValidationIssue } from '../types/memory-types.js';

export function createValidationIssue(
  code: string,
  message: string,
  path?: string,
): ValidationIssue {
  return Object.freeze({
    code,
    message,
    ...(path === undefined ? {} : { path }),
  });
}

export function validateNamespace(namespace: Namespace): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (namespace.owner.trim().length === 0) {
    issues.push(
      createValidationIssue(MEMORY_INVALID_NAMESPACE, 'Namespace owner must not be empty', 'owner'),
    );
  }

  if (namespace.createdAt.trim().length === 0) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_NAMESPACE,
        'Namespace createdAt must not be empty',
        'createdAt',
      ),
    );
  }

  return Object.freeze(issues);
}

export function validateCollection(
  collection: Collection,
  namespace: Namespace,
): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [...validateNamespace(namespace)];

  if (!collection.namespaceId.equals(namespace.namespaceId)) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_COLLECTION,
        'Collection namespaceId must match the parent namespace',
        'namespaceId',
      ),
    );
  }

  return Object.freeze(issues);
}

export function validateRecord(
  record: Record,
  namespace: Namespace,
  collection: Collection,
): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [
    ...validateCollection(collection, namespace),
  ];

  if (!record.namespaceId.equals(namespace.namespaceId)) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_RECORD,
        'Record namespaceId must match the parent namespace',
        'namespaceId',
      ),
    );
  }

  if (!record.collectionId.equals(collection.collectionId)) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_RECORD,
        'Record collectionId must match the parent collection',
        'collectionId',
      ),
    );
  }

  if (record.owner.trim().length === 0) {
    issues.push(
      createValidationIssue(MEMORY_INVALID_RECORD, 'Record owner must not be empty', 'owner'),
    );
  }

  return Object.freeze(issues);
}

export function validateVersion(version: Version, record: Record): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!version.recordId.equals(record.recordId)) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_VERSION,
        'Version recordId must match the parent record',
        'recordId',
      ),
    );
  }

  if (version.author.trim().length === 0) {
    issues.push(
      createValidationIssue(MEMORY_INVALID_VERSION, 'Version author must not be empty', 'author'),
    );
  }

  return Object.freeze(issues);
}

export function validateRevisionMonotonicity(
  currentRevision: RevisionNumber,
  nextRevision: RevisionNumber,
): readonly ValidationIssue[] {
  if (!nextRevision.equals(currentRevision.next())) {
    return Object.freeze([
      createValidationIssue(
        MEMORY_INVALID_VERSION,
        'Revision must increase monotonically',
        'revision',
      ),
    ]);
  }

  return Object.freeze([]);
}

export function validateVersionImmutability(
  existing: Version,
  candidate: Version,
): readonly ValidationIssue[] {
  if (
    existing.versionId.equals(candidate.versionId) &&
    (existing.content !== candidate.content ||
      !existing.checksum.equals(candidate.checksum) ||
      !existing.revision.equals(candidate.revision))
  ) {
    return Object.freeze([
      createValidationIssue(
        MEMORY_IMMUTABLE_VERSION,
        'Version content is immutable after creation',
        'content',
      ),
    ]);
  }

  return Object.freeze([]);
}

export function validateRecordPersistence(
  record: Record,
  versions: readonly Version[],
  namespace: Namespace,
  collection: Collection,
): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [...validateRecord(record, namespace, collection)];

  if (versions.length === 0) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_RECORD,
        'Persisted record must own at least one version',
        'versions',
      ),
    );
    return Object.freeze(issues);
  }

  const currentVersion = versions.find((version) =>
    version.revision.equals(record.currentVersion),
  );

  if (currentVersion === undefined) {
    issues.push(
      createValidationIssue(
        BROKEN_REFERENCE,
        'current_version must reference an existing version',
        'currentVersion',
      ),
    );
  }

  const revisions = new Set<number>();

  for (const version of versions) {
    issues.push(...validateVersion(version, record));

    if (revisions.has(version.revision.value)) {
      issues.push(
        createValidationIssue(
          DUPLICATE_IDENTIFIER,
          `Duplicate revision "${version.revision.value}" detected`,
          'revision',
        ),
      );
    }

    revisions.add(version.revision.value);
  }

  for (let index = 0; index < versions.length; index += 1) {
    for (let inner = index + 1; inner < versions.length; inner += 1) {
      issues.push(...validateVersionImmutability(versions[index]!, versions[inner]!));
    }
  }

  const orderedRevisions = [...versions]
    .map((version) => version.revision.value)
    .sort((left, right) => left - right);

  for (let index = 1; index < orderedRevisions.length; index += 1) {
    if (orderedRevisions[index]! <= orderedRevisions[index - 1]!) {
      issues.push(
        createValidationIssue(
          MEMORY_INVALID_VERSION,
          'Version revisions must increase monotonically',
          'revision',
        ),
      );
      break;
    }
  }

  return Object.freeze(issues);
}

export function validateRelationship(
  relationship: Relationship,
  knownRecordIds: ReadonlySet<string>,
): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (relationship.sourceRecord.equals(relationship.targetRecord)) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_RELATIONSHIP,
        'Relationship source and target must differ',
        'targetRecord',
      ),
    );
  }

  if (!knownRecordIds.has(relationship.sourceRecord.toString())) {
    issues.push(
      createValidationIssue(
        BROKEN_REFERENCE,
        'Relationship source record does not exist',
        'sourceRecord',
      ),
    );
  }

  if (!knownRecordIds.has(relationship.targetRecord.toString())) {
    issues.push(
      createValidationIssue(
        BROKEN_REFERENCE,
        'Relationship target record does not exist',
        'targetRecord',
      ),
    );
  }

  return Object.freeze(issues);
}

export function validateUniqueIdentifier(
  id: string,
  knownIds: ReadonlySet<string>,
  label: string,
): readonly ValidationIssue[] {
  if (knownIds.has(id)) {
    return Object.freeze([
      createValidationIssue(DUPLICATE_IDENTIFIER, `${label} "${id}" already exists`, label),
    ]);
  }

  return Object.freeze([]);
}

export function validateMemoryRecord(record: MemoryRecord): readonly ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (record.id.trim().length === 0) {
    issues.push(createValidationIssue(MEMORY_INVALID_RECORD, 'MemoryRecord id must not be empty', 'id'));
  }

  if (record.type.trim().length === 0) {
    issues.push(
      createValidationIssue(MEMORY_INVALID_RECORD, 'MemoryRecord type must not be empty', 'type'),
    );
  }

  if (record.timestamp.trim().length === 0) {
    issues.push(
      createValidationIssue(
        MEMORY_INVALID_RECORD,
        'MemoryRecord timestamp must not be empty',
        'timestamp',
      ),
    );
  }

  return Object.freeze(issues);
}

export function isValid(issues: readonly ValidationIssue[]): boolean {
  return issues.length === 0;
}
