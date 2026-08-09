/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest';

import { renderShell } from '../../src/client/components/shell.js';

describe('renderShell', () => {
  let root: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
    root = document.querySelector('#app') as HTMLElement;
  });

  it('renders header, sidebar navigation and main area', () => {
    const elements = renderShell(root);

    expect(root.querySelector('.shell__header')).not.toBeNull();
    expect(root.querySelector('#sidebar')?.querySelectorAll('a').length).toBeGreaterThan(3);
    expect(elements.main.id).toBe('main');
    expect(elements.brandSwitcherTrigger).toBeInstanceOf(HTMLButtonElement);
  });

  it('uses Spanish labels in navigation', () => {
    renderShell(root);

    const labels = [...root.querySelectorAll('#sidebar a')].map((link) => link.textContent);
    expect(labels).toContain('Inicio');
    expect(labels).toContain('Conversación');
    expect(labels).toContain('Conocimiento');
    expect(labels).toContain('Actividad');
    expect(labels).not.toContain('workspace');
  });
});
