import { MemoryTypedId } from './memory-typed-id.js';

export class VersionId extends MemoryTypedId {
  private constructor(value: string) {
    super(value, 'VersionId');
  }

  static create(value: string): VersionId {
    return new VersionId(VersionId.createValue(value, 'VersionId'));
  }
}

export function isVersionId(value: unknown): value is VersionId {
  return value instanceof VersionId;
}
