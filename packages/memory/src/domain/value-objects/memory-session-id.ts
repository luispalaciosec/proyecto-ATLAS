import { MemoryTypedId } from './memory-typed-id.js';

export class MemorySessionId extends MemoryTypedId {
  private constructor(value: string) {
    super(value, 'MemorySessionId');
  }

  static create(value: string): MemorySessionId {
    return new MemorySessionId(MemorySessionId.createValue(value, 'MemorySessionId'));
  }
}

export function isMemorySessionId(value: unknown): value is MemorySessionId {
  return value instanceof MemorySessionId;
}
