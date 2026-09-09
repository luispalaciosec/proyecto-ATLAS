import type { MemoryRecord } from '@atlas/memory';

import type { Atlas } from '../atlas/atlas.js';
import { ORG_RECORD_TYPE_DECISION, ORG_RELATIONSHIP_CITES } from './constants.js';
import { getEntityId } from './record-content.js';
import { getRelated } from './graph-traversal.js';
import { listRecordsByType, readEntityPayload } from './entity-resolver.js';
import { parseDecision } from './schemas/decision.js';

export interface ResolvedDecisionWithEvidence {
  readonly decision: MemoryRecord;
  readonly evidence: readonly MemoryRecord[];
}

export async function resolveDecisionsForClient(
  atlas: Atlas,
  clientLegalName: string,
  subjectType?: string,
): Promise<readonly MemoryRecord[]> {
  const trimmedClientLegalName = clientLegalName.trim();

  if (trimmedClientLegalName.length === 0) {
    throw new Error('clientLegalName must be a non-empty string');
  }

  const normalizedSubjectType =
    typeof subjectType === 'string' && subjectType.trim().length > 0
      ? subjectType.trim()
      : undefined;

  const decisions = await listRecordsByType(atlas, ORG_RECORD_TYPE_DECISION);

  const matches = decisions.filter((record) => {
    try {
      const payload = readEntityPayload(record);
      const decision = parseDecision(payload);

      if (decision.clientLegalName !== trimmedClientLegalName) {
        return false;
      }

      if (normalizedSubjectType !== undefined && decision.subjectType !== normalizedSubjectType) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  });

  return Object.freeze(
    [...matches].sort((left, right) => {
      const leftDecision = parseDecision(readEntityPayload(left));
      const rightDecision = parseDecision(readEntityPayload(right));

      return rightDecision.decidedAt.localeCompare(leftDecision.decidedAt);
    }),
  );
}

export async function resolveDecisionWithEvidence(
  atlas: Atlas,
  clientLegalName: string,
  subjectType?: string,
): Promise<ResolvedDecisionWithEvidence | undefined> {
  const decisions = await resolveDecisionsForClient(atlas, clientLegalName, subjectType);
  const decision = decisions[0];

  if (decision === undefined) {
    return undefined;
  }

  const evidence = await getRelated(atlas, getEntityId(decision), ORG_RELATIONSHIP_CITES);

  return Object.freeze({
    decision,
    evidence,
  });
}
