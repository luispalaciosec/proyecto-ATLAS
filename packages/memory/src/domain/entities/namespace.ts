import type { MemoryMetadata } from '../value-objects/memory-metadata.js';
import type { NamespaceId } from '../value-objects/namespace-id.js';
import type { NamespaceType } from '../value-objects/namespace-type.js';

export interface Namespace {
  readonly namespaceId: NamespaceId;
  readonly namespaceType: NamespaceType;
  readonly owner: string;
  readonly metadata: MemoryMetadata;
  readonly createdAt: string;
}

export type NamespaceSnapshot = Namespace;
