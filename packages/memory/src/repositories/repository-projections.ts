import type { Collection } from '../domain/entities/collection.js';
import type { Namespace } from '../domain/entities/namespace.js';
import type { Record } from '../domain/entities/record.js';
import type { Relationship } from '../domain/entities/relationship.js';
import type { Version } from '../domain/entities/version.js';
import {
  createCollection,
  createNamespace,
  createRelationship,
  createVersion,
  projectMemoryRecord,
} from '../domain/factories/memory-factories.js';
import type { MemoryRecord } from '../domain/types/memory-types.js';
import { CollectionId } from '../domain/value-objects/collection-id.js';
import { MemoryMetadata } from '../domain/value-objects/memory-metadata.js';
import { NamespaceId } from '../domain/value-objects/namespace-id.js';
import { RecordId } from '../domain/value-objects/record-id.js';
import { RecordStatus, isRecordStatus } from '../domain/value-objects/record-status.js';
import { RecordType } from '../domain/value-objects/record-type.js';
import { RelationshipType, isRelationshipType } from '../domain/value-objects/relationship-type.js';
import { RevisionNumber } from '../domain/value-objects/revision-number.js';

export const REPOSITORY_ENTITY_NAMESPACE = 'Namespace';
export const REPOSITORY_ENTITY_COLLECTION = 'Collection';
export const REPOSITORY_ENTITY_VERSION = 'Version';
export const REPOSITORY_ENTITY_RELATIONSHIP = 'Relationship';

interface NamespaceContent {
  readonly namespaceType: string;
  readonly owner: string;
}

interface CollectionContent {
  readonly namespaceId: string;
  readonly collectionType: string;
}

interface VersionContent {
  readonly recordId: string;
  readonly revision: number;
  readonly content: unknown;
  readonly checksum: string;
  readonly author: string;
}

interface RelationshipContent {
  readonly sourceRecord: string;
  readonly targetRecord: string;
  readonly relationshipType: string;
}

