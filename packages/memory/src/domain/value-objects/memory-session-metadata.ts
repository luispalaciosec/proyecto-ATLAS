import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';

export interface MemorySessionMetadataData {
  readonly custom?: Readonly<Record<string, unknown>>;
}

export class MemorySessionMetadata {
  readonly custom: Readonly<Record<string, unknown>>;

  private constructor(data: MemorySessionMetadataData) {
    if (data.custom !== undefined && (typeof data.custom !== 'object' || data.custom === null)) {
      throw createMemoryError(MEMORY_INVALID_ID, 'MemorySessionMetadata custom must be an object');
    }

    this.custom = Object.freeze({ ...(data.custom ?? {}) });
  }

  static create(data: MemorySessionMetadataData = {}): MemorySessionMetadata {
    return new MemorySessionMetadata(data);
  }
}
