import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';
import { ORG_RECORD_TYPE_CLIENT, ORG_RECORD_TYPE_WARRANTY_POLICY } from '../src/org/constants.js';
import { upsertEntity } from '../src/org/entity-store.js';
import { readEntityPayload, resolveEntityById } from '../src/org/entity-resolver.js';
import { parseClient } from '../src/org/schemas/client.js';
import { parseWarrantyPolicy } from '../src/org/schemas/warranty-policy.js';
import { resolveCurrentPolicy, resolvePolicyHistory } from '../src/org/version-resolver.js';

function createTestAtlas() {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-org-store-'));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
    }),
  });
}

describe('upsertEntity', () => {
  it('updates a Client in place without leaving duplicate resolved results', async () => {
    const { atlas, dir } = createTestAtlas();
    const entityId = 'record.client.upsert-simple';

    await upsertEntity(
      atlas,
      ORG_RECORD_TYPE_CLIENT,
      entityId,
      Object.freeze({
        legalName: 'Cliente Prueba S.A.',
        segment: 'VIP',
        renewalActive: true,
      }),
    );

    await upsertEntity(
      atlas,
      ORG_RECORD_TYPE_CLIENT,
      entityId,
      Object.freeze({
        legalName: 'Cliente Prueba S.A.',
        segment: 'VIP',
        renewalActive: false,
      }),
    );

    const resolved = await resolveEntityById(atlas, entityId, ORG_RECORD_TYPE_CLIENT);

    expect(resolved).toBeDefined();
    expect(parseClient(readEntityPayload(resolved!)).renewalActive).toBe(false);

    rmSync(dir, { recursive: true, force: true });
  });

  it('versions WarrantyPolicy updates and preserves ordered history', async () => {
    const { atlas, dir } = createTestAtlas();
    const entityId = 'record.policy.warranty.upsert';

    await upsertEntity(
      atlas,
      ORG_RECORD_TYPE_WARRANTY_POLICY,
      entityId,
      Object.freeze({
        policyCode: 'WARRANTY-UPSERT',
        warrantyDays: 60,
        effectiveFrom: '2026-01-01',
      }),
    );

    await upsertEntity(
      atlas,
      ORG_RECORD_TYPE_WARRANTY_POLICY,
      entityId,
      Object.freeze({
        policyCode: 'WARRANTY-UPSERT',
        warrantyDays: 90,
        effectiveFrom: '2026-06-01',
      }),
      'legal.ops',
    );

    const afterSecond = await resolveCurrentPolicy(
      atlas,
      ORG_RECORD_TYPE_WARRANTY_POLICY,
      'WARRANTY-UPSERT',
    );

    expect(parseWarrantyPolicy(afterSecond.content).warrantyDays).toBe(90);
    expect(afterSecond.revision).toBe(2);

    const historyAfterSecond = await resolvePolicyHistory(atlas, entityId);

    expect(historyAfterSecond).toHaveLength(1);
    expect(parseWarrantyPolicy(historyAfterSecond[0]?.content).warrantyDays).toBe(60);

    await upsertEntity(
      atlas,
      ORG_RECORD_TYPE_WARRANTY_POLICY,
      entityId,
      Object.freeze({
        policyCode: 'WARRANTY-UPSERT',
        warrantyDays: 120,
        effectiveFrom: '2026-09-01',
      }),
    );

    const current = await resolveCurrentPolicy(
      atlas,
      ORG_RECORD_TYPE_WARRANTY_POLICY,
      'WARRANTY-UPSERT',
    );

    expect(parseWarrantyPolicy(current.content).warrantyDays).toBe(120);
    expect(current.revision).toBe(3);

    const history = await resolvePolicyHistory(atlas, entityId);

    expect(history).toHaveLength(2);
    expect(parseWarrantyPolicy(history[0]?.content).warrantyDays).toBe(60);
    expect(parseWarrantyPolicy(history[1]?.content).warrantyDays).toBe(90);

    rmSync(dir, { recursive: true, force: true });
  });
});
