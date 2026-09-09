import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import {
  DEFAULT_EXTENSION_POLICY,
  assertExtensionKindAllowed,
} from '../../metamodel/extension-model.js';
import { createKnowledgeError } from '../../errors/create-knowledge-error.js';

export class ObjectKind {
  readonly metaConcept = MetaConceptId.Object;

  readonly name: string;

  private constructor(name: string) {
    this.name = name;
  }

  static create(name: string): ObjectKind {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      throw createKnowledgeError(
        'KNOWLEDGE_INVALID_OBJECT_KIND',
        'ObjectKind name must be a non-empty string',
      );
    }

    if (!assertExtensionKindAllowed(DEFAULT_EXTENSION_POLICY, trimmed, MetaConceptId.Object)) {
      throw createKnowledgeError(
        'KNOWLEDGE_INVALID_OBJECT_KIND',
        `ObjectKind "${trimmed}" is not allowed by extension policy`,
      );
    }

    return new ObjectKind(trimmed);
  }

  equals(other: ObjectKind): boolean {
    return this.name === other.name;
  }
}
