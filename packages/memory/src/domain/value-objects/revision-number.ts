import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';

export class RevisionNumber {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): RevisionNumber {
    if (!Number.isInteger(value) || value < 1) {
      throw createMemoryError(
        MEMORY_INVALID_ID,
        'RevisionNumber must be a positive integer starting at 1',
      );
    }

    return new RevisionNumber(value);
  }

  next(): RevisionNumber {
    return RevisionNumber.create(this.value + 1);
  }

  equals(other: RevisionNumber): boolean {
    return this.value === other.value;
  }

  toJSON(): number {
    return this.value;
  }
}
