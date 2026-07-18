declare const timestampBrand: unique symbol;

export type AtlasTimestamp = string & { readonly [timestampBrand]: typeof timestampBrand };

export function isAtlasTimestamp(value: unknown): value is AtlasTimestamp {
  if (typeof value !== 'string') {
    return false;
  }

  const parsed = Date.parse(value);
  return !Number.isNaN(parsed);
}

export function createAtlasTimestamp(value?: string | Date): AtlasTimestamp {
  const candidate =
    value instanceof Date ? value.toISOString() : (value ?? new Date().toISOString());

  if (!isAtlasTimestamp(candidate)) {
    throw new Error('Invalid AtlasTimestamp format');
  }

  return candidate as AtlasTimestamp;
}

export function now(): AtlasTimestamp {
  return createAtlasTimestamp();
}
