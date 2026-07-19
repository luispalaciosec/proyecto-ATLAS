import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import { KnowledgeTypedId } from './knowledge-typed-id.js';

export class RelationshipId extends KnowledgeTypedId {
  readonly metaConcept = MetaConceptId.Relationship;

  private constructor(value: string) {
    super(value, 'RelationshipId');
  }

  static create(value: string): RelationshipId {
    return new RelationshipId(RelationshipId.createValue(value, 'RelationshipId'));
  }
}

export function isRelationshipId(value: unknown): value is RelationshipId {
  return value instanceof RelationshipId;
}
