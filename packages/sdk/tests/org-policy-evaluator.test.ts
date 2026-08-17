import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';
import { seedCase1DiscountGraph } from '../src/org/fixtures.js';
import { evaluateDiscountRequest } from '../src/org/policy-evaluator.js';

function createTestAtlas() {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-org-policy-eval-'));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
    }),
  });
}

describe('evaluateDiscountRequest', () => {
  it('requires SalesDirector approval for 12% on Constructora Andes', async () => {
    const { atlas, dir } = createTestAtlas();

    await seedCase1DiscountGraph(atlas);

    const evaluation = await evaluateDiscountRequest(atlas, 'Constructora Andes S.A.', 12);

    expect(evaluation.autonomous).toBe(false);
    expect(evaluation.limitPercent).toBe(10);
    expect(evaluation.requestedPercent).toBe(12);
    expect(evaluation.approverRole).toBe('SalesDirector');
    expect(evaluation.client.legalName).toBe('Constructora Andes S.A.');

    rmSync(dir, { recursive: true, force: true });
  });

  it('allows 8% autonomously without approverRole', async () => {
    const { atlas, dir } = createTestAtlas();

    await seedCase1DiscountGraph(atlas);

    const evaluation = await evaluateDiscountRequest(atlas, 'Constructora Andes S.A.', 8);

    expect(evaluation.autonomous).toBe(true);
    expect(evaluation.limitPercent).toBe(10);
    expect(evaluation.approverRole).toBeUndefined();

    rmSync(dir, { recursive: true, force: true });
  });
});
