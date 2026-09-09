import { describe, expect, it } from 'vitest';

import {
  findKnowledgeDuplicateMatch,
  normalizeKnowledgeFileBase,
} from '../../src/client/lib/knowledge-duplicate-file-name.js';

describe('normalizeKnowledgeFileBase', () => {
  it('strips version suffixes and years from comparable bases', () => {
    expect(normalizeKnowledgeFileBase('lista_precios_2025.pdf')).toBe('lista precios');
    expect(normalizeKnowledgeFileBase('lista_precios_2024.pdf')).toBe('lista precios');
    expect(normalizeKnowledgeFileBase('politica_vacaciones_v2.docx')).toBe('politica vacaciones');
    expect(normalizeKnowledgeFileBase('politica_vacaciones_v1.docx')).toBe('politica vacaciones');
  });
});

describe('findKnowledgeDuplicateMatch', () => {
  const documents = [
    { fileName: 'lista_precios_2024.pdf', folder: 'General', chunks: 3 },
    { fileName: 'manual.txt', folder: 'General', chunks: 1 },
    { fileName: 'manual.txt', folder: 'Comercial', chunks: 2 },
  ];

  it('returns undefined for a new file name', () => {
    expect(
      findKnowledgeDuplicateMatch('nuevo-documento.pdf', documents, 'General'),
    ).toBeUndefined();
  });

  it('detects an exact duplicate in the same folder', () => {
    expect(findKnowledgeDuplicateMatch('manual.txt', documents, 'General')).toEqual({
      kind: 'exact',
      existingFileName: 'manual.txt',
      chunks: 1,
    });
  });

  it('detects a similar duplicate when only the year changes', () => {
    expect(findKnowledgeDuplicateMatch('lista_precios_2025.pdf', documents, 'General')).toEqual({
      kind: 'similar',
      existingFileName: 'lista_precios_2024.pdf',
      chunks: 3,
    });
  });

  it('does not match the same file name in a different folder', () => {
    expect(findKnowledgeDuplicateMatch('manual.txt', documents, 'Comercial')).toEqual({
      kind: 'exact',
      existingFileName: 'manual.txt',
      chunks: 2,
    });
    expect(findKnowledgeDuplicateMatch('manual.txt', documents, 'General')).not.toBeUndefined();
  });
});
