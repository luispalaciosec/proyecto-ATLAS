import { createKnowledgeError } from '../errors/create-knowledge-error.js';
import type { KnowledgeStatement } from '../domain/entities/knowledge-statement.js';
import { validateStatementId } from './identity-validator.js';

export function validateKnowledgeStatement(statement: KnowledgeStatement, objectId: string): void {
  validateStatementId(statement.id);

  if (objectId.trim().length === 0) {
    throw createKnowledgeError(
      'KNOWLEDGE_INVALID_STATEMENT',
      'KnowledgeStatement must belong to a Knowledge Object',
    );
  }

  if (statement.content.assertion.trim().length === 0) {
    throw createKnowledgeError(
      'KNOWLEDGE_INVALID_STATEMENT',
      'KnowledgeStatement assertion must be non-empty',
    );
  }
}
