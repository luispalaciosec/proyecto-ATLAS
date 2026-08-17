export interface DiscountPolicy {
  readonly policyCode: string;
  readonly autonomousMaxPercent: number;
  readonly currency: string;
}

export function assertDiscountPolicy(value: unknown): asserts value is DiscountPolicy {
  if (typeof value !== 'object' || value === null) {
    throw new Error('DiscountPolicy must be an object');
  }

  const candidate = value as Partial<DiscountPolicy>;

  if (typeof candidate.policyCode !== 'string' || candidate.policyCode.trim().length === 0) {
    throw new Error('DiscountPolicy.policyCode must be a non-empty string');
  }

  if (typeof candidate.autonomousMaxPercent !== 'number' || !Number.isFinite(candidate.autonomousMaxPercent)) {
    throw new Error('DiscountPolicy.autonomousMaxPercent must be a finite number');
  }

  if (typeof candidate.currency !== 'string' || candidate.currency.trim().length === 0) {
    throw new Error('DiscountPolicy.currency must be a non-empty string');
  }
}

export function parseDiscountPolicy(value: unknown): DiscountPolicy {
  assertDiscountPolicy(value);

  return Object.freeze({
    policyCode: value.policyCode.trim(),
    autonomousMaxPercent: value.autonomousMaxPercent,
    currency: value.currency.trim(),
  });
}
