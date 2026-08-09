/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it } from 'vitest';

import {
  appendChatMessage,
  getState,
  normalizeRoute,
  setActiveWorkspace,
  setRoute,
} from '../../src/client/state/app-state.js';

describe('app-state', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
    setActiveWorkspace('default', { resetChat: true });
    setRoute('/');
  });

  it('normalizes known routes', () => {
    expect(normalizeRoute('/chat')).toBe('/chat');
    expect(normalizeRoute('/memoria')).toBe('/conocimiento');
    expect(normalizeRoute('/conocimiento')).toBe('/conocimiento');
    expect(normalizeRoute('/actividad')).toBe('/actividad');
    expect(normalizeRoute('/unknown')).toBe('/');
  });

  it('resets chat when switching workspace', () => {
    appendChatMessage({ id: '1', kind: 'user', text: 'Hola' });
    expect(getState().chatMessages).toHaveLength(1);

    setActiveWorkspace('geeks', { resetChat: true });

    expect(getState().activeWorkspace).toBe('geeks');
    expect(getState().chatMessages).toHaveLength(0);
  });

  it('updates route without full reload', () => {
    setRoute('/chat');

    expect(getState().route).toBe('/chat');
    expect(window.location.pathname).toBe('/chat');
  });
});
