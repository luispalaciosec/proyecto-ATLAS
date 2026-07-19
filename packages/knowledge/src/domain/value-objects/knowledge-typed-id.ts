import { createKnowledgeError } from '../../errors/create-knowledge-error.js';

const KNOWLEDGE_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9._:-]{0,255}$/;

export function assertKnowledgeIdValue(value: string, label: string): string {
  const trimmed = value.trim();

  if (!KNOWLEDGE_ID_PATTERN.test(trimmed)) {
    throw createKnowledgeError(
      'KNOWLEDGE_INVALID_ID',
      `${label} must start with a letter and contain only alphanumeric characters, dots, colons, underscores, or hyphens`,
    );
  }

  return trimmed;
}

export abstract class KnowledgeTypedId {
  readonly #value: string;

  protected constructor(value: string, label: string) {
    this.#value = assertKnowledgeIdValue(value, label);
  }

  protected static createValue(value: string, label: string): string {
    return assertKnowledgeIdValue(value, label);
  }

  equals(other: KnowledgeTypedId): boolean {
    return this.#value === other.valueOf();
  }

  toJSON(): string {
    return this.#value;
  }

  toString(): string {
    return this.#value;
  }

  valueOf(): string {
    return this.#value;
  }
}
