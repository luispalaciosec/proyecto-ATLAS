import { MemoryTypedId } from './memory-typed-id.js';

export class RecordId extends MemoryTypedId {
  private constructor(value: string) {
    super(value, 'RecordId');
  }

  static create(value: string): RecordId {
    return new RecordId(RecordId.createValue(value, 'RecordId'));
  }
}

export function isRecordId(value: unknown): value is RecordId {
  return value instanceof RecordId;
}
