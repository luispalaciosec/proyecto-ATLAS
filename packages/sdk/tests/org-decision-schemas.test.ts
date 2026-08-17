import { describe, expect, it } from 'vitest';

import { assertDecision } from '../src/org/schemas/decision.js';
import { assertEvidence } from '../src/org/schemas/evidence.js';

describe('Decision and Evidence schemas', () => {
  it('assertDecision rejects missing subjectType', () => {
    expect(() =>
      assertDecision(
        Object.freeze({
          clientLegalName: 'Constructora Andes S.A.',
          requestedPercent: 12,
          outcome: 'approved',
          decidedBy: 'SalesDirector',
          decidedAt: '2026-08-15',
        }),
      ),
    ).toThrow(/subjectType/);
  });

  it('assertDecision rejects invalid outcome', () => {
    expect(() =>
      assertDecision(
        Object.freeze({
          subjectType: 'discount_request',
          clientLegalName: 'Constructora Andes S.A.',
          requestedPercent: 12,
          outcome: 'pending',
          decidedBy: 'SalesDirector',
          decidedAt: '2026-08-15',
        }),
      ),
    ).toThrow(/outcome/);
  });

  it('assertEvidence rejects missing content', () => {
    expect(() =>
      assertEvidence(
        Object.freeze({
          sourceType: 'manual',
          recordedBy: 'SalesDirector',
        }),
      ),
    ).toThrow(/content/);
  });

  it('assertEvidence rejects missing recordedBy', () => {
    expect(() =>
      assertEvidence(
        Object.freeze({
          content: 'texto de evidencia',
          sourceType: 'manual',
        }),
      ),
    ).toThrow(/recordedBy/);
  });
});
