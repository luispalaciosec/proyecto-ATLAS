import { createCoreError } from '../errors/create-error.js';

const NAMESPACE_PATTERN = /^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/;

/**
 * Logical namespace for entity organization.
 * @see ATLAS-DOM-000 §11 Value Objects
 * @see ATLAS-DOM-002 §16 Namespace
 */
export class Namespace {
  readonly #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  static create(value: string): Namespace {
    const trimmed = value.trim().toLowerCase();

    if (!NAMESPACE_PATTERN.test(trimmed)) {
      throw createCoreError(
        'CORE_INVALID_NAMESPACE',
        'Namespace must use lowercase segments separated by dots or hyphens',
      );
    }

    return new Namespace(trimmed);
  }

  equals(other: Namespace): boolean {
    return this.#value === other.#value;
  }

  toJSON(): string {
    return this.#value;
  }

  toString(): string {
    return this.#value;
  }
}

export function isNamespace(value: unknown): value is Namespace {
  return value instanceof Namespace;
}
