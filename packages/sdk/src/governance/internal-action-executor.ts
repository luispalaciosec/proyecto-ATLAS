import type { Atlas } from '../atlas/atlas.js';
import {
  GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
  INTERNAL_ACTION_RECORD_APPROVED_DISCOUNT,
} from './constants.js';
import type {
  GovernanceAuthorizationResult,
  InternalActionExecutionResult,
  InternalActionRequest,
  RecordApprovedDiscountActionRequest,
} from './governance-types.js';

export async function executeInternalAction(
  atlas: Atlas,
  request: InternalActionRequest,
  authorization: GovernanceAuthorizationResult,
): Promise<InternalActionExecutionResult> {
  if (!authorization.allowed) {
    throw new Error('Cannot execute internal action when governance authorization is denied');
  }

  switch (request.actionType) {
    case INTERNAL_ACTION_RECORD_APPROVED_DISCOUNT:
      return executeRecordApprovedDiscount(atlas, request, authorization);
    default:
      throw new Error(`Unsupported internal action type: ${String(request.actionType)}`);
  }
}

async function executeRecordApprovedDiscount(
  atlas: Atlas,
  request: RecordApprovedDiscountActionRequest,
  authorization: GovernanceAuthorizationResult,
): Promise<InternalActionExecutionResult> {
  const payload = Object.freeze({
    actionType: request.actionType,
    clientLegalName: request.clientLegalName.trim(),
    requestedPercent: request.requestedPercent,
    recordedAt: new Date().toISOString(),
    ...(request.requestId !== undefined ? { requestId: request.requestId } : {}),
    governance: Object.freeze({
      workspace: request.workspace,
      ...(authorization.decisionId !== undefined ? { decisionId: authorization.decisionId } : {}),
      ...(authorization.policyId !== undefined ? { policyId: authorization.policyId } : {}),
      ...(authorization.evidenceIds !== undefined && authorization.evidenceIds.length > 0
        ? { evidenceIds: authorization.evidenceIds }
        : {}),
      ...(authorization.requiredApprovalRole !== undefined
        ? { requiredApprovalRole: authorization.requiredApprovalRole }
        : {}),
    }),
  });

  const stored = await atlas.memory.storeContent({
    content: JSON.stringify(payload),
    recordType: GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
    metadata: Object.freeze({
      workspace: request.workspace,
      actionType: request.actionType,
      clientLegalName: request.clientLegalName.trim(),
      requestedPercent: request.requestedPercent,
      ...(authorization.decisionId !== undefined ? { decisionId: authorization.decisionId } : {}),
      ...(authorization.policyId !== undefined ? { policyId: authorization.policyId } : {}),
    }),
  });

  return Object.freeze({
    actionType: request.actionType,
    workspace: request.workspace,
    clientLegalName: request.clientLegalName.trim(),
    requestedPercent: request.requestedPercent,
    ...(request.requestId !== undefined ? { requestId: request.requestId } : {}),
    recordId: stored.recordId,
  });
}
