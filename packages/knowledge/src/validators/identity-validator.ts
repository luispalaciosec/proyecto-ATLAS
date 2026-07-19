import { createKnowledgeError } from '../errors/create-knowledge-error.js';
import type { KnowledgeObjectId } from '../domain/value-objects/knowledge-object-id.js';
import type { RelationshipId } from '../domain/value-objects/relationship-id.js';
import type { StatementId } from '../domain/value-objects/statement-id.js';
import { assertKnowledgeIdValue } from '../domain/value-objects/knowledge-typed-id.js';

export function validateIdentityValue(value: string, label: string): string {
  return assertKnowledgeIdValue(value, label);
}

export function validateKnowledgeObjectId(id: KnowledgeObjectId): void {
  validateIdentityValue(id.toString(), 'KnowledgeObjectId');
}

export function validateStatementId(id: StatementId): void {
  validateIdentityValue(id.toString(), 'StatementId');
}

export function validateRelationshipId(id: RelationshipId): void {
  validateIdentityValue(id.toString(), 'RelationshipId');
}

export function assertUniqueId(id: string, knownIds: ReadonlySet<string>, label: string): void {
  if (knownIds.has(id)) {
    throw createKnowledgeError('KNOWLEDGE_DUPLICATE_ID', `${label} "${id}" already exists`);
  }
}
