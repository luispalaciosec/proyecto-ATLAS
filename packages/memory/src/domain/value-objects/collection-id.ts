import { MemoryTypedId } from './memory-typed-id.js';

export class CollectionId extends MemoryTypedId {
  private constructor(value: string) {
    super(value, 'CollectionId');
  }

  static create(value: string): CollectionId {
    return new CollectionId(CollectionId.createValue(value, 'CollectionId'));
  }
}

export function isCollectionId(value: unknown): value is CollectionId {
  return value instanceof CollectionId;
}
