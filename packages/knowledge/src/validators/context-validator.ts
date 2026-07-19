import { createKnowledgeError } from '../errors/create-knowledge-error.js';
import type { ContextScope } from '../domain/value-objects/context-scope.js';

export function validateContextScope(context: ContextScope): void {
  if (Object.keys(context.dimensions).length === 0) {
    throw createKnowledgeError(
      'KNOWLEDGE_INVALID_CONTEXT',
      'ContextScope requires at least one dimension',
    );
  }
}

export function validateContextScopes(contexts: readonly ContextScope[]): void {
  if (contexts.length === 0) {
    throw createKnowledgeError(
      'KNOWLEDGE_INVALID_CONTEXT',
      'At least one ContextScope is required',
    );
  }

  for (const context of contexts) {
    validateContextScope(context);
  }
}
