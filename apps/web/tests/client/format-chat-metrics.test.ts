import { describe, expect, it } from 'vitest';

import { formatChatMetrics } from '../../src/client/lib/format-chat-metrics.js';

describe('formatChatMetrics', () => {
  it('formats elapsed time only when tokens are unavailable', () => {
    expect(formatChatMetrics({ elapsedMs: 840 })).toBe('0.8 s');
    expect(formatChatMetrics({ elapsedMs: 12_400 })).toBe('12 s');
  });

  it('formats elapsed time and token usage together', () => {
    const formatted = formatChatMetrics({
      elapsedMs: 9_600,
      inputTokens: 842,
      outputTokens: 403,
    });

    expect(formatted).toContain('9.6 s');
    expect(formatted).toContain('842 entrada');
    expect(formatted).toContain('403 salida');
    expect(formatted).toContain('tokens');
  });
});
