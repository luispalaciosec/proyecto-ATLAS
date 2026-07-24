import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';

const MEMORY_ID_PATTERN = /^[a-zA-Z][a-zA-Z0-9._:-]{0,255}$/;

export function assertMemoryIdValue(value: string, label: string): string {
  const trimmed = value.trim();

  if (!MEMORY_ID_PATTERN.test(trimmed)) {
    throw createMemoryError(
      MEMORY_INVALID_ID,
      `${label} must start with a letter and contain only alphanumeric characters, dots, colons, underscores, or hyphens`,
    );
  }

  return trimmed;
}

export abstract class MemoryTypedId {
  readonly #value: string;

  protected constructor(value: string, label: string) {
    this.#value = assertMemoryIdValue(value, label);
  }

  protected static createValue(value: string, label: string): string {
    return assertMemoryIdValue(value, label);
  }

  equals(other: MemoryTypedId): boolean {
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
