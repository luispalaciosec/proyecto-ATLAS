import type { CollectionId } from '../value-objects/collection-id.js';
import type { CollectionType } from '../value-objects/collection-type.js';
import type { MemoryMetadata } from '../value-objects/memory-metadata.js';
import type { NamespaceId } from '../value-objects/namespace-id.js';

export interface Collection {
  readonly collectionId: CollectionId;
  readonly namespaceId: NamespaceId;
  readonly collectionType: CollectionType;
  readonly metadata: MemoryMetadata;
  readonly createdAt: string;
}

export type CollectionSnapshot = Collection;
