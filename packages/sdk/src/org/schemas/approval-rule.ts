export interface ApprovalRule {
  readonly appliesWhen: string;
  readonly approverRole: string;
  readonly approverQueue: string;
}

export function assertApprovalRule(value: unknown): asserts value is ApprovalRule {
  if (typeof value !== 'object' || value === null) {
    throw new Error('ApprovalRule must be an object');
  }

  const candidate = value as Partial<ApprovalRule>;

  if (typeof candidate.appliesWhen !== 'string' || candidate.appliesWhen.trim().length === 0) {
    throw new Error('ApprovalRule.appliesWhen must be a non-empty string');
  }

  if (typeof candidate.approverRole !== 'string' || candidate.approverRole.trim().length === 0) {
    throw new Error('ApprovalRule.approverRole must be a non-empty string');
  }

  if (typeof candidate.approverQueue !== 'string' || candidate.approverQueue.trim().length === 0) {
    throw new Error('ApprovalRule.approverQueue must be a non-empty string');
  }
}

export function parseApprovalRule(value: unknown): ApprovalRule {
  assertApprovalRule(value);

  return Object.freeze({
    appliesWhen: value.appliesWhen.trim(),
    approverRole: value.approverRole.trim(),
    approverQueue: value.approverQueue.trim(),
  });
}
