import type { Atlas } from '../atlas/atlas.js';
import type { StoreMemoryContentResult } from '../modules/memory-module.js';
import {
  ORG_COLLECTION_ENTITIES,
  ORG_COLLECTION_POLICIES,
  ORG_NAMESPACE_ID,
  ORG_RECORD_TYPE_APPROVAL_RULE,
  ORG_RECORD_TYPE_CLIENT,
  ORG_RECORD_TYPE_DISCOUNT_POLICY,
  ORG_RECORD_TYPE_VERSION,
  ORG_RECORD_TYPE_WARRANTY_POLICY,
} from './constants.js';
import { assertApprovalRule } from './schemas/approval-rule.js';
import { assertClient } from './schemas/client.js';
import { assertDiscountPolicy } from './schemas/discount-policy.js';
import { assertWarrantyPolicy } from './schemas/warranty-policy.js';
import { serializeOrgContent } from './record-content.js';

function resolveCollectionId(recordType: string): string {
  if (
    recordType === ORG_RECORD_TYPE_DISCOUNT_POLICY ||
    recordType === ORG_RECORD_TYPE_WARRANTY_POLICY ||
    recordType === ORG_RECORD_TYPE_APPROVAL_RULE
  ) {
    return ORG_COLLECTION_POLICIES;
  }

  return ORG_COLLECTION_ENTITIES;
}

function assertEntityContent(recordType: string, content: unknown): void {
  switch (recordType) {
    case ORG_RECORD_TYPE_CLIENT:
      assertClient(content);
      return;
    case ORG_RECORD_TYPE_DISCOUNT_POLICY:
      assertDiscountPolicy(content);
      return;
    case ORG_RECORD_TYPE_WARRANTY_POLICY:
      assertWarrantyPolicy(content);
      return;
    case ORG_RECORD_TYPE_APPROVAL_RULE:
      assertApprovalRule(content);
      return;
    default:
      throw new Error(`Unsupported organizational recordType "${recordType}"`);
  }
}

function buildEntitySearchText(recordType: string, entityId: string, content: unknown): string {
  return serializeOrgContent(
    Object.freeze({
      entityId,
      recordType,
      ...(typeof content === 'object' && content !== null ? content : { value: content }),
    }),
  );
}

export async function storeEntity(
  atlas: Atlas,
  recordType: string,
  id: string,
  content: unknown,
  metadata: Readonly<Record<string, unknown>> = {},
): Promise<StoreMemoryContentResult> {
  const trimmedId = id.trim();

  if (trimmedId.length === 0) {
    throw new Error('Entity id must be a non-empty string');
  }

  assertEntityContent(recordType, content);

  const revision =
    typeof metadata.revision === 'number' && Number.isFinite(metadata.revision)
      ? metadata.revision
      : 1;

  return atlas.memory.storeContent({
    content: buildEntitySearchText(recordType, trimmedId, content),
    recordType,
    metadata: Object.freeze({
      namespaceId: ORG_NAMESPACE_ID,
      collectionId: resolveCollectionId(recordType),
      entityId: trimmedId,
      status: 'active',
      revision,
      ...metadata,
    }),
  });
}

export async function storeEntityVersion(
  atlas: Atlas,
  recordId: string,
  previousContent: unknown,
  revision: number,
  author: string,
): Promise<StoreMemoryContentResult> {
  const trimmedRecordId = recordId.trim();
  const trimmedAuthor = author.trim();

  if (trimmedRecordId.length === 0) {
    throw new Error('recordId must be a non-empty string');
  }

  if (!Number.isFinite(revision) || revision < 1) {
    throw new Error('revision must be a positive number');
  }

  if (trimmedAuthor.length === 0) {
    throw new Error('author must be a non-empty string');
  }

  const versionContent = Object.freeze({
    recordId: trimmedRecordId,
    revision,
    content: previousContent,
    author: trimmedAuthor,
  });

  const versionEntityId = `version.${trimmedRecordId}.r${revision}`;

  return atlas.memory.storeContent({
    content: serializeOrgContent(versionContent),
    recordType: ORG_RECORD_TYPE_VERSION,
    metadata: Object.freeze({
      namespaceId: ORG_NAMESPACE_ID,
      collectionId: ORG_COLLECTION_POLICIES,
      entityId: versionEntityId,
      recordId: trimmedRecordId,
      revision,
      status: 'active',
    }),
  });
}
