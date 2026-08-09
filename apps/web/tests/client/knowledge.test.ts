/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyPendingChatDraftToComposer,
  renderKnowledge,
} from '../../src/client/pages/knowledge.js';
import {
  getState,
  setActiveWorkspace,
  setPendingChatDraft,
  setRoute,
} from '../../src/client/state/app-state.js';

const searchKnowledge = vi.fn();

vi.mock('../../src/client/api/client.js', () => ({
  searchKnowledge: (...args: unknown[]) => searchKnowledge(...args),
  fetchHistory: vi.fn(async () => ({ workspace: 'default', messages: [], canCorrect: false })),
  fetchWorkspaces: vi.fn(async () => ({ workspaces: ['default'] })),
  sendChatMessage: vi.fn(),
  sendCorrection: vi.fn(),
}));

async function flushUi(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('renderKnowledge', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main"></main>';
    setActiveWorkspace('default', { resetChat: true });
    setRoute('/conocimiento');
    searchKnowledge.mockReset();
  });

  it('renders empty state before searching', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    expect(main.textContent).toContain('Tu conocimiento está aquí para ayudarte.');
    expect(main.querySelector('#knowledge-examples')?.children.length).toBe(4);
    expect(main.textContent).toContain('Trabajando en General');
  });

  it('shows loading and results after search', async () => {
    searchKnowledge.mockResolvedValue({
      workspace: 'default',
      query: 'Clientes VIP',
      total: 1,
      records: [
        {
          id: 'record.1',
          title: 'Ana García es cliente VIP',
          snippet: 'Ana García es cliente VIP desde 2024.',
          typeLabel: 'Nota',
          contextLabel: 'General',
          sourceLabel: 'Información almacenada en el conocimiento general.',
        },
      ],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'Clientes VIP';
    (main.querySelector('#knowledge-search-form') as HTMLFormElement).requestSubmit();

    expect(main.textContent).toContain('Estamos buscando en el conocimiento de General');

    await flushUi();
    await flushUi();

    expect(searchKnowledge).toHaveBeenCalledWith('default', 'Clientes VIP');
    expect(main.textContent).toContain('1 resultado encontrado');
    expect(main.textContent).toContain('Ana García es cliente VIP');
    expect(main.textContent).toContain('Usar en una conversación');
  });

  it('shows no-results state with ask action', async () => {
    searchKnowledge.mockResolvedValue({
      workspace: 'default',
      query: 'inexistente',
      total: 0,
      records: [],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'inexistente';
    (main.querySelector('#knowledge-search-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    expect(main.textContent).toContain('No encontramos información sobre eso.');
    expect(main.textContent).toContain('No encontré lo que buscaba');
  });

  it('shows error state with retry', async () => {
    searchKnowledge.mockRejectedValueOnce(new Error('CORE_INVALID_IDENTIFIER'));

    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'fallo';
    (main.querySelector('#knowledge-search-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    expect(main.textContent).toContain('No pudimos consultar el conocimiento en este momento.');
    expect(main.textContent).toContain('Intentar de nuevo');
    const details = main.querySelector('.error-panel__details') as HTMLElement | null;
    expect(details?.hidden).toBe(true);
    expect(details?.textContent).toContain('CORE_INVALID_IDENTIFIER');
  });

  it('opens chat with a prepared prompt from a result', async () => {
    searchKnowledge.mockResolvedValue({
      workspace: 'geeks',
      query: 'Ana García',
      total: 1,
      records: [
        {
          id: 'record.1',
          title: 'Ana García es cliente VIP',
          snippet: 'Ana García es cliente VIP desde 2024.',
          typeLabel: 'Nota',
          contextLabel: 'Geeks',
          sourceLabel: 'Información almacenada en el conocimiento de Geeks.',
        },
      ],
    });

    setActiveWorkspace('geeks', { resetChat: true });
    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'Ana García';
    (main.querySelector('#knowledge-search-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    const useButton = main.querySelector('.knowledge-card__actions .btn') as HTMLButtonElement;
    useButton.click();

    expect(getState().pendingChatDraft).toContain('Ana García');
    expect(getState().route).toBe('/chat');
  });

  it('resets to idle when active brand changes', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderKnowledge(main);

    const input = main.querySelector('#knowledge-search-input') as HTMLInputElement;
    input.value = 'persistente';

    setActiveWorkspace('geeks', { resetChat: true });
    renderKnowledge(main);

    expect(getState().activeWorkspace).toBe('geeks');
    expect(main.textContent).toContain('Tu conocimiento está aquí para ayudarte.');
  });
});

describe('applyPendingChatDraftToComposer', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <main id="main">
        <textarea id="chat-input"></textarea>
      </main>
    `;
  });

  it('prefills chat composer from pending draft', async () => {
    setPendingChatDraft('¿Qué información tenemos sobre Ana García?');
    applyPendingChatDraftToComposer();
    await flushUi();

    const input = document.querySelector('#chat-input') as HTMLTextAreaElement;
    expect(input.value).toBe('¿Qué información tenemos sobre Ana García?');
  });
});
