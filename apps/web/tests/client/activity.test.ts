/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderActivity } from '../../src/client/pages/activity.js';
import { getState, setActiveWorkspace, setRoute } from '../../src/client/state/app-state.js';

const fetchActivity = vi.fn();

vi.mock('../../src/client/api/client.js', () => ({
  fetchActivity: (...args: unknown[]) => fetchActivity(...args),
}));

async function flushUi(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('renderActivity', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main"></main>';
    setActiveWorkspace('default', { resetChat: true });
    setRoute('/actividad');
    fetchActivity.mockReset();
  });

  it('renders empty state when there is no activity', async () => {
    fetchActivity.mockResolvedValue({
      workspace: 'default',
      scopeNote: 'Nota de sesión',
      items: [],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderActivity(main);
    await flushUi();

    expect(main.textContent).toContain('Todavía no hay actividad');
    expect(main.textContent).toContain('Empieza una conversación');
  });

  it('renders populated timeline with filters', async () => {
    fetchActivity.mockResolvedValue({
      workspace: 'geeks',
      scopeNote: 'Nota de sesión',
      items: [
        {
          id: '1',
          type: 'conversation',
          title: 'ATLAS respondió una consulta',
          description: 'ATLAS consultó información disponible en Conocimiento.',
          occurredAt: new Date().toISOString(),
          workspace: 'geeks',
          workspaceName: 'Geeks',
          status: 'success',
          quote: '¿Qué sabemos de Ana García?',
          action: { kind: 'open-chat', label: 'Ver conversación' },
        },
      ],
    });

    setActiveWorkspace('geeks', { resetChat: true });
    const main = document.querySelector('#main') as HTMLElement;
    renderActivity(main);
    await flushUi();

    expect(main.textContent).toContain('ATLAS respondió una consulta');
    expect(main.textContent).toContain('Ver conversación');
    expect(main.querySelectorAll('.activity-filter').length).toBe(5);
  });

  it('shows error state with retry', async () => {
    fetchActivity.mockRejectedValueOnce(new Error('activity unavailable'));

    const main = document.querySelector('#main') as HTMLElement;
    renderActivity(main);
    await flushUi();

    expect(main.textContent).toContain('No pudimos cargar tu actividad');
    expect(main.textContent).toContain('Intentar de nuevo');
  });

  it('reloads when filter changes', async () => {
    fetchActivity.mockResolvedValue({
      workspace: 'default',
      scopeNote: 'Nota',
      items: [],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderActivity(main);
    await flushUi();

    const knowledgeFilter = main.querySelector('[data-filter="knowledge"]') as HTMLButtonElement;
    knowledgeFilter.click();
    await flushUi();

    expect(fetchActivity).toHaveBeenLastCalledWith('default', { type: 'knowledge' });
    expect(getState().route).toBe('/actividad');
  });
});
