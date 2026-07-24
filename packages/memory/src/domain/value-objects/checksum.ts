import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';

export class Checksum {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): Checksum {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw createMemoryError(MEMORY_INVALID_ID, 'Checksum must be a non-empty string');
    }

    return new Checksum(trimmed);
  }

  equals(other: Checksum): boolean {
    return this.value === other.value;
  }

  toJSON(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
