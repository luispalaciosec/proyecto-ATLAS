import { createCoreError } from '../errors/create-error.js';

const SEMVER_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/**
 * Semantic version value object.
 * @see ATLAS-009 Glossary §Version
 * @see ATLAS-ARCH-002 §13
 * @see ATLAS-DOM-000 §11 Value Objects
 */
export class Version {
  readonly #value: string;
  readonly #major: number;
  readonly #minor: number;
  readonly #patch: number;

  private constructor(value: string, major: number, minor: number, patch: number) {
    this.#value = value;
    this.#major = major;
    this.#minor = minor;
    this.#patch = patch;
  }

  static create(value: string): Version {
    const trimmed = value.trim();

    if (!SEMVER_PATTERN.test(trimmed)) {
      throw createCoreError(
        'CORE_INVALID_VERSION',
        'Version must follow MAJOR.MINOR.PATCH semantic versioning',
      );
    }

    const [major, minor, patch] = trimmed.split('.').map((part) => Number(part));

    return new Version(trimmed, major!, minor!, patch!);
  }

  get major(): number {
    return this.#major;
  }

  get minor(): number {
    return this.#minor;
  }

  get patch(): number {
    return this.#patch;
  }

  equals(other: Version): boolean {
    return this.#value === other.#value;
  }

  toJSON(): string {
    return this.#value;
  }

  toString(): string {
    return this.#value;
  }
}

export function isVersion(value: unknown): value is Version {
  return value instanceof Version;
}
