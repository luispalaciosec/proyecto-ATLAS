import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';
import { ORG_RECORD_TYPE_CLIENT } from '../src/org/constants.js';
import { storeEntity } from '../src/org/entity-store.js';
import { resolveEntity } from '../src/org/entity-resolver.js';

function createTestAtlas() {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-org-resolver-'));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
    }),
  });
}

describe('resolveEntity', () => {
  it('finds the matching client by exact legalName without confusing other clients', async () => {
    const { atlas, dir } = createTestAtlas();

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
      ORG_RECORD_TYPE_CLIENT,
      'record.client.otro',
      Object.freeze({
        legalName: 'Comercial Pacífico Ltda.',
        segment: 'Standard',
        renewalActive: false,
      }),
    );

    const match = await resolveEntity(atlas, ORG_RECORD_TYPE_CLIENT, {
      legalName: 'Constructora Andes S.A.',
    });

    expect(match).toBeDefined();
    expect(match?.metadata.entityId).toBe('record.client.constructora-andes');

    const otherMatch = await resolveEntity(atlas, ORG_RECORD_TYPE_CLIENT, {
      legalName: 'Comercial Pacífico Ltda.',
    });

    expect(otherMatch).toBeDefined();
    expect(otherMatch?.metadata.entityId).toBe('record.client.otro');
    expect(otherMatch?.id).not.toBe(match?.id);

    rmSync(dir, { recursive: true, force: true });
  });
});
