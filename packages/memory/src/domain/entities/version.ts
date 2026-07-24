import type { Checksum } from '../value-objects/checksum.js';
import type { MemoryMetadata } from '../value-objects/memory-metadata.js';
import type { RecordId } from '../value-objects/record-id.js';
import type { RevisionNumber } from '../value-objects/revision-number.js';
import type { VersionId } from '../value-objects/version-id.js';

export interface Version {
  readonly versionId: VersionId;
  readonly recordId: RecordId;
  readonly revision: RevisionNumber;
  readonly content: unknown;
  readonly checksum: Checksum;
  readonly createdAt: string;
  readonly author: string;
  readonly metadata: MemoryMetadata;
}

export type VersionSnapshot = Version;
