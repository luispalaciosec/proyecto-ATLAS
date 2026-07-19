import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import { createKnowledgeError } from '../../errors/create-knowledge-error.js';

export const ContextDimension = {
  Organizational: 'organizational',
  Temporal: 'temporal',
  Operational: 'operational',
  Geographical: 'geographical',
  Technical: 'technical',
  Regulatory: 'regulatory',
} as const;

export type ContextDimension = (typeof ContextDimension)[keyof typeof ContextDimension];

export type ContextDimensions = Readonly<Partial<Record<ContextDimension, string>>>;

export class ContextScope {
  readonly metaConcept = MetaConceptId.Context;

  readonly dimensions: ContextDimensions;

  private constructor(dimensions: ContextDimensions) {
    this.dimensions = Object.freeze({ ...dimensions });
  }

  static create(dimensions: ContextDimensions): ContextScope {
    const keys = Object.keys(dimensions);

    if (keys.length === 0) {
      throw createKnowledgeError(
        'KNOWLEDGE_INVALID_CONTEXT',
        'ContextScope requires at least one dimension',
      );
    }

    for (const key of keys) {
      const value = dimensions[key as ContextDimension];
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw createKnowledgeError(
          'KNOWLEDGE_INVALID_CONTEXT',
          `Context dimension "${key}" must be a non-empty string`,
        );
      }
    }

    return new ContextScope(dimensions);
  }

  equals(other: ContextScope): boolean {
    const left = this.dimensions;
    const right = other.dimensions;
    const leftKeys = Object.keys(left);
    const rightKeys = Object.keys(right);

    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every((key) => left[key as ContextDimension] === right[key as ContextDimension]);
  }
}
