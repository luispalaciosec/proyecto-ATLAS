import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';
import { OrgMemoryModule } from '../src/modules/org-memory-module.js';
import { seedCase1DiscountGraph } from '../src/org/fixtures.js';

describe('Atlas.org', () => {
  it('exposes OrgMemoryModule and evaluates discounts through the facade', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-org-module-'));
    const atlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
    });

    expect(atlas.org).toBeDefined();
    expect(atlas.org).toBeInstanceOf(OrgMemoryModule);

    await seedCase1DiscountGraph(atlas);

    const evaluation = await atlas.org.evaluateDiscountRequest('Constructora Andes S.A.', 12);

    expect(evaluation.autonomous).toBe(false);
    expect(evaluation.limitPercent).toBe(10);
    expect(evaluation.requestedPercent).toBe(12);
    expect(evaluation.approverRole).toBe('SalesDirector');

    rmSync(dir, { recursive: true, force: true });
  });
});
