import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import type { ContextScope } from '../value-objects/context-scope.js';
import type { KnowledgeObjectId } from '../value-objects/knowledge-object-id.js';
import type { RelationshipId } from '../value-objects/relationship-id.js';
import type { RelationshipType } from '../value-objects/relationship-type.js';

export interface KnowledgeRelationship {
  readonly metaConcept: typeof MetaConceptId.Relationship;
  readonly id: RelationshipId;
  readonly type: RelationshipType;
  readonly source: KnowledgeObjectId;
  readonly target: KnowledgeObjectId;
  readonly context?: ContextScope;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export type KnowledgeRelationshipSnapshot = KnowledgeRelationship;
