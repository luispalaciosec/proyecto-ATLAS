import type { Atlas } from '../atlas/atlas.js';
import {
  ORG_RECORD_TYPE_APPROVAL_RULE,
  ORG_RECORD_TYPE_CLIENT,
  ORG_RECORD_TYPE_DISCOUNT_POLICY,
  ORG_RELATIONSHIP_DEPENDENCY,
  ORG_RELATIONSHIP_REFERENCE,
} from './constants.js';
import { getEntityId } from './record-content.js';
import { readEntityPayload, resolveEntity } from './entity-resolver.js';
import { getRelated } from './graph-traversal.js';
import { parseApprovalRule, type ApprovalRule } from './schemas/approval-rule.js';
import { parseClient, type Client } from './schemas/client.js';
import { parseDiscountPolicy, type DiscountPolicy } from './schemas/discount-policy.js';

export interface DiscountEvaluation {
  readonly autonomous: boolean;
  readonly limitPercent: number;
  readonly requestedPercent: number;
  readonly client: Client;
  readonly policy?: DiscountPolicy;
  readonly approverRole?: string;
  readonly reasoning: readonly string[];
}

export async function evaluateDiscountRequest(
  atlas: Atlas,
  clientLegalName: string,
  requestedPercent: number,
): Promise<DiscountEvaluation> {
  if (!Number.isFinite(requestedPercent)) {
    throw new Error('requestedPercent must be a finite number');
  }

  const reasoning: string[] = [];
  const clientRecord = await resolveEntity(atlas, ORG_RECORD_TYPE_CLIENT, {
    legalName: clientLegalName.trim(),
  });

  if (clientRecord === undefined) {
    throw new Error(`Client "${clientLegalName}" was not found`);
  }

  const client = parseClient(readEntityPayload(clientRecord));
  reasoning.push(`Cliente ${client.legalName} (${client.segment}).`);

  if (client.segment !== 'VIP') {
    reasoning.push('El segmento del cliente no es VIP.');
  }

  if (!client.renewalActive) {
    reasoning.push('La renovación del cliente no está activa.');
  }

  const discountPolicies = await getRelated(
    atlas,
    getEntityId(clientRecord),
    ORG_RELATIONSHIP_REFERENCE,
  );
  const discountPolicyRecord = discountPolicies.find(
    (record) => record.type === ORG_RECORD_TYPE_DISCOUNT_POLICY,
  );

  if (discountPolicyRecord === undefined) {
    throw new Error(`Discount policy linked to client "${clientLegalName}" was not found`);
  }

  const policy = parseDiscountPolicy(readEntityPayload(discountPolicyRecord));
  reasoning.push(
    `Política ${policy.policyCode}: límite autónomo ${policy.autonomousMaxPercent}%.`,
  );

  const autonomous = requestedPercent <= policy.autonomousMaxPercent;
  reasoning.push(
    autonomous
      ? `El ${requestedPercent}% solicitado está dentro del límite autónomo.`
      : `El ${requestedPercent}% solicitado excede el límite autónomo de ${policy.autonomousMaxPercent}%.`,
  );

  let approverRole: string | undefined;
  let approvalRule: ApprovalRule | undefined;

  if (!autonomous) {
    const approvalRules = await getRelated(
      atlas,
      getEntityId(discountPolicyRecord),
      ORG_RELATIONSHIP_DEPENDENCY,
    );
    const approvalRuleRecord = approvalRules.find(
      (record) => record.type === ORG_RECORD_TYPE_APPROVAL_RULE,
    );

    if (approvalRuleRecord === undefined) {
      throw new Error(`Approval rule linked to policy "${policy.policyCode}" was not found`);
    }

    approvalRule = parseApprovalRule(readEntityPayload(approvalRuleRecord));
    approverRole = approvalRule.approverRole;
    reasoning.push(`Requiere aprobación de ${approvalRule.approverRole}.`);
  }

  return Object.freeze({
    autonomous,
    limitPercent: policy.autonomousMaxPercent,
    requestedPercent,
    client,
    policy,
    ...(approverRole !== undefined ? { approverRole } : {}),
    reasoning: Object.freeze([...reasoning]),
  });
}