interface RecordContentMetadata {
  readonly owner: string;
  readonly status: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export function namespaceToMemoryRecord(namespace: Namespace): MemoryRecord {
  return Object.freeze({
    id: namespace.namespaceId.toString(),
    type: REPOSITORY_ENTITY_NAMESPACE,
    content: Object.freeze({
      namespaceType: namespace.namespaceType.toString(),
      owner: namespace.owner,
    } satisfies NamespaceContent),
    metadata: Object.freeze({ ...namespace.metadata.custom }),
    timestamp: namespace.createdAt,
  });
}

export function memoryRecordToNamespace(record: MemoryRecord): Namespace {
  const content = record.content as NamespaceContent;

  return createNamespace({
    namespaceId: record.id,
    namespaceType: content.namespaceType,
    owner: content.owner,
    createdAt: record.timestamp,
    metadata: MemoryMetadata.create(record.metadata),
  });
}

export function collectionToMemoryRecord(collection: Collection): MemoryRecord {
  return Object.freeze({
    id: collection.collectionId.toString(),
    type: REPOSITORY_ENTITY_COLLECTION,
    content: Object.freeze({
      namespaceId: collection.namespaceId.toString(),
      collectionType: collection.collectionType.toString(),
    } satisfies CollectionContent),
    metadata: Object.freeze({ ...collection.metadata.custom }),
    timestamp: collection.createdAt,
  });
}

export function memoryRecordToCollection(record: MemoryRecord): Collection {
  const content = record.content as CollectionContent;

  return createCollection({
    collectionId: record.id,
    namespaceId: NamespaceId.create(content.namespaceId),
    collectionType: content.collectionType,
    createdAt: record.timestamp,
    metadata: MemoryMetadata.create(record.metadata),
  });
}

export function recordToMemoryRecord(record: Record, version: Version): MemoryRecord {
  const projected = projectMemoryRecord(record, version);
  const contentMetadata = Object.freeze({
    owner: record.owner,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  } satisfies RecordContentMetadata);

  return Object.freeze({
    ...projected,
    metadata: Object.freeze({
      ...projected.metadata,
      ...contentMetadata,
    }),
  });
}

export function memoryRecordToRecord(record: MemoryRecord): Record {
  const metadata = record.metadata;
  const namespaceId = typeof metadata.namespaceId === 'string' ? metadata.namespaceId : '';
  const collectionId = typeof metadata.collectionId === 'string' ? metadata.collectionId : '';
  const owner = typeof metadata.owner === 'string' ? metadata.owner : '';
  const statusValue = typeof metadata.status === 'string' ? metadata.status : RecordStatus.Active;
  const createdAt = typeof metadata.createdAt === 'string' ? metadata.createdAt : record.timestamp;
  const updatedAt = typeof metadata.updatedAt === 'string' ? metadata.updatedAt : record.timestamp;
  const revisionValue =
    typeof metadata.revision === 'number' ? metadata.revision : RevisionNumber.create(1).value;

  if (!isRecordStatus(statusValue)) {
    throw new Error(`Invalid record status "${statusValue}" in MemoryRecord projection`);
  }

  return Object.freeze({
    recordId: RecordId.create(record.id),
    namespaceId: NamespaceId.create(namespaceId),
    collectionId: CollectionId.create(collectionId),
    recordType: RecordType.create(record.type),
    status: statusValue,
    owner,
    metadata: MemoryMetadata.create(metadata),
    currentVersion: RevisionNumber.create(revisionValue),
    createdAt,
    updatedAt,
  });
}

export function versionToMemoryRecord(version: Version): MemoryRecord {
  return Object.freeze({
    id: version.versionId.toString(),
    type: REPOSITORY_ENTITY_VERSION,
    content: Object.freeze({
      recordId: version.recordId.toString(),
      revision: version.revision.value,
      content: version.content,
      checksum: version.checksum.toString(),
      author: version.author,
    } satisfies VersionContent),
    metadata: Object.freeze({ ...version.metadata.custom }),
    timestamp: version.createdAt,
  });
}

export function memoryRecordToVersion(record: MemoryRecord): Version {
  const content = record.content as VersionContent;

  return createVersion({
    versionId: record.id,
    recordId: RecordId.create(content.recordId),
    revision: RevisionNumber.create(content.revision),
    content: content.content,
    checksum: content.checksum,
    createdAt: record.timestamp,
    author: content.author,
    metadata: MemoryMetadata.create(record.metadata),
  });
}

export function relationshipToMemoryRecord(relationship: Relationship): MemoryRecord {
  return Object.freeze({
    id: relationship.relationshipId.toString(),
    type: REPOSITORY_ENTITY_RELATIONSHIP,
    content: Object.freeze({
      sourceRecord: relationship.sourceRecord.toString(),
      targetRecord: relationship.targetRecord.toString(),
      relationshipType: relationship.relationshipType,
    } satisfies RelationshipContent),
    metadata: Object.freeze({ ...relationship.metadata.custom }),
    timestamp: new Date(0).toISOString(),
  });
}

export function memoryRecordToRelationship(record: MemoryRecord): Relationship {
  const content = record.content as RelationshipContent;

  if (!isRelationshipType(content.relationshipType)) {
    throw new Error(`Invalid relationship type "${content.relationshipType}" in MemoryRecord projection`);
  }

  return createRelationship({
    relationshipId: record.id,
    sourceRecord: RecordId.create(content.sourceRecord),
    targetRecord: RecordId.create(content.targetRecord),
    relationshipType: content.relationshipType,
    metadata: MemoryMetadata.create(record.metadata),
  });
}

export function isEntityMemoryRecord(record: MemoryRecord, entityType: string): boolean {
  return record.type === entityType;
}

export function filterEntityMemoryRecords(
  records: readonly MemoryRecord[],
  entityType: string,
): readonly MemoryRecord[] {
  return Object.freeze(records.filter((record) => isEntityMemoryRecord(record, entityType)));
}

export function findEntityMemoryRecord(
  records: readonly MemoryRecord[],
  entityType: string,
  id: string,
): MemoryRecord | undefined {
  return records.find((record) => isEntityMemoryRecord(record, entityType) && record.id === id);
}

export function resolveRecordRevision(record: MemoryRecord): RevisionNumber {
  const revision = record.metadata.revision;
  return RevisionNumber.create(typeof revision === 'number' ? revision : 1);
}
