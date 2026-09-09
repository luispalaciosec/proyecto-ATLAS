import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import {
  DEFAULT_EXTENSION_POLICY,
  assertExtensionKindAllowed,
} from '../../metamodel/extension-model.js';
import { createKnowledgeError } from '../../errors/create-knowledge-error.js';

export class RelationshipType {
  readonly metaConcept = MetaConceptId.Relationship;

  readonly name: string;

  private constructor(name: string) {
    this.name = name;
  }

  static create(name: string): RelationshipType {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      throw createKnowledgeError(
        'KNOWLEDGE_INVALID_RELATIONSHIP_TYPE',
        'RelationshipType name must be a non-empty string',
      );
    }

    if (
      !assertExtensionKindAllowed(DEFAULT_EXTENSION_POLICY, trimmed, MetaConceptId.Relationship)
    ) {
      throw createKnowledgeError(
        'KNOWLEDGE_INVALID_RELATIONSHIP_TYPE',
        `RelationshipType "${trimmed}" is not allowed by extension policy`,
      );
    }

    return new RelationshipType(trimmed);
  }

  equals(other: RelationshipType): boolean {
    return this.name === other.name;
  }
}
