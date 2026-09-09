import { createEventSource, type EventBus } from '@atlas/events';

import type { Atlas } from '../atlas/atlas.js';
import type { AtlasWorkspaceOptions } from '../atlas/options.js';
import {
  buildBlockedOperationalResult,
  buildExecutedOperationalResult,
  persistActionOperationalResult,
} from '../governance/action-operational-result.js';
import { authorizeInternalAction } from '../governance/governance-gate.js';
import {
  GovernanceActionBlockedEvent,
  GovernanceActionExecutedEvent,
} from '../governance/governance-events.js';
import { executeInternalAction } from '../governance/internal-action-executor.js';
import type {
  GovernanceAuthorizationResult,
  InternalActionRequest,
  InternalActionResult,
} from '../governance/governance-types.js';

const GOVERNANCE_EVENT_SOURCE = createEventSource('@atlas/governance');

/**
 * Governance boundary between model intent and ATLAS execution.
 *
 * Domain authorization (OrgMemory decisions, policies, evidence) ≠ user authentication/RBAC.
 *
 * INT-007 closure order:
 * ALLOW/BLOCK → action (if allowed) → result persisted → event published.
 */
export class GovernanceModule {
  readonly #atlas: Atlas;
  readonly #bus: EventBus;
  readonly #workspaceName: string;

  constructor(atlas: Atlas, bus: EventBus, workspace: AtlasWorkspaceOptions = {}) {
    this.#atlas = atlas;
    this.#bus = bus;
    this.#workspaceName =
      typeof workspace.name === 'string' && workspace.name.trim().length > 0
        ? workspace.name.trim()
        : 'default';
  }

  get workspace(): string {
    return this.#workspaceName;
  }

  authorize(
    request: Omit<InternalActionRequest, 'workspace'>,
  ): Promise<GovernanceAuthorizationResult> {
    return authorizeInternalAction(this.#atlas, {
      ...request,
      workspace: this.#workspaceName,
    });
  }

  async execute(request: Omit<InternalActionRequest, 'workspace'>): Promise<InternalActionResult> {
    const fullRequest: InternalActionRequest = {
      ...request,
      workspace: this.#workspaceName,
    };

    const authorization = await authorizeInternalAction(this.#atlas, fullRequest);

    if (!authorization.allowed) {
      const attemptedAt = new Date().toISOString();
      const blockedPayload = buildBlockedOperationalResult(fullRequest, authorization, attemptedAt);
      const persisted = await persistActionOperationalResult(this.#atlas, blockedPayload);

      const event = GovernanceActionBlockedEvent.create(
        Object.freeze({
          actionType: fullRequest.actionType,
          workspace: fullRequest.workspace,
          clientLegalName: fullRequest.clientLegalName,
          requestedPercent: fullRequest.requestedPercent,
          reason: authorization.reason,
          resultRecordId: persisted.recordId,
          ...(authorization.requiredApprovalRole !== undefined
            ? { requiredApprovalRole: authorization.requiredApprovalRole }
            : {}),
          ...(authorization.policyId !== undefined ? { policyId: authorization.policyId } : {}),
          ...(authorization.decisionId !== undefined
            ? { decisionId: authorization.decisionId }
            : {}),
        }),
        { source: GOVERNANCE_EVENT_SOURCE },
      );

      this.#bus.publish(event);

      const result = buildBlockedOperationalResult(
        fullRequest,
        authorization,
        attemptedAt,
        event.id,
      );

      return Object.freeze({
        executed: false,
        authorization,
        result,
        resultRecordId: persisted.recordId,
        eventId: event.id,
      });
    }

    const execution = await executeInternalAction(this.#atlas, fullRequest, authorization);
    const executedAt = new Date().toISOString();

    const operationalPayload = buildExecutedOperationalResult(
      fullRequest,
      authorization,
      execution.recordId,
      executedAt,
    );
    const persisted = await persistActionOperationalResult(this.#atlas, operationalPayload);

    const event = GovernanceActionExecutedEvent.create(
      Object.freeze({
        actionType: fullRequest.actionType,
        workspace: fullRequest.workspace,
        clientLegalName: fullRequest.clientLegalName,
        requestedPercent: fullRequest.requestedPercent,
        resultRecordId: persisted.recordId,
        recordId: execution.recordId,
        ...(authorization.decisionId !== undefined ? { decisionId: authorization.decisionId } : {}),
        ...(authorization.policyId !== undefined ? { policyId: authorization.policyId } : {}),
        ...(authorization.evidenceIds !== undefined && authorization.evidenceIds.length > 0
          ? { evidenceIds: authorization.evidenceIds }
          : {}),
      }),
      { source: GOVERNANCE_EVENT_SOURCE },
    );

    this.#bus.publish(event);

    const result = buildExecutedOperationalResult(
      fullRequest,
      authorization,
      execution.recordId,
      executedAt,
      event.id,
    );

    return Object.freeze({
      executed: true,
      authorization,
      execution,
      result,
      resultRecordId: persisted.recordId,
      eventId: event.id,
    });
  }
}
