/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { formatWorkingContext } from '../../src/client/lib/brand-context.js';
import { formatCorrectionStatus, formatUserError } from '../../src/presentation/format-error.js';
import { t } from '../../src/i18n/index.js';

describe('Phase 3H pilot polish', () => {
  it('uses consistent working context copy for General and brands', () => {
    expect(formatWorkingContext('default', 'General')).toBe('Trabajando en General');
    expect(formatWorkingContext('geeks', 'Geeks')).toBe('Trabajando con Geeks');
  });

  it('does not expose workspace jargon in primary i18n strings', () => {
    const serialized = JSON.stringify(
      {
        activity: t('activity.subtitle'),
        generalHint: t('workspace.generalHint'),
        homeContinue: t('home.continueTitle'),
        homeActivity: `${t('home.activityTitle')} · ${t('home.activitySessionScope')}`,
      },
      null,
      0,
    ).toLowerCase();

    expect(serialized).not.toContain('workspace');
    expect(serialized).not.toContain('espacio de trabajo');
    expect(serialized).not.toContain('espacio principal');
  });

  it('does not direct users to Configuración for LLM errors', () => {
    const chatError = formatUserError('llm api_key required');
    const correctionError = formatCorrectionStatus('llm_required');

    expect(chatError.message).not.toContain('Configuración');
    expect(correctionError.message).not.toContain('Configuración');
    expect(chatError.message).toContain('instaló ATLAS');
    expect(correctionError.message).toContain('instaló ATLAS');
  });

  it('describes session-scoped history honestly on Home', () => {
    expect(t('home.continueTitle')).toContain('sesión');
    expect(t('home.continueEmptyBody')).toContain('mientras la aplicación siga abierta');
    expect(t('home.historySessionNote')).toContain('ATLAS Web');
  });

  it('describes session-scoped activity on Home', () => {
    expect(t('home.activitySessionScope')).toBe('Esta sesión');
    expect(t('workspace.sessionScopeNote')).toContain('ATLAS Web');
  });

  it('includes reduced-motion handling in styles', () => {
    const tokens = readFileSync(
      resolve(process.cwd(), 'src/client/styles/tokens.css'),
      'utf8',
    );
    const appStyles = readFileSync(resolve(process.cwd(), 'src/client/styles/app.css'), 'utf8');

    expect(tokens).toContain('prefers-reduced-motion: reduce');
    expect(appStyles).toContain('prefers-reduced-motion: reduce');
    expect(appStyles).toContain('.brand-card--skeleton');
  });
});
