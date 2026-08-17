import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';
import {
  ORG_RECORD_TYPE_APPROVAL_RULE,
  ORG_RECORD_TYPE_DISCOUNT_POLICY,
  ORG_RELATIONSHIP_DEPENDENCY,
  ORG_RELATIONSHIP_REFERENCE,
} from '../src/org/constants.js';
import { getEntityId } from '../src/org/record-content.js';
import { resolveEntity } from '../src/org/entity-resolver.js';
import { seedCase1DiscountGraph } from '../src/org/fixtures.js';
import { getRelated } from '../src/org/graph-traversal.js';
import { ORG_RECORD_TYPE_CLIENT } from '../src/org/constants.js';

function createTestAtlas() {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-org-graph-'));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
    }),
  });
}

describe('getRelated', () => {
  it('traverses the Case 1 graph Client → DiscountPolicy → ApprovalRule', async () => {
    const { atlas, dir } = createTestAtlas();

    await seedCase1DiscountGraph(atlas);

    const client = await resolveEntity(atlas, ORG_RECORD_TYPE_CLIENT, {
      legalName: 'Constructora Andes S.A.',
    });
    expect(client).toBeDefined();

    const discountPolicies = await getRelated(
      atlas,
      getEntityId(client!),
      ORG_RELATIONSHIP_REFERENCE,
    );
    expect(discountPolicies).toHaveLength(1);
    expect(discountPolicies[0]?.type).toBe(ORG_RECORD_TYPE_DISCOUNT_POLICY);

    const approvalRules = await getRelated(
      atlas,
      getEntityId(discountPolicies[0]!),
      ORG_RELATIONSHIP_DEPENDENCY,
    );
    expect(approvalRules).toHaveLength(1);
    expect(approvalRules[0]?.type).toBe(ORG_RECORD_TYPE_APPROVAL_RULE);

    rmSync(dir, { recursive: true, force: true });
  });
});
