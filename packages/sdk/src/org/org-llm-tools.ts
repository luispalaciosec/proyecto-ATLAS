import type { ToolExecutor } from '@atlas/llm';

import type { Atlas } from '../atlas/atlas.js';
import {
  ORG_RECORD_TYPE_APPROVAL_RULE,
  ORG_RECORD_TYPE_CLIENT,
  ORG_RECORD_TYPE_DISCOUNT_POLICY,
  ORG_RECORD_TYPE_WARRANTY_POLICY,
  ORG_RELATIONSHIP_DEPENDENCY,
  ORG_RELATIONSHIP_REFERENCE,
} from './constants.js';
import { assertDecision } from './schemas/decision.js';
import { assertEvidence } from './schemas/evidence.js';

export const ATLAS_ORG_TOOL_NAMES = Object.freeze([
  'org_evaluate_discount',
  'org_resolve_policy',
  'org_upsert_entity',
  'org_link_entities',
  'org_record_evidence',
  'org_record_decision',
  'org_resolve_decision',
  'org_execute_record_approved_discount',
] as const);

export type AtlasOrgToolName = (typeof ATLAS_ORG_TOOL_NAMES)[number];

const ORG_UPSERT_RECORD_TYPES = Object.freeze([
  ORG_RECORD_TYPE_CLIENT,
  ORG_RECORD_TYPE_DISCOUNT_POLICY,
  ORG_RECORD_TYPE_WARRANTY_POLICY,
  ORG_RECORD_TYPE_APPROVAL_RULE,
] as const);

const ORG_LINK_RELATIONSHIP_TYPES = Object.freeze([
  ORG_RELATIONSHIP_REFERENCE,
  ORG_RELATIONSHIP_DEPENDENCY,
] as const);

function asString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }

  return value.trim();
}

function asNumber(value: unknown, fieldName: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${fieldName} must be a finite number`);
  }

  return value;
}

function asOptionalBoolean(value: unknown, fieldName: string): boolean {
  if (value === undefined) {
    return false;
  }

  if (typeof value !== 'boolean') {
    throw new Error(`${fieldName} must be a boolean when provided`);
  }

  return value;
}

function asObject(value: unknown, fieldName: string): Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${fieldName} must be an object`);
  }

  return Object.freeze({ ...(value as Record<string, unknown>) });
}

function asOrgUpsertRecordType(value: unknown): (typeof ORG_UPSERT_RECORD_TYPES)[number] {
  const recordType = asString(value, 'recordType');

  if (!(ORG_UPSERT_RECORD_TYPES as readonly string[]).includes(recordType)) {
    throw new Error(`recordType must be one of: ${ORG_UPSERT_RECORD_TYPES.join(', ')}`);
  }

  return recordType as (typeof ORG_UPSERT_RECORD_TYPES)[number];
}

function asOrgLinkRelationshipType(value: unknown): (typeof ORG_LINK_RELATIONSHIP_TYPES)[number] {
  const relationshipType = asString(value, 'relationshipType');

  if (!(ORG_LINK_RELATIONSHIP_TYPES as readonly string[]).includes(relationshipType)) {
    throw new Error(`relationshipType must be one of: ${ORG_LINK_RELATIONSHIP_TYPES.join(', ')}`);
  }

  return relationshipType as (typeof ORG_LINK_RELATIONSHIP_TYPES)[number];
}

function asOptionalString(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return asString(value, fieldName);
}

function asDecisionContent(value: unknown): Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('content must be an object');
  }

  const content = Object.freeze({ ...(value as Record<string, unknown>) });
  assertDecision(content);

  return content;
}

function asEvidenceFields(value: unknown): Readonly<Record<string, unknown>> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('evidence payload must be an object');
  }

  const content = Object.freeze({ ...(value as Record<string, unknown>) });
  assertEvidence(content);

  return content;
}

