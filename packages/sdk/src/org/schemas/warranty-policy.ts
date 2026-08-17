export interface WarrantyPolicy {
  readonly policyCode: string;
  readonly warrantyDays: number;
  readonly effectiveFrom: string;
}

export function assertWarrantyPolicy(value: unknown): asserts value is WarrantyPolicy {
  if (typeof value !== 'object' || value === null) {
    throw new Error('WarrantyPolicy must be an object');
  }

  const candidate = value as Partial<WarrantyPolicy>;

  if (typeof candidate.policyCode !== 'string' || candidate.policyCode.trim().length === 0) {
    throw new Error('WarrantyPolicy.policyCode must be a non-empty string');
  }

  if (typeof candidate.warrantyDays !== 'number' || !Number.isFinite(candidate.warrantyDays)) {
    throw new Error('WarrantyPolicy.warrantyDays must be a finite number');
  }

  if (typeof candidate.effectiveFrom !== 'string' || candidate.effectiveFrom.trim().length === 0) {
    throw new Error('WarrantyPolicy.effectiveFrom must be a non-empty string');
  }
}

export function parseWarrantyPolicy(value: unknown): WarrantyPolicy {
  assertWarrantyPolicy(value);

  return Object.freeze({
    policyCode: value.policyCode.trim(),
    warrantyDays: value.warrantyDays,
    effectiveFrom: value.effectiveFrom.trim(),
  });
}
