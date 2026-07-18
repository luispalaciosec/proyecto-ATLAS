import { deepFreeze } from '../internal/deep-freeze.js';
import { createCoreError } from '../errors/create-error.js';

/**
 * Entity metadata bag.
 * @see ATLAS-DOM-000 §11 Value Objects
 */
export class Metadata {
  readonly #data: Readonly<Record<string, unknown>>;

  private constructor(data: Readonly<Record<string, unknown>>) {
    this.#data = deepFreeze({ ...data });
  }

  static create(data: Record<string, unknown>): Metadata {
    if (data === null || typeof data !== 'object' || Array.isArray(data)) {
      throw createCoreError('CORE_INVALID_METADATA', 'Metadata must be a plain object');
    }

    return new Metadata(data);
  }

  static empty(): Metadata {
    return new Metadata({});
  }

  get(key: string): unknown {
    return this.#data[key];
  }

  entries(): ReadonlyArray<readonly [string, unknown]> {
    return Object.entries(this.#data);
  }

  equals(other: Metadata): boolean {
    // TODO(tech-debt): Replace JSON.stringify structural comparison with a
    // deterministic deep-equality helper that handles key order independently
    // and supports nested Value Objects without serialization side effects.
    return JSON.stringify(this.#data) === JSON.stringify(other.#data);
  }

  toJSON(): Readonly<Record<string, unknown>> {
    return { ...this.#data };
  }
}

export function isMetadata(value: unknown): value is Metadata {
  return value instanceof Metadata;
}
