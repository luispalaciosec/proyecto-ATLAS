import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import { KnowledgeTypedId } from './knowledge-typed-id.js';

export class StatementId extends KnowledgeTypedId {
  readonly metaConcept = MetaConceptId.Statement;

  private constructor(value: string) {
    super(value, 'StatementId');
  }

  static create(value: string): StatementId {
    return new StatementId(StatementId.createValue(value, 'StatementId'));
  }
}

export function isStatementId(value: unknown): value is StatementId {
  return value instanceof StatementId;
}
