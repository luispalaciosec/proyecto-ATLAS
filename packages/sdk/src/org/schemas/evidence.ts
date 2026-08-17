export interface Evidence {
  readonly content: string;
  readonly sourceType: string;
  readonly recordedBy: string;
  readonly recordedAt?: string;
  readonly sourceLabel?: string;
}

export function assertEvidence(value: unknown): asserts value is Evidence {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Evidence must be an object');
  }

  const candidate = value as Partial<Evidence>;

  if (typeof candidate.content !== 'string' || candidate.content.trim().length === 0) {
    throw new Error('Evidence.content must be a non-empty string');
  }

  if (typeof candidate.sourceType !== 'string' || candidate.sourceType.trim().length === 0) {
    throw new Error('Evidence.sourceType must be a non-empty string');
  }

  if (typeof candidate.recordedBy !== 'string' || candidate.recordedBy.trim().length === 0) {
    throw new Error('Evidence.recordedBy must be a non-empty string');
  }

  if (candidate.recordedAt !== undefined) {
    if (typeof candidate.recordedAt !== 'string' || candidate.recordedAt.trim().length === 0) {
      throw new Error('Evidence.recordedAt must be a non-empty string when provided');
    }
  }

  if (candidate.sourceLabel !== undefined) {
    if (typeof candidate.sourceLabel !== 'string' || candidate.sourceLabel.trim().length === 0) {
      throw new Error('Evidence.sourceLabel must be a non-empty string when provided');
    }
  }
}

export function parseEvidence(value: unknown): Evidence {
  assertEvidence(value);

  return Object.freeze({
    content: value.content.trim(),
    sourceType: value.sourceType.trim(),
    recordedBy: value.recordedBy.trim(),
    ...(value.recordedAt !== undefined ? { recordedAt: value.recordedAt.trim() } : {}),
    ...(value.sourceLabel !== undefined ? { sourceLabel: value.sourceLabel.trim() } : {}),
  });
}
