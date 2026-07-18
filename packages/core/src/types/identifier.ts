import { createCoreError } from '../errors/create-error.js';

const IDENTIFIER_PATTERN = /^[a-zA-Z][a-zA-Z0-9._:-]{0,255}$/;

/**
 * Stable entity identifier.
 * @see ATLAS-DOM-000 §11 Value Objects
 */
export class Identifier {
  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  static create(value: string): Identifier {
    const trimmed = value.trim();

    if (!IDENTIFIER_PATTERN.test(trimmed)) {
      throw createCoreError(
        'CORE_INVALID_IDENTIFIER',
        'Identifier must start with a letter and contain only alphanumeric characters, dots, colons, underscores, or hyphens',
      );
    }

    return new Identifier(trimmed);
  }

  equals(other: Identifier): boolean {
    return this.#value === other.#value;
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

export function isIdentifier(value: unknown): value is Identifier {
  return value instanceof Identifier;
}
