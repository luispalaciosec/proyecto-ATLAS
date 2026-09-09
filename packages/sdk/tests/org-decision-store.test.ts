import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';
import {
  ORG_RECORD_TYPE_DECISION,
  ORG_RECORD_TYPE_EVIDENCE,
  ORG_RELATIONSHIP_CITES,
  ORG_RELATIONSHIP_RESOLVES,
} from '../src/org/constants.js';
import { recordDecision, storeDecision, storeEvidence } from '../src/org/decision-store.js';
import { resolveEntityById, readEntityPayload } from '../src/org/entity-resolver.js';
import { seedCase1DiscountGraph } from '../src/org/fixtures.js';
import { getRelated } from '../src/org/graph-traversal.js';
import { getEntityId } from '../src/org/record-content.js';
import { parseEvidence } from '../src/org/schemas/evidence.js';

function createTestAtlas() {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-org-decision-store-'));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
    }),
  });
}

describe('decision-store', () => {
  it('storeDecision and storeEvidence are resolvable by explicit recordType', async () => {
    const { atlas, dir } = createTestAtlas();

    await storeEvidence(
      atlas,
      'record.evidence.test',
      Object.freeze({
        content: 'evidencia de prueba',
        sourceType: 'manual',
        recordedBy: 'Tester',
      }),
    );

    await storeDecision(
      atlas,
      'record.decision.test',
      Object.freeze({
        subjectType: 'discount_request',
        clientLegalName: 'Test S.A.',
        requestedPercent: 8,
        outcome: 'approved',
        decidedBy: 'Tester',
        decidedAt: '2026-08-15',
      }),
    );

    const evidence = await resolveEntityById(
      atlas,
      'record.evidence.test',
      ORG_RECORD_TYPE_EVIDENCE,
    );
    const decision = await resolveEntityById(
      atlas,
      'record.decision.test',
      ORG_RECORD_TYPE_DECISION,
    );

    expect(evidence).toBeDefined();
    expect(decision).toBeDefined();
    expect(parseEvidence(readEntityPayload(evidence!)).content).toBe('evidencia de prueba');

    rmSync(dir, { recursive: true, force: true });
  });

  it('recordDecision creates resolves and cites relationships', async () => {
    const { atlas, dir } = createTestAtlas();

    await seedCase1DiscountGraph(atlas);

    await storeEvidence(
      atlas,
      'record.evidence.andes-renewal-2023',
      Object.freeze({
        content: 'cliente en renovación continua desde 2023, sin incidentes de pago',
        sourceType: 'manual',
        recordedBy: 'SalesDirector',
      }),
    );

    await recordDecision(
      atlas,
      'record.decision.andes-discount-2026-08-15',
      Object.freeze({
        subjectType: 'discount_request',
        clientLegalName: 'Constructora Andes S.A.',
        requestedPercent: 12,
        outcome: 'approved',
        approvedPercent: 12,
        decidedBy: 'SalesDirector',
        decidedAt: '2026-08-15',
      }),
      'record.client.constructora-andes',
      Object.freeze(['record.evidence.andes-renewal-2023']),
    );

    const decisionId = 'record.decision.andes-discount-2026-08-15';
    const resolvedTargets = await getRelated(atlas, decisionId, ORG_RELATIONSHIP_RESOLVES);
    const citedEvidence = await getRelated(atlas, decisionId, ORG_RELATIONSHIP_CITES);

    expect(resolvedTargets).toHaveLength(1);
    expect(getEntityId(resolvedTargets[0]!)).toBe('record.client.constructora-andes');
    expect(citedEvidence).toHaveLength(1);
    expect(getEntityId(citedEvidence[0]!)).toBe('record.evidence.andes-renewal-2023');

    rmSync(dir, { recursive: true, force: true });
  });
});
