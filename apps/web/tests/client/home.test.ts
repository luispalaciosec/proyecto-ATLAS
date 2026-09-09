/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderHome } from '../../src/client/pages/home.js';
import { renderShell } from '../../src/client/components/shell.js';
import {
  applyBrandCatalog,
  getState,
  setActiveWorkspace,
  setPendingChatDraft,
} from '../../src/client/state/app-state.js';
import type { ActivityResponseProduct } from '../../src/presentation/map-activity.js';
import type { HistoryResponseProduct } from '../../src/presentation/map-history.js';

const fetchHistory = vi.fn<(slug: string) => Promise<HistoryResponseProduct>>();
const fetchActivity =
  vi.fn<(slug: string, options?: { limit?: number }) => Promise<ActivityResponseProduct>>();

vi.mock('../../src/client/api/client.js', () => ({
  fetchHistory: (slug: string) => fetchHistory(slug),
  fetchActivity: (slug: string, options?: { limit?: number }) => fetchActivity(slug, options),
}));

function createHistoryMessages(count: number): HistoryResponseProduct['messages'] {
  return Array.from({ length: count }, (_, index) => ({
    id: `hist.default.${index}.user`,
    role: 'user' as const,
    content: `Mensaje de conversación ${index + 1}`,
    createdAt: `2026-01-0${index + 1}T10:00:00.000Z`,
  }));
}

