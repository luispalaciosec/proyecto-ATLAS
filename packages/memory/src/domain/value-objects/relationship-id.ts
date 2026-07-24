import { MemoryTypedId } from './memory-typed-id.js';

export class RelationshipId extends MemoryTypedId {
  private constructor(value: string) {
    super(value, 'RelationshipId');
  }

  static create(value: string): RelationshipId {
    return new RelationshipId(RelationshipId.createValue(value, 'RelationshipId'));
  }
}

export function isRelationshipId(value: unknown): value is RelationshipId {
  return value instanceof RelationshipId;
}
