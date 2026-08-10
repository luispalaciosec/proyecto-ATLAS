/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest';

import { renderShell, bindShellEvents, updateShellChrome } from '../../src/client/components/shell.js';
import {
  applyBrandCatalog,
  getState,
  setActiveWorkspace,
} from '../../src/client/state/app-state.js';

describe('renderShell brand switcher', () => {
  let root: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    root = document.querySelector('#app') as HTMLElement;
    setActiveWorkspace('default', { resetChat: true });
    applyBrandCatalog({
      activeBrandId: 'default',
      brands: [
        {
          id: 'default',
          name: 'General',
          description: 'Información general',
          isGeneral: true,
          isActive: true,
        },
        {
          id: 'geeks',
          name: 'Geeks',
          description: 'Agencia de marketing',
          isGeneral: false,
          isActive: false,
        },
      ],
    });
  });

  it('renders brand switcher without create controls', () => {
    const elements = renderShell(root);

    expect(root.querySelector('#brand-switcher-trigger')).not.toBeNull();
    expect(root.querySelector('#workspace-new')).toBeNull();
    expect(root.querySelector('#workspace-use')).toBeNull();
    expect(root.querySelector('#workspace-select')).toBeNull();
    expect(elements.brandSwitcherPanel.getAttribute('role')).toBe('listbox');
  });

  it('shows human brand names from catalog', () => {
    const elements = renderShell(root);
    updateShellChrome(elements);

    expect(root.textContent).toContain('Marca');
    expect(root.textContent).toContain('General');
    expect(root.textContent).not.toContain('default');
    expect(root.textContent).not.toContain('workspace');
  });

  it('lists brands and manage link when opened', () => {
    const elements = renderShell(root);
    bindShellEvents(elements, {
      onToggleSidebar: () => {},
      onCloseSidebar: () => {},
      onBrandSelect: () => {},
      onManageBrands: () => {},
    });
    updateShellChrome(elements);

    elements.brandSwitcherTrigger.click();

    expect(elements.brandSwitcherPanel.hidden).toBe(false);
    expect(elements.brandSwitcherPanel.textContent).toContain('Geeks');
    expect(elements.brandSwitcherPanel.textContent).toContain('Ver todas las marcas');
  });
});

describe('applyBrandCatalog', () => {
  beforeEach(() => {
    setActiveWorkspace('missing-brand', { resetChat: true });
  });

  it('falls back to General when stored brand is invalid', () => {
    applyBrandCatalog({
      activeBrandId: 'default',
      brands: [
        {
          id: 'default',
          name: 'General',
          isGeneral: true,
          isActive: true,
        },
      ],
    });

    expect(getState().activeWorkspace).toBe('default');
  });
});