async function flushHome(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('renderHome', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main"></main>';
    setActiveWorkspace('default', { resetChat: true });
    applyBrandCatalog({
      activeBrandId: 'default',
      brands: [{ id: 'default', name: 'General', isGeneral: true, isActive: true }],
    });
    fetchHistory.mockReset();
    fetchActivity.mockReset();
    fetchHistory.mockResolvedValue({
      workspace: 'default',
      messages: [],
      canCorrect: false,
    });
    fetchActivity.mockResolvedValue({
      workspace: 'default',
      scopeNote: 'Nota',
      items: [],
    });
  });

  it('renders hero and working context for General', async () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    expect(main.textContent).toContain('ATLAS es el asistente de trabajo de tu empresa.');
    expect(main.textContent).toContain('Trabajando en General');
    expect(main.querySelector('.home-page')).not.toBeNull();
  });

  it('renders primary CTA toward chat', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);

    const primary = main.querySelector('#home-primary-chat');
    expect(primary?.textContent).toContain('Iniciar conversación');
    expect(main.querySelector('.home-primary')).not.toBeNull();
  });

  it('shows active brand context with human name', async () => {
    applyBrandCatalog({
      activeBrandId: 'geeks',
      brands: [
        { id: 'default', name: 'General', isGeneral: true, isActive: false },
        { id: 'geeks', name: 'Geeks', isGeneral: false, isActive: true },
      ],
    });
    setActiveWorkspace('geeks', { resetChat: true });

    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    expect(main.textContent).toContain('Trabajando con Geeks');
    expect(main.textContent).not.toContain('geeks');
    expect(getState().activeWorkspace).toBe('geeks');
  });

  it('renders action cards for secondary navigation', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);

    expect(main.querySelector('#home-action-knowledge')?.textContent).toContain(
      'Explorar conocimiento',
    );
    expect(main.querySelector('#home-action-brands')?.textContent).toContain(
      'Trabajar con otra marca',
    );
    expect(main.querySelector('#home-action-activity')?.textContent).toContain('Ver actividad');
    expect(main.querySelector('#home-knowledge-cta')?.textContent).toContain('Buscar conocimiento');
    expect(main.querySelector('.home-action-grid')).not.toBeNull();
  });

  it('prepares pendingChatDraft from example without auto-send', async () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);

    const example = main.querySelector('.example-chip') as HTMLButtonElement;
    example.click();

    expect(getState().route).toBe('/chat');
    expect(getState().pendingChatDraft).toBe('¿Qué sabes sobre este cliente?');
  });

  it('shows continue section title', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);

    expect(main.textContent).toContain('Últimas preguntas de esta sesión');
  });

  it('shows empty history state', async () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    expect(main.textContent).toContain('Todavía no hay preguntas en esta sesión');
    expect(main.textContent).toContain(
      'Cuando hables con ATLAS, tus últimas preguntas aparecerán aquí y se conservarán en esta marca.',
    );
  });

  it('shows one history item with human brand name', async () => {
    fetchHistory.mockResolvedValue({
      workspace: 'default',
      messages: [
        {
          id: 'hist.default.0.user',
          role: 'user',
          content: 'Resumen del pedido de Ana García',
          createdAt: '2026-01-01T10:00:00.000Z',
        },
      ],
      canCorrect: false,
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    expect(main.textContent).toContain('Resumen del pedido de Ana García');
    expect(main.textContent).toContain('General');
    expect(main.textContent).not.toContain('default');
  });

  it('shows up to three recent history entries', async () => {
    fetchHistory.mockResolvedValue({
      workspace: 'default',
      messages: createHistoryMessages(5),
      canCorrect: false,
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    expect(main.querySelectorAll('.home-continue-item').length).toBe(3);
    expect(main.textContent).toContain('Mensaje de conversación 5');
    expect(main.textContent).toContain('Mensaje de conversación 4');
    expect(main.textContent).toContain('Mensaje de conversación 3');
    expect(main.textContent).not.toContain('Mensaje de conversación 2');
  });

  it('continues conversation by navigating to chat', async () => {
    fetchHistory.mockResolvedValue({
      workspace: 'default',
      messages: [
        {
          id: 'hist.default.0.user',
          role: 'user',
          content: 'Seguimiento del cliente',
          createdAt: '2026-01-01T10:00:00.000Z',
        },
      ],
      canCorrect: false,
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    const continueButton = main.querySelector('.home-continue-item__action') as HTMLButtonElement;
    continueButton.click();

    expect(getState().route).toBe('/chat');
  });

  it('shows history error and retries', async () => {
    fetchHistory.mockRejectedValueOnce(new Error('network'));
    fetchHistory.mockResolvedValueOnce({
      workspace: 'default',
      messages: [
        {
          id: 'hist.default.0.user',
          role: 'user',
          content: 'Consulta recuperada',
          createdAt: '2026-01-01T10:00:00.000Z',
        },
      ],
      canCorrect: false,
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    expect(main.textContent).toContain('No pudimos cargar las preguntas de esta sesión');

    const retry = main.querySelector('.home-error .btn--primary') as HTMLButtonElement;
    retry.click();
    await flushHome();

    expect(main.textContent).toContain('Consulta recuperada');
  });

  it('shows empty activity state with CTA', async () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    expect(main.textContent).toContain('Todavía no hay actividad');
    expect(main.textContent).toContain(
      'Cuando empieces a trabajar con ATLAS, aquí podrás ver lo que has hecho recientemente.',
    );
  });

  it('shows activity results', async () => {
    fetchActivity.mockResolvedValue({
      workspace: 'default',
      scopeNote: 'Nota',
      items: [
        {
          id: '1',
          type: 'conversation',
          title: 'Conversaste con ATLAS',
          occurredAt: '2026-01-01T00:00:00.000Z',
          workspace: 'default',
          workspaceName: 'General',
          status: 'success',
          quote: '¿Qué sabes sobre este cliente?',
        },
      ],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    expect(main.textContent).toContain('Actividad reciente · Esta sesión');
    expect(main.textContent).toContain('¿Qué sabes sobre este cliente?');
  });

  it('shows activity error and retries', async () => {
    fetchActivity.mockRejectedValueOnce(new Error('network'));
    fetchActivity.mockResolvedValueOnce({
      workspace: 'default',
      scopeNote: 'Nota',
      items: [
        {
          id: '1',
          type: 'knowledge',
          title: 'Consultaste conocimiento',
          occurredAt: '2026-01-01T00:00:00.000Z',
          workspace: 'default',
          workspaceName: 'General',
          status: 'info',
        },
      ],
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);
    await flushHome();

    expect(main.textContent).toContain('No pudimos cargar tu actividad');

    const retryButtons = main.querySelectorAll('.home-error .btn--primary');
    const activityRetry = retryButtons[retryButtons.length - 1] as HTMLButtonElement;
    activityRetry.click();
    await flushHome();

    expect(main.textContent).toContain('Consultaste conocimiento');
  });

  it('keeps responsive structure classes', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);

    expect(main.querySelector('.home-page')).not.toBeNull();
    expect(main.querySelector('.home-primary')).not.toBeNull();
    expect(main.querySelector('.home-secondary')).not.toBeNull();
    expect(main.querySelector('.home-section--continue')).not.toBeNull();
    expect(main.querySelector('.home-section--examples')).not.toBeNull();
    expect(main.querySelector('.home-section--activity')).not.toBeNull();
    expect(main.querySelector('.home-alert')).not.toBeNull();
  });

  it('shows isolation note without chat banner class', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);

    expect(main.querySelector('.banner')).toBeNull();
    expect(main.textContent).toContain('aislamiento total por marca');
  });

  it('does not regress brand selector shell rendering', () => {
    const root = document.createElement('div');
    renderShell(root);

    expect(root.querySelector('#header-brand-switcher')).not.toBeNull();
    expect(root.querySelector('#brand-switcher-trigger')).not.toBeNull();
  });

  it('primary chat CTA navigates to chat', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);

    (main.querySelector('#home-primary-chat') as HTMLButtonElement).click();
    expect(getState().route).toBe('/chat');
  });

  it('knowledge CTA navigates to conocimiento', () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);

    (main.querySelector('#home-knowledge-cta') as HTMLButtonElement).click();
    expect(getState().route).toBe('/conocimiento');
  });

  it('clears stale draft only through official chat flow', () => {
    setPendingChatDraft('borrador previo');
    const main = document.querySelector('#main') as HTMLElement;
    renderHome(main);

    (main.querySelector('.example-chip') as HTMLButtonElement).click();
    expect(getState().pendingChatDraft).toBe('¿Qué sabes sobre este cliente?');
  });
});
