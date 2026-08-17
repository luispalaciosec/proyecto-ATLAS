import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';
import { formatDecisionWithEvidence } from '../src/org/decision-answer.js';
import { resolveDecisionWithEvidence } from '../src/org/decision-resolver.js';
import { readEntityPayload } from '../src/org/entity-resolver.js';
import { seedCase1WithApproval } from '../src/org/fixtures.js';
import { parseDecision } from '../src/org/schemas/decision.js';
import { parseEvidence } from '../src/org/schemas/evidence.js';

function createTestAtlas() {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-org-decision-resolver-'));

  return Object.freeze({
    dir,
    atlas: createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
    }),
  });
}

describe('resolveDecisionWithEvidence', () => {
  it('returns the anchor-case approval with cited evidence for Constructora Andes', async () => {
    const { atlas, dir } = createTestAtlas();

    await seedCase1WithApproval(atlas);

    const resolved = await resolveDecisionWithEvidence(
      atlas,
      'Constructora Andes S.A.',
      'discount_request',
    );

    expect(resolved).toBeDefined();

    const decision = parseDecision(readEntityPayload(resolved!.decision));
    expect(decision.outcome).toBe('approved');
    expect(decision.decidedBy).toBe('SalesDirector');
    expect(decision.approvedPercent).toBe(12);
    expect(resolved!.evidence).toHaveLength(1);
    expect(parseEvidence(readEntityPayload(resolved!.evidence[0]!)).content).toContain(
      'renovación continua desde 2023',
    );

    const formatted = formatDecisionWithEvidence(resolved!);
    expect(formatted).toContain('SalesDirector');
    expect(formatted).toContain('2026-08-15');
    expect(formatted).toContain('renovación continua desde 2023');

    rmSync(dir, { recursive: true, force: true });
  });

  it('returns undefined when no decision exists for the client', async () => {
    const { atlas, dir } = createTestAtlas();

    const resolved = await resolveDecisionWithEvidence(atlas, 'Cliente Inexistente S.A.');

    expect(resolved).toBeUndefined();

    rmSync(dir, { recursive: true, force: true });
  });
});
