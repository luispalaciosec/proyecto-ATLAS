import { describe, expect, it } from 'vitest';

import { t, workspaceDisplayName } from '../../src/i18n/index.js';

describe('i18n', () => {
  it('returns Spanish navigation labels', () => {
    expect(t('nav.home')).toBe('Inicio');
    expect(t('nav.chat')).toBe('Conversación');
    expect(t('nav.knowledge')).toBe('Conocimiento');
  });

  it('interpolates working context placeholders', () => {
    expect(t('workspace.workingWith', { name: 'Geeks' })).toBe('Trabajando con Geeks');
    expect(t('workspace.workingIn', { name: 'General' })).toBe('Trabajando en General');
  });

  it('maps default workspace to General', () => {
    expect(workspaceDisplayName('default')).toBe('General');
    expect(workspaceDisplayName('geeks')).toBe('Geeks');
  });
});
