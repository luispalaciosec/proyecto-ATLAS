import { describe, expect, it } from 'vitest';

import { foldDiacritics, normalizeForSearch } from '../src/text/fold-diacritics.js';

describe('foldDiacritics', () => {
  it('folds Spanish accents for equivalent matching', () => {
    expect(foldDiacritics('García')).toBe('Garcia');
    expect(foldDiacritics('entrega el lunes')).toBe('entrega el lunes');
    expect(foldDiacritics('mañana')).toBe('manana');
  });

  it('leaves ASCII text unchanged', () => {
    expect(foldDiacritics('Ana Garcia')).toBe('Ana Garcia');
  });
});

describe('normalizeForSearch', () => {
  it('folds and lowercases for search comparisons', () => {
    expect(normalizeForSearch('Ana García')).toBe('ana garcia');
    expect(normalizeForSearch('GARCIA')).toBe('garcia');
  });
});
