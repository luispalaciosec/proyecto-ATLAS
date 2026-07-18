declare const traceIdBrand: unique symbol;

export type TraceId = string & { readonly [traceIdBrand]: typeof traceIdBrand };

const TRACE_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isTraceId(value: unknown): value is TraceId {
  return typeof value === 'string' && TRACE_ID_PATTERN.test(value);
}

export function createTraceId(value?: string): TraceId {
  const candidate = value ?? crypto.randomUUID();

  if (!isTraceId(candidate)) {
    throw new Error('Invalid TraceId format');
  }

  return candidate as TraceId;
}
