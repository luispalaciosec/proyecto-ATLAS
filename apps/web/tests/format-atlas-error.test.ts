import { describe, expect, it } from 'vitest';

import { extractApiErrorMessage, formatAtlasError } from '../src/lib/format-atlas-error.js';

describe('formatAtlasError', () => {
  it('returns Error.message for native errors', () => {
    expect(formatAtlasError(new Error('network down'))).toBe('network down');
  });

  it('formats Atlas structured errors thrown as plain objects', () => {
    expect(
      formatAtlasError({
        code: 'CORE_INVALID_IDENTIFIER',
        message: 'Identifier must start with a letter',
      }),
    ).toBe('CORE_INVALID_IDENTIFIER: Identifier must start with a letter');
  });

  it('extracts nested API error payloads', () => {
    expect(
      extractApiErrorMessage(
        {
          error: {
            code: 'CORE_INVALID_IDENTIFIER',
            message: 'Identifier must start with a letter',
          },
        },
        'fallback',
      ),
    ).toBe('CORE_INVALID_IDENTIFIER: Identifier must start with a letter');
  });

  it('keeps string API errors unchanged', () => {
    expect(extractApiErrorMessage({ error: 'Chat request failed' }, 'fallback')).toBe(
      'Chat request failed',
    );
  });
});
