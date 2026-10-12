import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createAtlas } from '../src/index.js';
import { formatDecisionWithEvidence } from '../src/org/decision-answer.js';
import {
  resolveDecisionHistoryWithEvidence,
  resolveDecisionWithEvidence,
} from '../src/org/decision-resolver.js';
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

  it('returns the full decision history (most recent first) and shows decision notes', async () => {
    const { atlas, dir } = createTestAtlas();

    await seedCase1WithApproval(atlas);

    await atlas.org.recordDecision(
      'record.decision.andes-discount-2026-10-01',
      Object.freeze({
        subjectType: 'discount_request',
        clientLegalName: 'Constructora Andes S.A.',
        requestedPercent: 15,
        outcome: 'rejected',
        decidedBy: 'SalesDirector',
        decidedAt: '2026-10-01',
        notes: 'Segunda solicitud sin contraprestación clara.',
      }),
      'record.client.constructora-andes',
      Object.freeze(['record.evidence.andes-renewal-2023']),
    );

    const history = await resolveDecisionHistoryWithEvidence(
      atlas,
      'Constructora Andes S.A.',
      'discount_request',
    );

    expect(history).toHaveLength(2);
    expect(parseDecision(readEntityPayload(history[0]!.decision)).decidedAt).toBe('2026-10-01');
    expect(parseDecision(readEntityPayload(history[1]!.decision)).decidedAt).toBe('2026-08-15');

    const formattedLatest = formatDecisionWithEvidence(history[0]!);
    expect(formattedLatest).toContain('Notas: Segunda solicitud sin contraprestación clara.');

    const formattedHistory = await atlas.org.formatDecisionHistory(history);
    expect(formattedHistory).toContain('Decisión 1 de 2');
    expect(formattedHistory).toContain('Decisión 2 de 2');
    expect(formattedHistory).toContain('Notas: Segunda solicitud sin contraprestación clara.');

    rmSync(dir, { recursive: true, force: true });
  });
});
