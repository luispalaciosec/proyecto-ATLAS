import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import { createKnowledgeError } from '../../errors/create-knowledge-error.js';

export interface StatementContentData {
  readonly assertion: string;
  readonly predicate?: string;
  readonly object?: string;
}

export class StatementContent {
  readonly metaConcept = MetaConceptId.Statement;

  readonly assertion: string;
  readonly predicate?: string;
  readonly object?: string;

  private constructor(data: StatementContentData) {
    this.assertion = data.assertion;
    this.predicate = data.predicate;
    this.object = data.object;
  }

  static create(data: StatementContentData): StatementContent {
    const assertion = data.assertion.trim();

    if (assertion.length === 0) {
      throw createKnowledgeError(
        'KNOWLEDGE_INVALID_STATEMENT',
        'Statement assertion must be a non-empty string',
      );
    }

    return new StatementContent(
      Object.freeze({
        assertion,
        predicate: data.predicate?.trim() || undefined,
        object: data.object?.trim() || undefined,
      }),
    );
  }

  equals(other: StatementContent): boolean {
    return (
      this.assertion === other.assertion &&
      this.predicate === other.predicate &&
      this.object === other.object
    );
  }

  toJSON(): StatementContentData {
    return Object.freeze({
      assertion: this.assertion,
      predicate: this.predicate,
      object: this.object,
    });
  }
}
