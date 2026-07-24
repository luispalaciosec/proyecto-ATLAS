import type { CollectionId } from '../value-objects/collection-id.js';
import type { MemoryMetadata } from '../value-objects/memory-metadata.js';
import type { NamespaceId } from '../value-objects/namespace-id.js';
import type { RecordId } from '../value-objects/record-id.js';
import type { RecordStatus } from '../value-objects/record-status.js';
import type { RecordType } from '../value-objects/record-type.js';
import type { RevisionNumber } from '../value-objects/revision-number.js';

export interface Record {
  readonly recordId: RecordId;
  readonly namespaceId: NamespaceId;
  readonly collectionId: CollectionId;
  readonly recordType: RecordType;
  readonly status: RecordStatus;
  readonly owner: string;
  readonly metadata: MemoryMetadata;
  readonly currentVersion: RevisionNumber;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type RecordSnapshot = Record;
