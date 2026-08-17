import type { MemoryRecord } from '@atlas/memory';

export interface OrgRelationshipContent {
  readonly sourceRecord: string;
  readonly targetRecord: string;
  readonly relationshipType: string;
}

export interface OrgVersionContent {
  readonly recordId: string;
  readonly revision: number;
  readonly content: unknown;
  readonly author: string;
}

export function extractRecordText(record: MemoryRecord): string {
  if (typeof record.content === 'string') {
    return record.content;
  }

  if (
    record.content !== null &&
    typeof record.content === 'object' &&
    'text' in record.content &&
    typeof (record.content as { text?: unknown }).text === 'string'
  ) {
    return (record.content as { text: string }).text;
  }

  return JSON.stringify(record.content);
}

export function serializeOrgContent(content: unknown): string {
  return JSON.stringify(content);
}

export function parseOrgContent(record: MemoryRecord): unknown {
  const text = extractRecordText(record).trim();

  if (text.length === 0) {
    throw new Error(`Record "${record.id}" has empty organizational content`);
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`Record "${record.id}" content is not valid organizational JSON`);
  }
}

export function getEntityId(record: MemoryRecord): string {
  const metadataEntityId = record.metadata.entityId;

  if (typeof metadataEntityId === 'string' && metadataEntityId.trim().length > 0) {
    return metadataEntityId.trim();
  }

  return record.id;
}

export function readMetadataNumber(record: MemoryRecord, key: string): number | undefined {
  const value = record.metadata[key];

  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function isOrgRelationshipContent(value: unknown): value is OrgRelationshipContent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<OrgRelationshipContent>;

  return (
    typeof candidate.sourceRecord === 'string' &&
    candidate.sourceRecord.trim().length > 0 &&
    typeof candidate.targetRecord === 'string' &&
    candidate.targetRecord.trim().length > 0 &&
    typeof candidate.relationshipType === 'string' &&
    candidate.relationshipType.trim().length > 0
  );
}

export function isOrgVersionContent(value: unknown): value is OrgVersionContent {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<OrgVersionContent>;

  return (
    typeof candidate.recordId === 'string' &&
    candidate.recordId.trim().length > 0 &&
    typeof candidate.revision === 'number' &&
    Number.isFinite(candidate.revision) &&
    typeof candidate.author === 'string' &&
    candidate.author.trim().length > 0 &&
    'content' in candidate
  );
}
