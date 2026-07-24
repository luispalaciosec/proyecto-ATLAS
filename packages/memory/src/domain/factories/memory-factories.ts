import type { Collection } from '../entities/collection.js';
import type { Namespace } from '../entities/namespace.js';
import type { Record } from '../entities/record.js';
import type { Relationship } from '../entities/relationship.js';
import type { Version } from '../entities/version.js';
import type { MemoryRecord } from '../types/memory-types.js';
import { CollectionId } from '../value-objects/collection-id.js';
import { CollectionType } from '../value-objects/collection-type.js';
import { MemoryMetadata } from '../value-objects/memory-metadata.js';
import { NamespaceId } from '../value-objects/namespace-id.js';
import { NamespaceType } from '../value-objects/namespace-type.js';
import { RecordId } from '../value-objects/record-id.js';
import { RecordStatus } from '../value-objects/record-status.js';
import { RecordType } from '../value-objects/record-type.js';
import { RelationshipId } from '../value-objects/relationship-id.js';
import { RelationshipType } from '../value-objects/relationship-type.js';
import { RevisionNumber } from '../value-objects/revision-number.js';
import { Checksum } from '../value-objects/checksum.js';
import { VersionId } from '../value-objects/version-id.js';
import { assertVersionImmutable } from '../aggregates/record-aggregate.js';
import {
  createMemoryError,
  MEMORY_INVALID_VERSION,
} from '../errors/create-memory-error.js';

export interface CreateNamespaceInput {
  readonly namespaceId: string;
  readonly namespaceType: string;
  readonly owner: string;
  readonly metadata?: MemoryMetadata;
  readonly createdAt: string;
}

export interface CreateCollectionInput {
  readonly collectionId: string;
  readonly namespaceId: NamespaceId;
  readonly collectionType: string;
  readonly metadata?: MemoryMetadata;
  readonly createdAt: string;
}

export interface CreateRecordInput {
  readonly recordId: string;
  readonly namespaceId: NamespaceId;
  readonly collectionId: CollectionId;
  readonly recordType: string;
  readonly owner: string;
  readonly metadata?: MemoryMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateVersionInput {
  readonly versionId: string;
  readonly recordId: RecordId;
  readonly revision: RevisionNumber;
  readonly content: unknown;
  readonly checksum: string;
  readonly createdAt: string;
  readonly author: string;
  readonly metadata?: MemoryMetadata;
}

export interface CreateRelationshipInput {
  readonly relationshipId: string;
  readonly sourceRecord: RecordId;
  readonly targetRecord: RecordId;
  readonly relationshipType: RelationshipType;
  readonly metadata?: MemoryMetadata;
}

export function createNamespace(input: CreateNamespaceInput): Namespace {
  return Object.freeze({
    namespaceId: NamespaceId.create(input.namespaceId),
    namespaceType: NamespaceType.create(input.namespaceType),
    owner: input.owner.trim(),
    metadata: input.metadata ?? MemoryMetadata.create(),
    createdAt: input.createdAt,
  });
}

export function createCollection(input: CreateCollectionInput): Collection {
  return Object.freeze({
    collectionId: CollectionId.create(input.collectionId),
    namespaceId: input.namespaceId,
    collectionType: CollectionType.create(input.collectionType),
    metadata: input.metadata ?? MemoryMetadata.create(),
    createdAt: input.createdAt,
  });
}

export function createRecord(input: CreateRecordInput): Record {
  return Object.freeze({
    recordId: RecordId.create(input.recordId),
    namespaceId: input.namespaceId,
    collectionId: input.collectionId,
    recordType: RecordType.create(input.recordType),
    status: RecordStatus.Active,
    owner: input.owner.trim(),
    metadata: input.metadata ?? MemoryMetadata.create(),
    currentVersion: RevisionNumber.create(1),
    createdAt: input.createdAt,
    updatedAt: input.updatedAt,
  });
}

export function createVersion(input: CreateVersionInput): Version {
  return Object.freeze({
    versionId: VersionId.create(input.versionId),
    recordId: input.recordId,
    revision: input.revision,
    content: input.content,
    checksum: Checksum.create(input.checksum),
    createdAt: input.createdAt,
    author: input.author.trim(),
    metadata: input.metadata ?? MemoryMetadata.create(),
  });
}

export function createRelationship(input: CreateRelationshipInput): Relationship {
  return Object.freeze({
    relationshipId: RelationshipId.create(input.relationshipId),
    sourceRecord: input.sourceRecord,
    targetRecord: input.targetRecord,
    relationshipType: input.relationshipType,
    metadata: input.metadata ?? MemoryMetadata.create(),
  });
}

export function projectMemoryRecord(record: Record, version: Version): MemoryRecord {
  return Object.freeze({
    id: record.recordId.toString(),
    type: record.recordType.toString(),
    content: version.content,
    metadata: {
      namespaceId: record.namespaceId.toString(),
      collectionId: record.collectionId.toString(),
      owner: record.owner,
      status: record.status,
      revision: version.revision.value,
      ...record.metadata.custom,
    },
    timestamp: version.createdAt,
  });
}

export function evolveRecord(
  record: Record,
  nextVersion: Version,
  updatedAt: string,
  existingVersions: readonly Version[] = [],
): Record {
  for (const existing of existingVersions) {
    assertVersionImmutable(existing, nextVersion);
  }

  if (!nextVersion.recordId.equals(record.recordId)) {
    throw createMemoryError(
      MEMORY_INVALID_VERSION,
      'Version recordId must match the parent record during evolution',
    );
  }

  if (!nextVersion.revision.equals(record.currentVersion.next())) {
    throw createMemoryError(
      MEMORY_INVALID_VERSION,
      'Revision must increase monotonically during record evolution',
    );
  }

  return Object.freeze({
    ...record,
    currentVersion: nextVersion.revision,
    updatedAt,
  });
}
