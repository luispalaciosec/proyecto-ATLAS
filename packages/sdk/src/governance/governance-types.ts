import type { Identifier } from '@atlas/core';

import type { InternalActionType } from './constants.js';
import type { ActionOperationalResultPayload } from './action-operational-result.js';

/**
 * Domain authorization from organizational memory — NOT user authentication or RBAC.
 *
 * INT-006: an approval recorded in OrgMemory (e.g. decidedBy: SalesDirector) satisfies
 * the governance gate. We do not verify that a human user holds that role.
 */
export interface GovernanceAuthorizationResult {
  readonly allowed: boolean;
  readonly reason: string;
  readonly workspace: string;
  readonly actionType: InternalActionType;
  readonly requiredApprovalRole?: string;
  readonly decisionId?: string;
  readonly policyId?: string;
  readonly evidenceIds?: readonly string[];
  readonly evaluationTrace?: readonly string[];
}

export interface RecordApprovedDiscountActionRequest {
  readonly actionType: 'record_approved_discount_request';
  readonly workspace: string;
  readonly clientLegalName: string;
  readonly requestedPercent: number;
  readonly requestId?: string;
}

export type InternalActionRequest = RecordApprovedDiscountActionRequest;

export interface InternalActionExecutionResult {
  readonly actionType: InternalActionType;
  readonly workspace: string;
  readonly clientLegalName: string;
  readonly requestedPercent: number;
  readonly requestId?: string;
  readonly recordId: string;
}

export interface InternalActionResult {
  readonly executed: boolean;
  readonly authorization: GovernanceAuthorizationResult;
  readonly execution?: InternalActionExecutionResult;
  /** Canonical operational result persisted to Memory (INT-007). */
  readonly result: ActionOperationalResultPayload;
  readonly resultRecordId: string;
  readonly eventId?: Identifier;
}
