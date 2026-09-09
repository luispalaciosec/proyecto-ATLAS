import type { Atlas } from '../atlas/atlas.js';
import { readEntityPayload } from '../org/entity-resolver.js';
import { resolveDecisionWithEvidence } from '../org/decision-resolver.js';
import { evaluateDiscountRequest } from '../org/policy-evaluator.js';
import { getEntityId } from '../org/record-content.js';
import { parseDecision } from '../org/schemas/decision.js';
import type {
  GovernanceAuthorizationResult,
  InternalActionRequest,
  RecordApprovedDiscountActionRequest,
} from './governance-types.js';
import { INTERNAL_ACTION_RECORD_APPROVED_DISCOUNT } from './constants.js';

export async function authorizeInternalAction(
  atlas: Atlas,
  request: InternalActionRequest,
): Promise<GovernanceAuthorizationResult> {
  switch (request.actionType) {
    case INTERNAL_ACTION_RECORD_APPROVED_DISCOUNT:
      return authorizeRecordApprovedDiscount(atlas, request);
    default:
      throw new Error(`Unsupported internal action type: ${String(request.actionType)}`);
  }
}

async function authorizeRecordApprovedDiscount(
  atlas: Atlas,
  request: RecordApprovedDiscountActionRequest,
): Promise<GovernanceAuthorizationResult> {
  const clientLegalName = request.clientLegalName.trim();
  const evaluation = await evaluateDiscountRequest(
    atlas,
    clientLegalName,
    request.requestedPercent,
  );

  const policyId = evaluation.policy?.policyCode;
  const evaluationTrace = evaluation.reasoning;

  if (evaluation.autonomous) {
    return Object.freeze({
      allowed: true,
      reason: `El ${evaluation.requestedPercent}% está dentro del límite autónomo de ${evaluation.limitPercent}%.`,
      workspace: request.workspace,
      actionType: request.actionType,
      policyId,
      evaluationTrace,
    });
  }

  const requiredApprovalRole = evaluation.approverRole;

  const resolved = await resolveDecisionWithEvidence(atlas, clientLegalName, 'discount_request');

  if (resolved === undefined) {
    return Object.freeze({
      allowed: false,
      reason: `Requiere aprobación de ${requiredApprovalRole ?? 'rol desconocido'} para ${evaluation.requestedPercent}% (límite autónomo ${evaluation.limitPercent}%).`,
      workspace: request.workspace,
      actionType: request.actionType,
      requiredApprovalRole,
      policyId,
      evaluationTrace,
    });
  }

  const decisionEntityId = getEntityId(resolved.decision);
  const decision = parseDecision(readEntityPayload(resolved.decision));
  const evidenceIds = Object.freeze(resolved.evidence.map((record) => getEntityId(record)));

  if (decision.outcome !== 'approved') {
    return Object.freeze({
      allowed: false,
      reason: `La decisión más reciente fue "${decision.outcome}" y no autoriza la ejecución.`,
      workspace: request.workspace,
      actionType: request.actionType,
      requiredApprovalRole,
      decisionId: decisionEntityId,
      policyId,
      evidenceIds,
      evaluationTrace,
    });
  }

  if (decision.requestedPercent !== request.requestedPercent) {
    return Object.freeze({
      allowed: false,
      reason: `La aprobación registrada cubre ${decision.requestedPercent}%, no ${request.requestedPercent}%.`,
      workspace: request.workspace,
      actionType: request.actionType,
      requiredApprovalRole,
      decisionId: decisionEntityId,
      policyId,
      evidenceIds,
      evaluationTrace,
    });
  }

  if (
    requiredApprovalRole !== undefined &&
    decision.decidedBy.trim() !== requiredApprovalRole.trim()
  ) {
    return Object.freeze({
      allowed: false,
      reason: `La decisión fue registrada por ${decision.decidedBy}, pero se requiere ${requiredApprovalRole}.`,
      workspace: request.workspace,
      actionType: request.actionType,
      requiredApprovalRole,
      decisionId: decisionEntityId,
      policyId,
      evidenceIds,
      evaluationTrace,
    });
  }

  return Object.freeze({
    allowed: true,
    reason: `Aprobación organizacional registrada por ${decision.decidedBy}.`,
    workspace: request.workspace,
    actionType: request.actionType,
    requiredApprovalRole,
    decisionId: decisionEntityId,
    policyId,
    evidenceIds,
    evaluationTrace,
  });
}
