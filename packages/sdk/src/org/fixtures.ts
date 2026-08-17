import type { Atlas } from '../atlas/atlas.js';
import {
  ORG_RECORD_TYPE_APPROVAL_RULE,
  ORG_RECORD_TYPE_CLIENT,
  ORG_RECORD_TYPE_DISCOUNT_POLICY,
  ORG_RECORD_TYPE_WARRANTY_POLICY,
  ORG_RELATIONSHIP_DEPENDENCY,
  ORG_RELATIONSHIP_REFERENCE,
} from './constants.js';
import { storeEntity, storeEntityVersion } from './entity-store.js';
import { linkEntities } from './relationship-store.js';

export async function seedCase1DiscountGraph(atlas: Atlas): Promise<void> {
  await storeEntity(
    atlas,
    ORG_RECORD_TYPE_CLIENT,
    'record.client.constructora-andes',
    Object.freeze({
      legalName: 'Constructora Andes S.A.',
      segment: 'VIP',
      renewalActive: true,
    }),
  );

  await storeEntity(
    atlas,
    ORG_RECORD_TYPE_DISCOUNT_POLICY,
    'record.policy.discount.autonomous',
    Object.freeze({
      policyCode: 'DISCOUNT-VIP-2026',
      autonomousMaxPercent: 10,
      currency: 'USD',
    }),
  );

  await storeEntity(
    atlas,
    ORG_RECORD_TYPE_APPROVAL_RULE,
    'record.rule.discount-approval',
    Object.freeze({
      appliesWhen: 'discountPercent > autonomousMaxPercent',
      approverRole: 'SalesDirector',
      approverQueue: 'sales-directors',
    }),
  );

  await linkEntities(
    atlas,
    'record.client.constructora-andes',
    'record.policy.discount.autonomous',
    ORG_RELATIONSHIP_REFERENCE,
  );

  await linkEntities(
    atlas,
    'record.policy.discount.autonomous',
    'record.rule.discount-approval',
    ORG_RELATIONSHIP_DEPENDENCY,
  );
}

export async function seedCase2WarrantyPolicy(atlas: Atlas): Promise<void> {
  await storeEntity(
    atlas,
    ORG_RECORD_TYPE_WARRANTY_POLICY,
    'record.policy.warranty.standard',
    Object.freeze({
      policyCode: 'WARRANTY-STD',
      warrantyDays: 60,
      effectiveFrom: '2026-06-01',
    }),
    Object.freeze({ revision: 2 }),
  );

  await storeEntityVersion(
    atlas,
    'record.policy.warranty.standard',
    Object.freeze({
      policyCode: 'WARRANTY-STD',
      warrantyDays: 45,
      effectiveFrom: '2025-01-01',
    }),
    1,
    'legal.ops',
  );
}
