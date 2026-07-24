import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';

export class NamespaceType {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): NamespaceType {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw createMemoryError(MEMORY_INVALID_ID, 'NamespaceType must be a non-empty string');
    }

    return new NamespaceType(trimmed);
  }

  equals(other: NamespaceType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
