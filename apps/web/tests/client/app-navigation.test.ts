/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mountApp } from '../../src/client/app.js';
import { getState, setRoute } from '../../src/client/state/app-state.js';

function mockAppFetch(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = typeof input === 'string' ? input : input.toString();

      if (url.includes('/api/brands')) {
        return {
          ok: true,
          json: async () => ({
            brands: [{ id: 'default', name: 'General', isGeneral: true, isActive: true }],
            activeBrandId: 'default',
          }),
        };
      }

      if (url.includes('/api/history')) {
        return {
          ok: true,
          json: async () => ({ messages: [], canCorrect: false }),
        };
      }

      if (url.includes('/api/activity')) {
        return {
          ok: true,
          json: async () => ({ items: [] }),
        };
      }

      return {
        ok: false,
        status: 404,
        json: async () => ({}),
      };
    }),
  );
}

describe('mountApp navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })) as typeof window.matchMedia;
    mockAppFetch();
  });

  it('opens chat without re-mounting in a loop', async () => {
    const root = document.querySelector('#app') as HTMLElement;
    await mountApp(root);

    setRoute('/chat');

    expect(getState().route).toBe('/chat');
    expect(root.querySelector('#chat-form')).not.toBeNull();
    expect(root.querySelector('.chat-layout')).not.toBeNull();
  });
});
