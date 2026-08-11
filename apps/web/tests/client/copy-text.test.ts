/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from 'vitest';

import { copyTextToClipboard } from '../../src/client/lib/copy-text.js';

describe('copyTextToClipboard', () => {
  it('uses navigator.clipboard when available', async () => {
    const writeText = vi.fn(async () => undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    await expect(copyTextToClipboard('Texto de prueba')).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith('Texto de prueba');
  });

  it('falls back to execCommand when clipboard API fails', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn(async () => {
          throw new Error('denied');
        }),
      },
    });

    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: vi.fn(() => true),
    });

    await expect(copyTextToClipboard('Plan semanal')).resolves.toBe(true);
    expect(document.execCommand).toHaveBeenCalledWith('copy');
  });
});
