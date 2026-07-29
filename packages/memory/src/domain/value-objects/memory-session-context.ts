import { createMemoryError, MEMORY_INVALID_ID } from '../errors/create-memory-error.js';

export interface MemorySessionContextData {
  readonly tenant?: string;
  readonly workspace?: string;
  readonly environment?: string;
  readonly executionVariables?: Readonly<Record<string, unknown>>;
  readonly custom?: Readonly<Record<string, unknown>>;
}

export class MemorySessionContext {
  readonly tenant?: string;
  readonly workspace?: string;
  readonly environment?: string;
  readonly executionVariables: Readonly<Record<string, unknown>>;
  readonly custom: Readonly<Record<string, unknown>>;

  private constructor(data: MemorySessionContextData) {
    if (
      data.executionVariables !== undefined &&
      (typeof data.executionVariables !== 'object' || data.executionVariables === null)
    ) {
      throw createMemoryError(
        MEMORY_INVALID_ID,
        'MemorySessionContext executionVariables must be an object',
      );
    }

    if (data.custom !== undefined && (typeof data.custom !== 'object' || data.custom === null)) {
      throw createMemoryError(MEMORY_INVALID_ID, 'MemorySessionContext custom must be an object');
    }

    this.tenant = data.tenant;
    this.workspace = data.workspace;
    this.environment = data.environment;
    this.executionVariables = Object.freeze({ ...(data.executionVariables ?? {}) });
    this.custom = Object.freeze({ ...(data.custom ?? {}) });
  }

  static create(data: MemorySessionContextData = {}): MemorySessionContext {
    return new MemorySessionContext(data);
  }
}
