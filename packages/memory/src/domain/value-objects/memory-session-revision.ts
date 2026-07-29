import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';

export class MemorySessionRevision {
  readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(value: number): MemorySessionRevision {
    if (!Number.isInteger(value) || value < 1) {
      throw createMemoryError(
        MEMORY_INVALID_ID,
        'MemorySessionRevision must be a positive integer starting at 1',
      );
    }

    return new MemorySessionRevision(value);
  }

  next(): MemorySessionRevision {
    return MemorySessionRevision.create(this.value + 1);
  }

  equals(other: MemorySessionRevision): boolean {
    return this.value === other.value;
  }

  toJSON(): number {
    return this.value;
  }
}
