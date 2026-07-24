import { MemoryTypedId } from './memory-typed-id.js';

export class NamespaceId extends MemoryTypedId {
  private constructor(value: string) {
    super(value, 'NamespaceId');
  }

  static create(value: string): NamespaceId {
    return new NamespaceId(NamespaceId.createValue(value, 'NamespaceId'));
  }
}

export function isNamespaceId(value: unknown): value is NamespaceId {
  return value instanceof NamespaceId;
}
