import type { Atlas } from '../atlas/atlas.js';
import type { StoreMemoryContentResult } from '../modules/memory-module.js';
import {
  ORG_COLLECTION_DECISIONS,
  ORG_NAMESPACE_ID,
  ORG_RECORD_TYPE_DECISION,
  ORG_RECORD_TYPE_EVIDENCE,
  ORG_RELATIONSHIP_CITES,
  ORG_RELATIONSHIP_RESOLVES,
} from './constants.js';
import { linkEntities } from './relationship-store.js';
import { serializeOrgContent } from './record-content.js';
import { assertDecision, parseDecision, type Decision } from './schemas/decision.js';
import { assertEvidence } from './schemas/evidence.js';

function buildJournalSearchText(recordType: string, entityId: string, content: unknown): string {
  return serializeOrgContent(
    Object.freeze({
      entityId,
      recordType,
      ...(typeof content === 'object' && content !== null ? content : { value: content }),
    }),
  );
}

export async function storeDecision(
  atlas: Atlas,
  entityId: string,
  content: unknown,
): Promise<StoreMemoryContentResult> {
  const trimmedId = entityId.trim();

  if (trimmedId.length === 0) {
    throw new Error('Decision entityId must be a non-empty string');
  }

  assertDecision(content);

  return atlas.memory.storeContent({
    content: buildJournalSearchText(ORG_RECORD_TYPE_DECISION, trimmedId, content),
    recordType: ORG_RECORD_TYPE_DECISION,
    metadata: Object.freeze({
      namespaceId: ORG_NAMESPACE_ID,
      collectionId: ORG_COLLECTION_DECISIONS,
      entityId: trimmedId,
      status: 'active',
      revision: 1,
    }),
  });
}

export async function storeEvidence(
  atlas: Atlas,
  entityId: string,
  content: unknown,
): Promise<StoreMemoryContentResult> {
  const trimmedId = entityId.trim();

  if (trimmedId.length === 0) {
    throw new Error('Evidence entityId must be a non-empty string');
  }

  assertEvidence(content);

  return atlas.memory.storeContent({
    content: buildJournalSearchText(ORG_RECORD_TYPE_EVIDENCE, trimmedId, content),
    recordType: ORG_RECORD_TYPE_EVIDENCE,
    metadata: Object.freeze({
      namespaceId: ORG_NAMESPACE_ID,
      collectionId: ORG_COLLECTION_DECISIONS,
      entityId: trimmedId,
      status: 'active',
      revision: 1,
    }),
  });
}

export async function recordDecision(
  atlas: Atlas,
  entityId: string,
  content: Decision | unknown,
  targetEntityId: string,
  evidenceIds: readonly string[] = [],
): Promise<{ readonly decisionId: string }> {
  const trimmedDecisionId = entityId.trim();
  const trimmedTargetId = targetEntityId.trim();
  const decision = parseDecision(content);

  if (trimmedDecisionId.length === 0) {
    throw new Error('Decision entityId must be a non-empty string');
  }

  if (trimmedTargetId.length === 0) {
    throw new Error('targetEntityId must be a non-empty string');
  }

  await storeDecision(atlas, trimmedDecisionId, decision);
  await linkEntities(atlas, trimmedDecisionId, trimmedTargetId, ORG_RELATIONSHIP_RESOLVES);

  for (const evidenceId of evidenceIds) {
    await linkEntities(atlas, trimmedDecisionId, evidenceId, ORG_RELATIONSHIP_CITES);
  }

  return Object.freeze({ decisionId: trimmedDecisionId });
}
