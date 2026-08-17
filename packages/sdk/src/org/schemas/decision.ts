export type DecisionOutcome = 'approved' | 'rejected';

export interface Decision {
  readonly subjectType: string;
  readonly clientLegalName: string;
  readonly requestedPercent: number;
  readonly outcome: DecisionOutcome;
  readonly decidedBy: string;
  readonly decidedAt: string;
  readonly approvedPercent?: number;
  readonly requestId?: string;
  readonly notes?: string;
}

const DECISION_OUTCOMES: readonly DecisionOutcome[] = Object.freeze(['approved', 'rejected']);

export function assertDecision(value: unknown): asserts value is Decision {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Decision must be an object');
  }

  const candidate = value as Partial<Decision>;

  if (typeof candidate.subjectType !== 'string' || candidate.subjectType.trim().length === 0) {
    throw new Error('Decision.subjectType must be a non-empty string');
  }

  if (
    typeof candidate.clientLegalName !== 'string' ||
    candidate.clientLegalName.trim().length === 0
  ) {
    throw new Error('Decision.clientLegalName must be a non-empty string');
  }

  if (typeof candidate.requestedPercent !== 'number' || !Number.isFinite(candidate.requestedPercent)) {
    throw new Error('Decision.requestedPercent must be a finite number');
  }

  if (
    typeof candidate.outcome !== 'string' ||
    !(DECISION_OUTCOMES as readonly string[]).includes(candidate.outcome)
  ) {
    throw new Error('Decision.outcome must be "approved" or "rejected"');
  }

  if (typeof candidate.decidedBy !== 'string' || candidate.decidedBy.trim().length === 0) {
    throw new Error('Decision.decidedBy must be a non-empty string');
  }

  if (typeof candidate.decidedAt !== 'string' || candidate.decidedAt.trim().length === 0) {
    throw new Error('Decision.decidedAt must be a non-empty string');
  }

  if (candidate.approvedPercent !== undefined) {
    if (
      typeof candidate.approvedPercent !== 'number' ||
      !Number.isFinite(candidate.approvedPercent)
    ) {
      throw new Error('Decision.approvedPercent must be a finite number when provided');
    }
  }

  if (candidate.requestId !== undefined) {
    if (typeof candidate.requestId !== 'string' || candidate.requestId.trim().length === 0) {
      throw new Error('Decision.requestId must be a non-empty string when provided');
    }
  }

  if (candidate.notes !== undefined) {
    if (typeof candidate.notes !== 'string' || candidate.notes.trim().length === 0) {
      throw new Error('Decision.notes must be a non-empty string when provided');
    }
  }
}

export function parseDecision(value: unknown): Decision {
  assertDecision(value);

  return Object.freeze({
    subjectType: value.subjectType.trim(),
    clientLegalName: value.clientLegalName.trim(),
    requestedPercent: value.requestedPercent,
    outcome: value.outcome,
    decidedBy: value.decidedBy.trim(),
    decidedAt: value.decidedAt.trim(),
    ...(value.approvedPercent !== undefined ? { approvedPercent: value.approvedPercent } : {}),
    ...(value.requestId !== undefined ? { requestId: value.requestId.trim() } : {}),
    ...(value.notes !== undefined ? { notes: value.notes.trim() } : {}),
  });
}
