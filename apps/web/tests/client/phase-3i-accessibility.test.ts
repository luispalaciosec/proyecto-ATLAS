/**
 * @vitest-environment jsdom
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  bindShellEvents,
  renderShell,
  teardownShellEvents,
  updateShellChrome,
} from '../../src/client/components/shell.js';
import { mountDialogRoot } from '../../src/client/lib/dialog.js';
import { appendExpandableDetails } from '../../src/client/lib/expandable-details.js';
import { renderChat } from '../../src/client/pages/chat.js';
import '../../src/client/styles/app.css';
import {
  applyBrandCatalog,
  getState,
  patchState,
  setActiveWorkspace,
} from '../../src/client/state/app-state.js';

const stylesDir = join(dirname(fileURLToPath(import.meta.url)), '../../src/client/styles');
const appCssSource = readFileSync(join(stylesDir, 'app.css'), 'utf8');
const tokensCssSource = readFileSync(join(stylesDir, 'tokens.css'), 'utf8');

function mockMobileShell(): void {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('899px'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as typeof window.matchMedia;
}

describe('Phase 3I accessibility', () => {
  beforeEach(() => {
    teardownShellEvents();
    document.body.innerHTML = '<div id="app"></div>';
    setActiveWorkspace('default', { resetChat: true });
    applyBrandCatalog({
      activeBrandId: 'default',
      brands: [
        { id: 'default', name: 'General', isGeneral: true, isActive: true },
        { id: 'geeks', name: 'Geeks', isGeneral: false, isActive: false },
      ],
    });
  });

  afterEach(() => {
    teardownShellEvents();
  });

  it('3I-P0-01: mobile drawer keeps main visible and uses backdrop + inert', () => {
    mockMobileShell();
    const root = document.querySelector('#app') as HTMLElement;
    const elements = renderShell(root);

    bindShellEvents(elements, {
      onToggleSidebar: () => patchState({ sidebarOpen: !getState().sidebarOpen }),
      onCloseSidebar: () => patchState({ sidebarOpen: false }),
      onBrandSelect: () => {},
      onManageBrands: () => {},
    });

    patchState({ sidebarOpen: true });
    updateShellChrome(elements, { onCloseSidebar: () => patchState({ sidebarOpen: false }) });

    expect(elements.main.style.display).not.toBe('none');
    expect(elements.sidebarBackdrop.hidden).toBe(false);
    expect(elements.shellBody.inert).toBe(false);
    expect(elements.main.inert).toBe(true);
  });

  it('3I-P0-01 / 3I-P1-02: Escape closes mobile drawer and returns focus to menu toggle', () => {
    mockMobileShell();
    const root = document.querySelector('#app') as HTMLElement;
    const elements = renderShell(root);

    bindShellEvents(elements, {
      onToggleSidebar: () => patchState({ sidebarOpen: !getState().sidebarOpen }),
      onCloseSidebar: () => patchState({ sidebarOpen: false }),
      onBrandSelect: () => {},
      onManageBrands: () => {},
    });

    patchState({ sidebarOpen: true });
    updateShellChrome(elements, { onCloseSidebar: () => patchState({ sidebarOpen: false }) });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(getState().sidebarOpen).toBe(false);
    expect(document.activeElement).toBe(elements.menuToggle);
  });

  it('3I-P1-01: listbox supports ArrowDown navigation', () => {
    const root = document.querySelector('#app') as HTMLElement;
    const elements = renderShell(root);

    bindShellEvents(elements, {
      onToggleSidebar: () => {},
      onCloseSidebar: () => {},
      onBrandSelect: () => {},
      onManageBrands: () => {},
    });
    updateShellChrome(elements);

    elements.brandSwitcherTrigger.click();
    const options = [...elements.brandSwitcherPanel.querySelectorAll<HTMLButtonElement>('.brand-switcher__option')];
    options[0]?.focus();

    elements.brandSwitcherPanel.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );

    expect(document.activeElement).toBe(options[1]);
  });

  it('3I-P1-03: chat thread is not a live region', () => {
    const main = document.createElement('main');
    renderChat(main);

    const thread = main.querySelector('#chat-thread') as HTMLElement;
    expect(thread.getAttribute('aria-live')).toBeNull();
  });

  it('3I-P1-04 / 3I-P1-10 / 3I-P1-11: mountDialogRoot sets inert and restores focus', async () => {
    const root = document.querySelector('#app') as HTMLElement;
    const elements = renderShell(root);
    const shellBody = elements.shellBody;
    const restoreTarget = elements.menuToggle;
    restoreTarget.focus();

    const backdrop = document.createElement('div');
    backdrop.className = 'dialog-backdrop';
    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Cerrar';
    dialog.append(button);
    backdrop.append(dialog);

    const unmount = mountDialogRoot(elements.dialogRoot, backdrop, {
      restoreFocusTo: restoreTarget,
      inertTarget: shellBody,
      initialFocus: button,
    });

    expect(shellBody.inert).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(button);

    unmount();

    expect(shellBody.inert).toBe(false);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(document.activeElement).toBe(restoreTarget);
    expect(elements.dialogRoot.childNodes.length).toBe(0);
  });

  it('3I-P1-06: correction panel exposes an accessible label', () => {
    const main = document.createElement('main');
    renderChat(main);

    const label = main.querySelector('label[for="correction-input"]');
    expect(label?.textContent).toContain('ATLAS');
  });

  it('3I-P1-07: expandable details toggle exposes aria-expanded', () => {
    const panel = document.createElement('div');
    appendExpandableDetails(panel, 'detalle técnico');

    const button = panel.querySelector('button');
    const details = panel.querySelector('pre');

    expect(button?.getAttribute('aria-expanded')).toBe('false');
    expect(button?.getAttribute('aria-controls')).toBe(details?.id);

    button?.click();
    expect(button?.getAttribute('aria-expanded')).toBe('true');
  });

  it('3I-P1-09: action card CTA meets 44px touch target', () => {
    expect(appCssSource).toMatch(/\.action-card__cta[\s\S]*?min-height:\s*44px/);
  });

  it('3I-P1-08: border token override improves contrast variable', () => {
    expect(tokensCssSource).toMatch(/--color-border:\s*#334155;/);
  });
});
