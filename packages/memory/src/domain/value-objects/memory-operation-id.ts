import { MemoryTypedId } from './memory-typed-id.js';

export class MemoryOperationId extends MemoryTypedId {
  private constructor(value: string) {
    super(value, 'MemoryOperationId');
  }

  static create(value: string): MemoryOperationId {
    return new MemoryOperationId(MemoryOperationId.createValue(value, 'MemoryOperationId'));
  }
}

export function isMemoryOperationId(value: unknown): value is MemoryOperationId {
  return value instanceof MemoryOperationId;
}
