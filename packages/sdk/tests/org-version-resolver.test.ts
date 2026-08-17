import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';
import { seedCase2WarrantyPolicy } from '../src/org/fixtures.js';
import { parseWarrantyPolicy } from '../src/org/schemas/warranty-policy.js';
import {
  resolveCurrentWarrantyByCode,
  resolvePolicyHistory,
} from '../src/org/version-resolver.js';
import { readEntityPayload } from '../src/org/entity-resolver.js';

function createTestAtlas() {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-org-version-'));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
    }),
  });
}

describe('resolveCurrentPolicy / resolvePolicyHistory', () => {
  it('returns current 60-day warranty and ordered historical revisions', async () => {
    const { atlas, dir } = createTestAtlas();

    await seedCase2WarrantyPolicy(atlas);

    const current = await resolveCurrentWarrantyByCode(atlas, 'WARRANTY-STD');

    expect(current.content.warrantyDays).toBe(60);
    expect(current.revision).toBe(2);

    const history = await resolvePolicyHistory(atlas, current.entityId);

    expect(history).toHaveLength(1);
    expect(history[0]?.revision).toBe(1);
    expect(parseWarrantyPolicy(history[0]?.content).warrantyDays).toBe(45);
    expect(history[0]?.author).toBe('legal.ops');

    const currentPayload = parseWarrantyPolicy(readEntityPayload(current.record));
    expect(currentPayload.effectiveFrom).toBe('2026-06-01');

    rmSync(dir, { recursive: true, force: true });
  });
});
