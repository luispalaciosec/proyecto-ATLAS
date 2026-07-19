import { createKnowledgeError } from '../errors/create-knowledge-error.js';
import type { KnowledgeRelationship } from '../domain/entities/knowledge-relationship.js';
import { validateRelationshipId } from './identity-validator.js';

export function validateKnowledgeRelationship(
  relationship: KnowledgeRelationship,
  knownObjectIds?: ReadonlySet<string>,
): void {
  validateRelationshipId(relationship.id);

  if (relationship.source.equals(relationship.target)) {
    throw createKnowledgeError(
      'KNOWLEDGE_INVALID_RELATIONSHIP',
      'KnowledgeRelationship source and target must be distinct objects',
    );
  }

  if (knownObjectIds) {
    const source = relationship.source.toString();
    const target = relationship.target.toString();

    if (!knownObjectIds.has(source)) {
      throw createKnowledgeError(
        'KNOWLEDGE_INVALID_RELATIONSHIP',
        `Relationship source "${source}" does not reference an existing object`,
      );
    }

    if (!knownObjectIds.has(target)) {
      throw createKnowledgeError(
        'KNOWLEDGE_INVALID_RELATIONSHIP',
        `Relationship target "${target}" does not reference an existing object`,
      );
    }
  }
}
