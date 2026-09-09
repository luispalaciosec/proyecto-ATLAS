import type { Identifier } from '@atlas/core';
import type { MemoryRecord } from '@atlas/memory';

import type { Atlas } from '../atlas/atlas.js';
import {
  GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
  type InternalActionType,
} from './constants.js';
import type { GovernanceAuthorizationResult, InternalActionRequest } from './governance-types.js';

export type ActionOperationalResultStatus = 'executed' | 'blocked';

export interface ActionOperationalAuthorizationSnapshot {
  readonly allowed: boolean;
  readonly reason: string;
  readonly requiredApprovalRole?: string;
  readonly decisionId?: string;
  readonly policyId?: string;
  readonly evidenceIds?: readonly string[];
}

export interface ActionOperationalResultPayload {
  readonly actionType: InternalActionType;
  readonly workspace: string;
  readonly clientLegalName: string;
  readonly requestedPercent: number;
  readonly requestId?: string;
  readonly status: ActionOperationalResultStatus;
  readonly executed: boolean;
  readonly executedAt: string;
  readonly authorization: ActionOperationalAuthorizationSnapshot;
  readonly eventId?: Identifier;
  readonly capabilityRecordId?: string;
}

export interface PersistedActionOperationalResult {
  readonly recordId: string;
  readonly payload: ActionOperationalResultPayload;
}

function snapshotAuthorization(
  authorization: GovernanceAuthorizationResult,
): ActionOperationalAuthorizationSnapshot {
  return Object.freeze({
    allowed: authorization.allowed,
    reason: authorization.reason,
    ...(authorization.requiredApprovalRole !== undefined
      ? { requiredApprovalRole: authorization.requiredApprovalRole }
      : {}),
    ...(authorization.decisionId !== undefined ? { decisionId: authorization.decisionId } : {}),
    ...(authorization.policyId !== undefined ? { policyId: authorization.policyId } : {}),
    ...(authorization.evidenceIds !== undefined && authorization.evidenceIds.length > 0
      ? { evidenceIds: authorization.evidenceIds }
      : {}),
  });
}

export function buildExecutedOperationalResult(
  request: InternalActionRequest,
  authorization: GovernanceAuthorizationResult,
  capabilityRecordId: string,
  executedAt: string,
  eventId?: Identifier,
): ActionOperationalResultPayload {
  return Object.freeze({
    actionType: request.actionType,
    workspace: request.workspace,
    clientLegalName: request.clientLegalName.trim(),
    requestedPercent: request.requestedPercent,
    ...(request.requestId !== undefined ? { requestId: request.requestId } : {}),
    status: 'executed',
    executed: true,
    executedAt,
    authorization: snapshotAuthorization(authorization),
    capabilityRecordId,
    ...(eventId !== undefined ? { eventId } : {}),
  });
}

export function buildBlockedOperationalResult(
  request: InternalActionRequest,
  authorization: GovernanceAuthorizationResult,
  attemptedAt: string,
  eventId?: Identifier,
): ActionOperationalResultPayload {
  return Object.freeze({
    actionType: request.actionType,
    workspace: request.workspace,
    clientLegalName: request.clientLegalName.trim(),
    requestedPercent: request.requestedPercent,
    ...(request.requestId !== undefined ? { requestId: request.requestId } : {}),
    status: 'blocked',
    executed: false,
    executedAt: attemptedAt,
    authorization: snapshotAuthorization(authorization),
    ...(eventId !== undefined ? { eventId } : {}),
  });
}

export function buildOperationalResultSearchText(payload: ActionOperationalResultPayload): string {
  if (payload.status === 'executed') {
    return [
      payload.clientLegalName,
      'descuento aprobado',
      `${payload.requestedPercent}%`,
      `workspace ${payload.workspace}`,
      payload.authorization.policyId ?? '',
      payload.authorization.decisionId ?? '',
      ...(payload.authorization.evidenceIds ?? []),
    ]
      .filter((part) => part.length > 0)
      .join(' ');
  }

  return [
    payload.clientLegalName,
    'descuento bloqueado',
    `${payload.requestedPercent}%`,
    `workspace ${payload.workspace}`,
    payload.authorization.requiredApprovalRole ?? '',
    payload.authorization.reason,
  ]
    .filter((part) => part.length > 0)
    .join(' ');
}

export async function persistActionOperationalResult(
  atlas: Atlas,
  payload: ActionOperationalResultPayload,
): Promise<PersistedActionOperationalResult> {
  const searchText = buildOperationalResultSearchText(payload);

  const stored = await atlas.memory.storeStructuredRecord({
    recordType: GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
    content: Object.freeze({
      text: searchText,
      operationalResult: payload,
    }),
    metadata: Object.freeze({
      source: 'atlas-governance',
      workspace: payload.workspace,
      actionType: payload.actionType,
      status: payload.status,
      executed: payload.executed,
      clientLegalName: payload.clientLegalName,
      requestedPercent: payload.requestedPercent,
      ...(payload.requestId !== undefined ? { requestId: payload.requestId } : {}),
      ...(payload.authorization.decisionId !== undefined
        ? { decisionId: payload.authorization.decisionId }
        : {}),
      ...(payload.authorization.policyId !== undefined
        ? { policyId: payload.authorization.policyId }
        : {}),
      ...(payload.authorization.evidenceIds !== undefined &&
      payload.authorization.evidenceIds.length > 0
        ? { evidenceIds: payload.authorization.evidenceIds }
        : {}),
      ...(payload.capabilityRecordId !== undefined
        ? { capabilityRecordId: payload.capabilityRecordId }
        : {}),
      ...(payload.eventId !== undefined ? { eventId: payload.eventId } : {}),
    }),
  });

  return Object.freeze({
    recordId: stored.recordId,
    payload,
  });
}

function isOperationalResultContent(value: unknown): value is {
  readonly text: string;
  readonly operationalResult: ActionOperationalResultPayload;
} {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as {
    text?: unknown;
    operationalResult?: unknown;
  };

  return typeof candidate.text === 'string' && typeof candidate.operationalResult === 'object';
}

export function parseActionOperationalResultFromRecord(
  record: MemoryRecord,
): ActionOperationalResultPayload {
  if (record.type !== GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT) {
    throw new Error(`Record "${record.id}" is not an ActionOperationalResult`);
  }

  if (isOperationalResultContent(record.content)) {
    return record.content.operationalResult;
  }

  if (
    record.content !== null &&
    typeof record.content === 'object' &&
    'operationalResult' in record.content
  ) {
    return (record.content as { operationalResult: ActionOperationalResultPayload })
      .operationalResult;
  }

  throw new Error(`Record "${record.id}" does not contain a valid operational result payload`);
}
