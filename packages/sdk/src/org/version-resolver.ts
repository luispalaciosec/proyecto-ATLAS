import type { MemoryRecord } from '@atlas/memory';

import type { Atlas } from '../atlas/atlas.js';
import { ORG_POLICY_RECORD_TYPES } from './constants.js';
import {
  getEntityId,
  isOrgVersionContent,
  parseOrgContent,
  readMetadataNumber,
} from './record-content.js';
import { getEntityHistory, listRecordsByType, readEntityPayload } from './entity-resolver.js';
import { parseDiscountPolicy, type DiscountPolicy } from './schemas/discount-policy.js';
import { parseWarrantyPolicy, type WarrantyPolicy } from './schemas/warranty-policy.js';

export interface ResolvedPolicy<TContent> {
  readonly record: MemoryRecord;
  readonly entityId: string;
  readonly revision: number;
  readonly content: TContent;
}

function readRevision(record: MemoryRecord): number {
  return readMetadataNumber(record, 'revision') ?? 1;
}

function pickCurrentPolicyRecord(
  records: readonly MemoryRecord[],
  policyCode: string,
): MemoryRecord | undefined {
  const matches = records.filter((record) => {
    try {
      const payload = readEntityPayload(record);

      return typeof payload.policyCode === 'string' && payload.policyCode === policyCode;
    } catch {
      return false;
    }
  });

  if (matches.length === 0) {
    return undefined;
  }

  return [...matches].sort((left, right) => readRevision(right) - readRevision(left))[0];
}

export async function resolveCurrentPolicy(
  atlas: Atlas,
  recordType: string,
  policyCode: string,
): Promise<ResolvedPolicy<DiscountPolicy | WarrantyPolicy>> {
  const trimmedPolicyCode = policyCode.trim();

  if (trimmedPolicyCode.length === 0) {
    throw new Error('policyCode must be a non-empty string');
  }

  if (!(ORG_POLICY_RECORD_TYPES as readonly string[]).includes(recordType)) {
    throw new Error(`Unsupported policy recordType "${recordType}"`);
  }

  const records = await listRecordsByType(atlas, recordType);
  const currentRecord = pickCurrentPolicyRecord(records, trimmedPolicyCode);

  if (currentRecord === undefined) {
    throw new Error(`Policy "${trimmedPolicyCode}" was not found for recordType "${recordType}"`);
  }

  const payload = readEntityPayload(currentRecord);
  const content =
    recordType === 'WarrantyPolicy' ? parseWarrantyPolicy(payload) : parseDiscountPolicy(payload);

  return Object.freeze({
    record: currentRecord,
    entityId: getEntityId(currentRecord),
    revision: readRevision(currentRecord),
    content,
  });
}

export async function resolvePolicyHistory(
  atlas: Atlas,
  recordId: string,
): Promise<
  readonly { readonly revision: number; readonly content: unknown; readonly author: string }[]
> {
  const historyRecords = await getEntityHistory(atlas, recordId);

  return Object.freeze(
    historyRecords.map((record) => {
      const versionContent = parseOrgContent(record);

      if (!isOrgVersionContent(versionContent)) {
        throw new Error(`Version record "${record.id}" has invalid content`);
      }

      return Object.freeze({
        revision: versionContent.revision,
        content: versionContent.content,
        author: versionContent.author,
      });
    }),
  );
}

export async function resolveCurrentWarrantyByCode(
  atlas: Atlas,
  policyCode: string,
): Promise<ResolvedPolicy<WarrantyPolicy>> {
  const resolved = await resolveCurrentPolicy(atlas, 'WarrantyPolicy', policyCode);

  return Object.freeze({
    ...resolved,
    content: parseWarrantyPolicy(resolved.content),
  });
}