function asOptionalStringArray(value: unknown, fieldName: string): readonly string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} must be an array of strings when provided`);
  }

  return Object.freeze(value.map((entry, index) => asString(entry, `${fieldName}[${index}]`)));
}

/**
 * Certified org tool executors — LLM must use these instead of internal org stores.
 * Path: LLM tool loop → OrgMemoryModule → memory/domain primitives.
 */
export function createOrgLlmToolExecutors(atlas: Atlas): readonly ToolExecutor[] {
  return Object.freeze([
    Object.freeze({
      definition: Object.freeze({
        name: 'org_evaluate_discount',
        description:
          'Evaluate whether a discount percentage for a client can be applied autonomously or requires approval.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            clientLegalName: Object.freeze({
              type: 'string',
              description: 'Legal name of the client to evaluate.',
            }),
            requestedPercent: Object.freeze({
              type: 'number',
              description: 'Requested discount percentage.',
            }),
          }),
          required: Object.freeze(['clientLegalName', 'requestedPercent']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const clientLegalName = asString(args.clientLegalName, 'clientLegalName');
        const requestedPercent = asNumber(args.requestedPercent, 'requestedPercent');
        const evaluation = await atlas.org.evaluateDiscountRequest(
          clientLegalName,
          requestedPercent,
        );

        return atlas.org.formatDiscountEvaluation(evaluation);
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'org_resolve_policy',
        description:
          'Resolve the current warranty policy by policy code and optionally include audited version history.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            policyCode: Object.freeze({
              type: 'string',
              description: 'Policy code to resolve (for example WARRANTY-STD).',
            }),
            includeHistory: Object.freeze({
              type: 'boolean',
              description: 'When true, include immutable historical policy revisions.',
            }),
          }),
          required: Object.freeze(['policyCode']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const policyCode = asString(args.policyCode, 'policyCode');
        const includeHistory = asOptionalBoolean(args.includeHistory, 'includeHistory');

        if (!includeHistory) {
          const current = await atlas.org.resolveCurrentWarrantyByCode(policyCode);
          return atlas.org.formatCurrentWarrantyPolicy(current);
        }

        return atlas.org.formatWarrantyWithHistory(policyCode);
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'org_upsert_entity',
        description:
          'Create or update an organizational entity (Client, DiscountPolicy, WarrantyPolicy, or ApprovalRule). ' +
          'Use a short stable entityId in lowercase with hyphens, prefixed by the type in lowercase ' +
          '(for example client.constructora-andes, policy.warranty.standard). ' +
          'Reuse the same entityId when the same real-world entity is mentioned again in the conversation.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            recordType: Object.freeze({
              type: 'string',
              enum: ORG_UPSERT_RECORD_TYPES,
              description: 'Organizational record type to create or update.',
            }),
            entityId: Object.freeze({
              type: 'string',
              description:
                'Stable slug for the entity (lowercase, hyphens, type prefix — e.g. client.constructora-andes).',
            }),
            content: Object.freeze({
              type: 'object',
              description: 'Entity payload matching the schema for the chosen recordType.',
            }),
            author: Object.freeze({
              type: 'string',
              description: 'Who reported the change — used for audited policy version history.',
            }),
          }),
          required: Object.freeze(['recordType', 'entityId', 'content']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const recordType = asOrgUpsertRecordType(args.recordType);
        const entityId = asString(args.entityId, 'entityId');
        const content = asObject(args.content, 'content');
        const author = asOptionalString(args.author, 'author');
        const result = await atlas.org.upsertEntity(recordType, entityId, content, author);

        if (result.created) {
          return `Entidad ${entityId} (${recordType}) creada.`;
        }

        if (result.versioned) {
          return `Política ${entityId} actualizada a la revisión ${result.revision}. La versión anterior queda en el historial auditado.`;
        }

        return `Entidad ${entityId} actualizada.`;
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'org_link_entities',
        description:
          'Link two existing organizational entities with a reference or dependency relationship.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            sourceId: Object.freeze({
              type: 'string',
              description: 'entityId of the source entity.',
            }),
            targetId: Object.freeze({
              type: 'string',
              description: 'entityId of the target entity.',
            }),
            relationshipType: Object.freeze({
              type: 'string',
              enum: ORG_LINK_RELATIONSHIP_TYPES,
              description: 'Relationship semantic: reference or dependency.',
            }),
          }),
          required: Object.freeze(['sourceId', 'targetId', 'relationshipType']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const sourceId = asString(args.sourceId, 'sourceId');
        const targetId = asString(args.targetId, 'targetId');
        const relationshipType = asOrgLinkRelationshipType(args.relationshipType);

        await atlas.org.linkEntities(sourceId, targetId, relationshipType);

        return `${sourceId} → ${relationshipType} → ${targetId} registrado.`;
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'org_record_evidence',
        description: 'Record immutable organizational evidence cited in audit decisions.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            entityId: Object.freeze({
              type: 'string',
              description:
                'Stable slug for the evidence (e.g. record.evidence.andes-renewal-2023).',
            }),
            content: Object.freeze({
              type: 'string',
              description: 'Evidence text content that was cited.',
            }),
            sourceType: Object.freeze({
              type: 'string',
              description: 'Evidence source type (for example manual or chat).',
            }),
            recordedBy: Object.freeze({
              type: 'string',
              description: 'Who recorded or cited this evidence.',
            }),
          }),
          required: Object.freeze(['entityId', 'content', 'sourceType', 'recordedBy']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const entityId = asString(args.entityId, 'entityId');
        const evidenceContent = asEvidenceFields(
          Object.freeze({
            content: args.content,
            sourceType: args.sourceType,
            recordedBy: args.recordedBy,
            ...(args.recordedAt !== undefined ? { recordedAt: args.recordedAt } : {}),
            ...(args.sourceLabel !== undefined ? { sourceLabel: args.sourceLabel } : {}),
          }),
        );

        await atlas.org.storeEvidence(entityId, evidenceContent);

        return `Evidencia ${entityId} registrada.`;
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'org_record_decision',
        description:
          'Record an immutable organizational decision and link it to the resolved entity and cited evidence.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            entityId: Object.freeze({
              type: 'string',
              description:
                'Stable slug for the decision (e.g. record.decision.andes-discount-2026-08-15).',
            }),
            content: Object.freeze({
              type: 'object',
              description:
                'Decision payload (subjectType, clientLegalName, requestedPercent, outcome, decidedBy, decidedAt, …).',
            }),
            targetEntityId: Object.freeze({
              type: 'string',
              description: 'entityId of the entity this decision resolves (e.g. Client).',
            }),
            evidenceIds: Object.freeze({
              type: 'array',
              items: Object.freeze({ type: 'string' }),
              description: 'entityIds of Evidence records cited by this decision.',
            }),
          }),
          required: Object.freeze(['entityId', 'content', 'targetEntityId']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const entityId = asString(args.entityId, 'entityId');
        const content = asDecisionContent(args.content);
        const targetEntityId = asString(args.targetEntityId, 'targetEntityId');
        const evidenceIds = asOptionalStringArray(args.evidenceIds, 'evidenceIds') ?? [];

        await atlas.org.recordDecision(entityId, content, targetEntityId, evidenceIds);

        const outcome = typeof content.outcome === 'string' ? content.outcome : 'unknown';
        const decidedBy = typeof content.decidedBy === 'string' ? content.decidedBy : 'unknown';

        return `Decisión ${entityId} registrada: ${outcome} por ${decidedBy}.`;
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'org_resolve_decision',
        description:
          'Resolve the most recent organizational decision for a client and return cited evidence.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            clientLegalName: Object.freeze({
              type: 'string',
              description: 'Legal name of the client whose decision history to resolve.',
            }),
            subjectType: Object.freeze({
              type: 'string',
              description: 'Optional decision subject type filter (e.g. discount_request).',
            }),
          }),
          required: Object.freeze(['clientLegalName']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const clientLegalName = asString(args.clientLegalName, 'clientLegalName');
        const subjectType = asOptionalString(args.subjectType, 'subjectType');
        const resolved = await atlas.org.resolveDecisionWithEvidence(clientLegalName, subjectType);

        if (resolved === undefined) {
          return `No hay ninguna decisión registrada para ${clientLegalName}.`;
        }

        return atlas.org.formatDecisionWithEvidence(resolved);
      },
    }),
    Object.freeze({
      definition: Object.freeze({
        name: 'org_execute_record_approved_discount',
        description:
          'Execute the governed internal action to record an approved discount request. ' +
          'Authorization is resolved by ATLAS from organizational policy and recorded decisions — ' +
          'never from model-supplied approval flags.',
        parameters: Object.freeze({
          type: 'object' as const,
          properties: Object.freeze({
            clientLegalName: Object.freeze({
              type: 'string',
              description: 'Legal name of the client for the discount request.',
            }),
            requestedPercent: Object.freeze({
              type: 'number',
              description: 'Requested discount percentage to record if governance allows.',
            }),
            requestId: Object.freeze({
              type: 'string',
              description: 'Optional stable identifier for the discount request.',
            }),
          }),
          required: Object.freeze(['clientLegalName', 'requestedPercent']),
        }),
      }),
      execute: async (args: Readonly<Record<string, unknown>>) => {
        const clientLegalName = asString(args.clientLegalName, 'clientLegalName');
        const requestedPercent = asNumber(args.requestedPercent, 'requestedPercent');
        const requestId = asOptionalString(args.requestId, 'requestId');

        // LLM-supplied approval hints are ignored — governance gate reads OrgMemory only.
        const result = await atlas.governance.execute({
          actionType: 'record_approved_discount_request',
          clientLegalName,
          requestedPercent,
          ...(requestId !== undefined ? { requestId } : {}),
        });

        if (!result.executed) {
          return `Acción bloqueada por gobernanza: ${result.authorization.reason}`;
        }

        return `Descuento aprobado registrado (${result.execution?.recordId}).`;
      },
    }),
  ]);
}

export function listAtlasOrgToolNames(): readonly AtlasOrgToolName[] {
  return ATLAS_ORG_TOOL_NAMES;
}
