import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import { createKnowledgeError } from '../../errors/create-knowledge-error.js';

export type ObjectVisibility = 'public' | 'internal' | 'restricted';

export interface ObjectMetadataData {
  readonly name: string;
  readonly description?: string;
  readonly labels?: readonly string[];
  readonly tags?: readonly string[];
  readonly aliases?: readonly string[];
  readonly language?: string;
  readonly visibility?: ObjectVisibility;
}

export class ObjectMetadata {
  readonly metaConcept = MetaConceptId.Object;

  readonly name: string;
  readonly description?: string;
  readonly labels: readonly string[];
  readonly tags: readonly string[];
  readonly aliases: readonly string[];
  readonly language: string;
  readonly visibility: ObjectVisibility;

  private constructor(data: Required<Pick<ObjectMetadataData, 'name'>> & ObjectMetadataData) {
    this.name = data.name;
    this.description = data.description;
    this.labels = Object.freeze([...(data.labels ?? [])]);
    this.tags = Object.freeze([...(data.tags ?? [])]);
    this.aliases = Object.freeze([...(data.aliases ?? [])]);
    this.language = data.language ?? 'und';
    this.visibility = data.visibility ?? 'internal';
  }

  static create(data: ObjectMetadataData): ObjectMetadata {
    const name = data.name.trim();

    if (name.length === 0) {
      throw createKnowledgeError(
        'KNOWLEDGE_INVALID_METADATA',
        'ObjectMetadata name must be a non-empty string',
      );
    }

    return new ObjectMetadata({ ...data, name });
  }

  equals(other: ObjectMetadata): boolean {
    return (
      this.name === other.name &&
      this.description === other.description &&
      this.language === other.language &&
      this.visibility === other.visibility
    );
  }
}
