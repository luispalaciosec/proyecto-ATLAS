/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderShell } from '../../src/client/components/shell.js';
import { bindWorkspaceSwitch, switchWorkspace } from '../../src/client/lib/workspace-switch.js';
import {
  applyBrandCatalog,
  getState,
  setActiveWorkspace,
  setPendingChatDraft,
  setRoute,
} from '../../src/client/state/app-state.js';

const reloadChatHistory = vi.fn(async () => {});

vi.mock('../../src/client/pages/chat.js', () => ({
  renderChat: vi.fn(),
  reloadChatHistory: () => reloadChatHistory(),
}));

describe('switchWorkspace', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    const root = document.querySelector('#app') as HTMLElement;
    const elements = renderShell(root);
    bindWorkspaceSwitch(elements, () => {});
    setRoute('/conocimiento');
    setActiveWorkspace('default', { resetChat: true });
    applyBrandCatalog({
      activeBrandId: 'default',
      brands: [
        { id: 'default', name: 'General', isGeneral: true, isActive: true },
        { id: 'geeks', name: 'Geeks', isGeneral: false, isActive: false },
      ],
    });
    reloadChatHistory.mockClear();
  });

  it('switches without confirmation when no draft exists', async () => {
    await switchWorkspace('geeks');

    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(getState().activeWorkspace).toBe('geeks');
    expect(getState().route).toBe('/conocimiento');
    expect(getState().statusText).toContain('Geeks');
  });

  it('shows accessible confirmation when a draft exists', async () => {
    setPendingChatDraft('mensaje pendiente');

    const confirmPromise = switchWorkspace('geeks');
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.textContent).toContain('Vas a cambiar de marca');
    expect(dialog.textContent).toContain('mensaje sin enviar');

    dialog.querySelector('.btn--primary')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await confirmPromise;

    expect(getState().activeWorkspace).toBe('geeks');
    expect(getState().pendingChatDraft).toBeUndefined();
  });

  it('cancels switch without changing active brand when draft exists', async () => {
    setPendingChatDraft('borrador');

    const root = document.querySelector('#app') as HTMLElement;
    const elements = renderShell(root);
    bindWorkspaceSwitch(elements, () => {});
    elements.brandSwitcherTrigger.focus();

    const confirmPromise = switchWorkspace('geeks');
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    dialog.querySelector('.btn--ghost')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await confirmPromise;

    expect(getState().activeWorkspace).toBe('default');
    expect(getState().pendingChatDraft).toBe('borrador');
    expect(document.activeElement).toBe(elements.brandSwitcherTrigger);
  });

  it('clears pending draft after confirmed switch with draft', async () => {
    setPendingChatDraft('mensaje pendiente');

    const confirmPromise = switchWorkspace('geeks');
    const dialog = document.querySelector('[role="dialog"]') as HTMLElement;
    dialog.querySelector('.btn--primary')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await confirmPromise;

    expect(getState().pendingChatDraft).toBeUndefined();
  });

  it('skips confirmation when requested explicitly', async () => {
    await switchWorkspace('geeks', { skipConfirm: true });
    expect(getState().activeWorkspace).toBe('geeks');
    expect(document.querySelector('[role="dialog"]')).toBeNull();
  });
});
