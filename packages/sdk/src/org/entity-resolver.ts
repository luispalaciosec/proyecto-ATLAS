import type { MemoryRecord } from '@atlas/memory';

import type { Atlas } from '../atlas/atlas.js';
import {
  ORG_ENTITY_RECORD_TYPES,
  ORG_RECORD_TYPE_VERSION,
  type OrgEntityRecordType,
} from './constants.js';
import {
  getEntityId,
  isOrgVersionContent,
  parseOrgContent,
  readMetadataNumber,
} from './record-content.js';

export type EntityMatcher = Readonly<Record<string, unknown>>;

function matchesEntityContent(content: unknown, matcher: EntityMatcher): boolean {
  if (typeof content !== 'object' || content === null) {
    return false;
  }

  const candidate = content as Record<string, unknown>;

  return Object.entries(matcher).every(([key, expectedValue]) => candidate[key] === expectedValue);
}

function dedupeRecordsByEntityId(
  records: readonly MemoryRecord[],
): readonly MemoryRecord[] {
  const latestByEntityId = new Map<string, MemoryRecord>();

  for (const record of records) {
    const entityId = getEntityId(record);
    const existing = latestByEntityId.get(entityId);

    if (existing === undefined || record.timestamp.localeCompare(existing.timestamp) > 0) {
      latestByEntityId.set(entityId, record);
    }
  }

  return Object.freeze([...latestByEntityId.values()]);
}

export async function listRecordsByType(
  atlas: Atlas,
  recordType: string,
): Promise<readonly MemoryRecord[]> {
  const result = await atlas.memory.searchContent({ query: '', recordType });

  return dedupeRecordsByEntityId(result.records);
}

export async function resolveEntityById(
  atlas: Atlas,
  entityId: string,
  recordType?: OrgEntityRecordType,
): Promise<MemoryRecord | undefined> {
  const trimmedEntityId = entityId.trim();

  if (trimmedEntityId.length === 0) {
    throw new Error('entityId must be a non-empty string');
  }

  const recordTypes = recordType !== undefined ? [recordType] : ORG_ENTITY_RECORD_TYPES;

  for (const type of recordTypes) {
    const records = await listRecordsByType(atlas, type);
    const match = records.find((record) => getEntityId(record) === trimmedEntityId);

    if (match !== undefined) {
      return match;
    }
  }

  return undefined;
}

export async function resolveEntity(
  atlas: Atlas,
  recordType: string,
  matcher: EntityMatcher,
): Promise<MemoryRecord | undefined> {
  if (Object.keys(matcher).length === 0) {
    throw new Error('matcher must include at least one field');
  }

  const records = await listRecordsByType(atlas, recordType);

  return records.find((record) => {
    try {
      return matchesEntityContent(readEntityPayload(record), matcher);
    } catch {
      return false;
    }
  });
}

export async function getEntityHistory(
  atlas: Atlas,
  recordId: string,
): Promise<readonly MemoryRecord[]> {
  const trimmedRecordId = recordId.trim();

  if (trimmedRecordId.length === 0) {
    throw new Error('recordId must be a non-empty string');
  }

  const versions = await listRecordsByType(atlas, ORG_RECORD_TYPE_VERSION);

  return Object.freeze(
    versions
      .filter((record) => {
        const content = parseOrgContent(record);

        return isOrgVersionContent(content) && content.recordId === trimmedRecordId;
      })
      .sort((left, right) => {
        const leftContent = parseOrgContent(left);
        const rightContent = parseOrgContent(right);
        const leftRevision =
          readMetadataNumber(left, 'revision') ??
          (isOrgVersionContent(leftContent) ? leftContent.revision : 0);
        const rightRevision =
          readMetadataNumber(right, 'revision') ??
          (isOrgVersionContent(rightContent) ? rightContent.revision : 0);

        return leftRevision - rightRevision;
      }),
  );
}

export function readEntityPayload(record: MemoryRecord): Record<string, unknown> {
  const content = parseOrgContent(record);

  if (typeof content !== 'object' || content === null) {
    throw new Error(`Record "${record.id}" organizational payload must be an object`);
  }

  const payload = { ...(content as Record<string, unknown>) };
  delete payload.entityId;
  delete payload.recordType;

  return payload;
}
