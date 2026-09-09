import { createEventType, defineEvent } from '@atlas/events';

import type { InternalActionType } from './constants.js';

export interface GovernanceActionBlockedPayload {
  readonly actionType: InternalActionType;
  readonly workspace: string;
  readonly clientLegalName: string;
  readonly requestedPercent: number;
  readonly reason: string;
  readonly resultRecordId: string;
  readonly requiredApprovalRole?: string;
  readonly policyId?: string;
  readonly decisionId?: string;
}

export interface GovernanceActionExecutedPayload {
  readonly actionType: InternalActionType;
  readonly workspace: string;
  readonly clientLegalName: string;
  readonly requestedPercent: number;
  readonly resultRecordId: string;
  readonly recordId: string;
  readonly decisionId?: string;
  readonly policyId?: string;
  readonly evidenceIds?: readonly string[];
}

export const GOVERNANCE_ACTION_BLOCKED_EVENT_TYPE = createEventType('governance.action.blocked');
export const GOVERNANCE_ACTION_EXECUTED_EVENT_TYPE = createEventType('governance.action.executed');

export const GovernanceActionBlockedEvent = defineEvent<GovernanceActionBlockedPayload>({
  type: GOVERNANCE_ACTION_BLOCKED_EVENT_TYPE,
  version: '1.0.0',
});

export const GovernanceActionExecutedEvent = defineEvent<GovernanceActionExecutedPayload>({
  type: GOVERNANCE_ACTION_EXECUTED_EVENT_TYPE,
  version: '1.0.0',
});
