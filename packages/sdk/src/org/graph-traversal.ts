import type { MemoryRecord } from '@atlas/memory';

import type { Atlas } from '../atlas/atlas.js';
import { ORG_RECORD_TYPE_RELATIONSHIP } from './constants.js';
import { isOrgRelationshipContent, parseOrgContent } from './record-content.js';
import { listRecordsByType, resolveAnyEntityById } from './entity-resolver.js';

export async function getRelated(
  atlas: Atlas,
  recordId: string,
  relationshipType?: string,
): Promise<readonly MemoryRecord[]> {
  const trimmedRecordId = recordId.trim();

  if (trimmedRecordId.length === 0) {
    throw new Error('recordId must be a non-empty string');
  }

  const relationships = await listRecordsByType(atlas, ORG_RECORD_TYPE_RELATIONSHIP);
  const normalizedRelationshipType =
    typeof relationshipType === 'string' && relationshipType.trim().length > 0
      ? relationshipType.trim()
      : undefined;

  const matchingRelationships = relationships.filter((record) => {
    const content = parseOrgContent(record);

    if (!isOrgRelationshipContent(content)) {
      return false;
    }

    if (content.sourceRecord !== trimmedRecordId) {
      return false;
    }

    if (
      normalizedRelationshipType !== undefined &&
      content.relationshipType !== normalizedRelationshipType
    ) {
      return false;
    }

    return true;
  });

  const resolvedTargets = await Promise.all(
    matchingRelationships.map(async (relationshipRecord) => {
      const content = parseOrgContent(relationshipRecord);

      if (!isOrgRelationshipContent(content)) {
        return undefined;
      }

      return resolveAnyEntityById(atlas, content.targetRecord);
    }),
  );

  return Object.freeze(
    resolvedTargets.filter((record): record is MemoryRecord => record !== undefined),
  );
}
