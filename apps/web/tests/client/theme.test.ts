/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyTheme,
  getTheme,
  initTheme,
  resolveSystemTheme,
  setTheme,
  toggleTheme,
} from '../../src/client/lib/theme.js';

describe('theme', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';

    try {
      localStorage.removeItem('atlas.theme');
    } catch {
      // jsdom may not expose localStorage in all environments
    }
  });

  it('defaults to system preference when no stored theme exists', () => {
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('light'),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as typeof window.matchMedia;

    expect(resolveSystemTheme()).toBe('light');
    expect(initTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('applies explicit theme choice to the document root', () => {
    setTheme('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(getTheme()).toBe('dark');

    setTheme('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(getTheme()).toBe('light');
  });

  it('toggleTheme switches between light and dark', () => {
    applyTheme('dark');
    expect(toggleTheme()).toBe('light');
    expect(getTheme()).toBe('light');
    expect(toggleTheme()).toBe('dark');
    expect(getTheme()).toBe('dark');
  });
});
