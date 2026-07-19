import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import type { KnowledgeStatement } from '../entities/knowledge-statement.js';
import type { ObjectBehavior } from '../value-objects/object-behavior.js';
import type { ContextScope } from '../value-objects/context-scope.js';
import type { GovernanceRecord } from '../value-objects/governance-record.js';
import type { KnowledgeObjectId } from '../value-objects/knowledge-object-id.js';
import type { KnowledgeVersion } from '../value-objects/knowledge-version.js';
import type { ObjectKind } from '../value-objects/object-kind.js';
import type { ObjectMetadata } from '../value-objects/object-metadata.js';
import type { RelationshipId } from '../value-objects/relationship-id.js';
import type { TrustScore } from '../value-objects/trust-score.js';

export interface RelationshipRef {
  readonly relationshipId: RelationshipId;
  readonly targetId: KnowledgeObjectId;
}

export interface KnowledgeObject {
  readonly metaConcept: typeof MetaConceptId.Object;
  readonly id: KnowledgeObjectId;
  readonly kind: ObjectKind;
  readonly metadata: ObjectMetadata;
  readonly statements: readonly KnowledgeStatement[];
  readonly behavior: ObjectBehavior;
  readonly relationshipRefs: readonly RelationshipRef[];
  readonly contexts: readonly ContextScope[];
  readonly governance: GovernanceRecord;
  readonly trust: TrustScore;
  readonly currentVersion: KnowledgeVersion;
}

export type KnowledgeObjectSnapshot = KnowledgeObject;
