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

describe('decisions citing several evidence records', () => {
  // Regression: getRelated used to resolve targets with Promise.all, and the memory engine
  // rejects concurrent reads ("already has an active execution") as soon as a decision
  // cites two or more evidence records.
  it('resolves decisions citing 2 and 3 evidence records, keeping the cited order', async () => {
    const { atlas, dir } = createTestAtlas();

    await atlas.org.upsertEntity(
      'Client',
      'client.ficticio-demo',
      Object.freeze({ legalName: 'Cliente Ficticio S.A.', segment: 'VIP', renewalActive: true }),
    );

    const evidenceIds = [
      'record.evidence.ficticia-1',
      'record.evidence.ficticia-2',
      'record.evidence.ficticia-3',
    ];

    for (const evidenceId of evidenceIds) {
      await atlas.org.storeEvidence(
        evidenceId,
        Object.freeze({
          content: `Evidencia ${evidenceId}`,
          sourceType: 'manual',
          recordedBy: 'Test',
        }),
      );
    }

    const baseDecision = {
      subjectType: 'discount_request',
      clientLegalName: 'Cliente Ficticio S.A.',
      outcome: 'approved' as const,
      decidedBy: 'Gerente Ficticio',
    };

    await atlas.org.recordDecision(
      'record.decision.ficticia-tres-evidencias',
      Object.freeze({
        ...baseDecision,
        requestedPercent: 8,
        approvedPercent: 6,
        decidedAt: '2026-03-01',
      }),
      'client.ficticio-demo',
      evidenceIds,
    );
    await atlas.org.recordDecision(
      'record.decision.ficticia-dos-evidencias',
      Object.freeze({
        ...baseDecision,
        requestedPercent: 12,
        approvedPercent: 7,
        decidedAt: '2026-07-01',
      }),
      'client.ficticio-demo',
      evidenceIds.slice(0, 2),
    );

    const latest = await resolveDecisionWithEvidence(
      atlas,
      'Cliente Ficticio S.A.',
      'discount_request',
    );
    const history = await resolveDecisionHistoryWithEvidence(
      atlas,
      'Cliente Ficticio S.A.',
      'discount_request',
    );
    const citedIds = (entry: {
      readonly evidence: readonly { metadata: Record<string, unknown> }[];
    }) => entry.evidence.map((record) => record.metadata.entityId);

    expect(latest).toBeDefined();
    expect(citedIds(latest!)).toEqual(evidenceIds.slice(0, 2));
    expect(history).toHaveLength(2);
    expect(parseDecision(readEntityPayload(history[0]!.decision)).decidedAt).toBe('2026-07-01');
    expect(citedIds(history[0]!)).toEqual(evidenceIds.slice(0, 2));
    expect(citedIds(history[1]!)).toEqual(evidenceIds);

    rmSync(dir, { recursive: true, force: true });
  });
});
