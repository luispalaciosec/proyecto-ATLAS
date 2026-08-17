import type { Atlas } from '../atlas/atlas.js';
import type { StoreMemoryContentResult } from '../modules/memory-module.js';
import {
  ORG_COLLECTION_ENTITIES,
  ORG_NAMESPACE_ID,
  ORG_RECORD_TYPE_RELATIONSHIP,
} from './constants.js';
import { serializeOrgContent } from './record-content.js';
import { resolveEntityById } from './entity-resolver.js';

export async function linkEntities(
  atlas: Atlas,
  sourceId: string,
  targetId: string,
  relationshipType: string,
  metadata: Readonly<Record<string, unknown>> = {},
): Promise<StoreMemoryContentResult> {
  const trimmedSourceId = sourceId.trim();
  const trimmedTargetId = targetId.trim();
  const trimmedRelationshipType = relationshipType.trim();

  if (trimmedSourceId.length === 0 || trimmedTargetId.length === 0) {
    throw new Error('sourceId and targetId must be non-empty strings');
  }

  if (trimmedRelationshipType.length === 0) {
    throw new Error('relationshipType must be a non-empty string');
  }

  const sourceRecord = await resolveEntityById(atlas, trimmedSourceId);

  if (sourceRecord === undefined) {
    throw new Error(`Source entity "${trimmedSourceId}" was not found`);
  }

  const targetRecord = await resolveEntityById(atlas, trimmedTargetId);

  if (targetRecord === undefined) {
    throw new Error(`Target entity "${trimmedTargetId}" was not found`);
  }

  const relationshipContent = Object.freeze({
    sourceRecord: trimmedSourceId,
    targetRecord: trimmedTargetId,
    relationshipType: trimmedRelationshipType,
  });

  const relationshipId = `relationship.${trimmedSourceId}.${trimmedRelationshipType}.${trimmedTargetId}`;

  return atlas.memory.storeContent({
    content: serializeOrgContent(relationshipContent),
    recordType: ORG_RECORD_TYPE_RELATIONSHIP,
    metadata: Object.freeze({
      namespaceId: ORG_NAMESPACE_ID,
      collectionId: ORG_COLLECTION_ENTITIES,
      entityId: relationshipId,
      sourceRecord: trimmedSourceId,
      targetRecord: trimmedTargetId,
      relationshipType: trimmedRelationshipType,
      ...metadata,
    }),
  });
}
