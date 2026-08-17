export interface Client {
  readonly legalName: string;
  readonly segment: string;
  readonly renewalActive: boolean;
}

export function assertClient(value: unknown): asserts value is Client {
  if (typeof value !== 'object' || value === null) {
    throw new Error('Client must be an object');
  }

  const candidate = value as Partial<Client>;

  if (typeof candidate.legalName !== 'string' || candidate.legalName.trim().length === 0) {
    throw new Error('Client.legalName must be a non-empty string');
  }

  if (typeof candidate.segment !== 'string' || candidate.segment.trim().length === 0) {
    throw new Error('Client.segment must be a non-empty string');
  }

  if (typeof candidate.renewalActive !== 'boolean') {
    throw new Error('Client.renewalActive must be a boolean');
  }
}

export function parseClient(value: unknown): Client {
  assertClient(value);

  return Object.freeze({
    legalName: value.legalName.trim(),
    segment: value.segment.trim(),
    renewalActive: value.renewalActive,
  });
}
