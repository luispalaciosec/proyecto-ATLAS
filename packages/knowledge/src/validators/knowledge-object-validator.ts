import type { KnowledgeObject } from '../domain/aggregates/knowledge-object.js';
import { validateContextScopes } from './context-validator.js';
import { validateKnowledgeObjectId } from './identity-validator.js';
import { validateKnowledgeStatement } from './statement-validator.js';

export function validateKnowledgeObjectDraft(object: KnowledgeObject): void {
  validateKnowledgeObjectId(object.id);
  validateContextScopes(object.contexts);

  for (const statement of object.statements) {
    validateKnowledgeStatement(statement, object.id.toString());
  }
}
