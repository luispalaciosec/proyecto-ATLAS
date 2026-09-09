import type { Atlas } from '@atlas/sdk';
import {
  GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
  parseActionOperationalResultFromRecord,
} from '@atlas/sdk';

import type { RawActivityEvent } from '../../presentation/map-activity.js';

function mapOperationalResultToActivity(
  recordId: string,
  payload: ReturnType<typeof parseActionOperationalResultFromRecord>,
): RawActivityEvent {
  const goal = `${payload.clientLegalName} · descuento ${payload.requestedPercent}%`;

  if (payload.status === 'executed') {
    return Object.freeze({
      id: `governance.${recordId}`,
      kind: 'conversation',
      workspace: payload.workspace,
      occurredAt: payload.executedAt,
      status: 'success',
      goal,
      success: true,
      mode: 'deterministic',
      recordId: payload.capabilityRecordId ?? recordId,
      governanceStatus: 'executed',
      resultRecordId: recordId,
      ...(payload.authorization.decisionId !== undefined
        ? { decisionId: payload.authorization.decisionId }
        : {}),
      ...(payload.authorization.policyId !== undefined
        ? { policyId: payload.authorization.policyId }
        : {}),
      ...(payload.eventId !== undefined ? { eventId: String(payload.eventId) } : {}),
    });
  }

  return Object.freeze({
    id: `governance.${recordId}`,
    kind: 'error',
    workspace: payload.workspace,
    occurredAt: payload.executedAt,
    status: 'warning',
    goal,
    errorMessage: payload.authorization.reason,
    governanceStatus: 'blocked',
    resultRecordId: recordId,
    ...(payload.authorization.decisionId !== undefined
      ? { decisionId: payload.authorization.decisionId }
      : {}),
    ...(payload.authorization.policyId !== undefined
      ? { policyId: payload.authorization.policyId }
      : {}),
    ...(payload.eventId !== undefined ? { eventId: String(payload.eventId) } : {}),
  });
}

export async function deriveGovernanceActivityEvents(
  atlas: Atlas,
  workspaceKey: string | undefined,
): Promise<readonly RawActivityEvent[]> {
  const workspace = workspaceKey?.trim() || 'default';
  const listed = await atlas.memory.listRecords({
    recordType: GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
  });

  const events: RawActivityEvent[] = [];

  for (const record of listed.records) {
    if (record.metadata.workspace !== workspace) {
      continue;
    }

    try {
      const payload = parseActionOperationalResultFromRecord(record);
      events.push(mapOperationalResultToActivity(record.id, payload));
    } catch {
      // Skip malformed operational results.
    }
  }

  return Object.freeze(events);
}
