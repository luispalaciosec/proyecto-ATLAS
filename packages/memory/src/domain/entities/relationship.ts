import type { MemoryMetadata } from '../value-objects/memory-metadata.js';
import type { RecordId } from '../value-objects/record-id.js';
import type { RelationshipId } from '../value-objects/relationship-id.js';
import type { RelationshipType } from '../value-objects/relationship-type.js';

export interface Relationship {
  readonly relationshipId: RelationshipId;
  readonly sourceRecord: RecordId;
  readonly targetRecord: RecordId;
  readonly relationshipType: RelationshipType;
  readonly metadata: MemoryMetadata;
}

export type RelationshipSnapshot = Relationship;
