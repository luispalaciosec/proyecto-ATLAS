import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import { KnowledgeTypedId } from './knowledge-typed-id.js';

export class KnowledgeObjectId extends KnowledgeTypedId {
  readonly metaConcept = MetaConceptId.Object;

  private constructor(value: string) {
    super(value, 'KnowledgeObjectId');
  }

  static create(value: string): KnowledgeObjectId {
    return new KnowledgeObjectId(KnowledgeObjectId.createValue(value, 'KnowledgeObjectId'));
  }
}

export function isKnowledgeObjectId(value: unknown): value is KnowledgeObjectId {
  return value instanceof KnowledgeObjectId;
}
