import type { Identifier } from '@atlas/core';

import { MetaConceptId } from '../metamodel/meta-concept-id.js';
import type { KnowledgeObject } from '../domain/aggregates/knowledge-object.js';
import type { KnowledgeRelationship } from '../domain/entities/knowledge-relationship.js';
import type { KnowledgeStatement } from '../domain/entities/knowledge-statement.js';
import { ObjectBehavior } from '../domain/value-objects/object-behavior.js';
import { ContextScope } from '../domain/value-objects/context-scope.js';
import { GovernanceRecord } from '../domain/value-objects/governance-record.js';
import { KnowledgeObjectId } from '../domain/value-objects/knowledge-object-id.js';
import { KnowledgeVersion } from '../domain/value-objects/knowledge-version.js';
import { LifecycleState } from '../domain/value-objects/lifecycle-state.js';
import { ObjectKind } from '../domain/value-objects/object-kind.js';
import { ObjectMetadata } from '../domain/value-objects/object-metadata.js';
import { RelationshipId } from '../domain/value-objects/relationship-id.js';
import { RelationshipType } from '../domain/value-objects/relationship-type.js';
import { StatementContent } from '../domain/value-objects/statement-content.js';
import { StatementId } from '../domain/value-objects/statement-id.js';
import { TrustScore } from '../domain/value-objects/trust-score.js';
import { validateKnowledgeObjectDraft } from '../validators/knowledge-object-validator.js';
import { validateKnowledgeRelationship } from '../validators/relationship-validator.js';
import { validateKnowledgeStatement } from '../validators/statement-validator.js';

export interface CreateKnowledgeStatementParams {
  readonly id: string;
  readonly objectId: string;
  readonly content: StatementContent;
  readonly context: ContextScope;
  readonly version?: KnowledgeVersion;
  readonly authoredBy: Identifier;
  readonly publishedAt?: string;
  readonly supersedes?: StatementId;
}

export function createKnowledgeStatement(params: CreateKnowledgeStatementParams): KnowledgeStatement {
  const statement: KnowledgeStatement = Object.freeze({
    metaConcept: MetaConceptId.Statement,
    id: StatementId.create(params.id),
    content: params.content,
    context: params.context,
    version: params.version ?? KnowledgeVersion.initial(),
    authoredBy: params.authoredBy,
    publishedAt: params.publishedAt ?? new Date().toISOString(),
    supersedes: params.supersedes,
  });

  validateKnowledgeStatement(statement, params.objectId);
  return statement;
}

export interface CreateKnowledgeRelationshipParams {
  readonly id: string;
  readonly type: RelationshipType;
  readonly source: KnowledgeObjectId;
  readonly target: KnowledgeObjectId;
  readonly context?: ContextScope;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly knownObjectIds?: ReadonlySet<string>;
}

export function createKnowledgeRelationship(
  params: CreateKnowledgeRelationshipParams,
): KnowledgeRelationship {
  const relationship: KnowledgeRelationship = Object.freeze({
    metaConcept: MetaConceptId.Relationship,
    id: RelationshipId.create(params.id),
    type: params.type,
    source: params.source,
    target: params.target,
    context: params.context,
    metadata: params.metadata ? Object.freeze({ ...params.metadata }) : undefined,
  });

  validateKnowledgeRelationship(relationship, params.knownObjectIds);
  return relationship;
}

export interface CreateKnowledgeObjectParams {
  readonly id: string;
  readonly kind: ObjectKind;
  readonly metadata: ObjectMetadata;
  readonly owner: Identifier;
  readonly contexts: readonly ContextScope[];
  readonly statements?: readonly KnowledgeStatement[];
  readonly behavior?: ObjectBehavior;
  readonly trust?: TrustScore;
  readonly version?: KnowledgeVersion;
}

export function createKnowledgeObject(params: CreateKnowledgeObjectParams): KnowledgeObject {
  const object: KnowledgeObject = Object.freeze({
    metaConcept: MetaConceptId.Object,
    id: KnowledgeObjectId.create(params.id),
    kind: params.kind,
    metadata: params.metadata,
    statements: Object.freeze([...(params.statements ?? [])]),
    behavior: params.behavior ?? ObjectBehavior.create(),
    relationshipRefs: Object.freeze([]),
    contexts: Object.freeze([...params.contexts]),
    governance: GovernanceRecord.create({
      owner: params.owner,
      lifecycleState: LifecycleState.Draft,
    }),
    trust: params.trust ?? TrustScore.initial(),
    currentVersion: params.version ?? KnowledgeVersion.initial(),
  });

  validateKnowledgeObjectDraft(object);
  return object;
}
