import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';

export class RecordType {
  readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(value: string): RecordType {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      throw createMemoryError(MEMORY_INVALID_ID, 'RecordType must be a non-empty string');
    }

    return new RecordType(trimmed);
  }

  equals(other: RecordType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
