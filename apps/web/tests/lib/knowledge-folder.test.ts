import { describe, expect, it } from 'vitest';

import {
  DEFAULT_KNOWLEDGE_FOLDER,
  assertValidKnowledgeFolder,
  documentFolderMatchesFilter,
  normalizeKnowledgeFolder,
  resolveKnowledgeFolder,
} from '../../src/lib/knowledge-upload/folder.js';

describe('knowledge folder helpers', () => {
  it('normalizes empty values to General', () => {
    expect(normalizeKnowledgeFolder(undefined)).toBe(DEFAULT_KNOWLEDGE_FOLDER);
    expect(normalizeKnowledgeFolder('   ')).toBe(DEFAULT_KNOWLEDGE_FOLDER);
    expect(normalizeKnowledgeFolder(' Comercial ')).toBe('Comercial');
  });

  it('rejects folder names with path separators', () => {
    expect(() => assertValidKnowledgeFolder('Legal/RRHH')).toThrow();
    expect(() => resolveKnowledgeFolder('Legal\\RRHH')).toThrow();
  });

  it('matches folder filters for General and custom folders', () => {
    expect(documentFolderMatchesFilter(undefined, 'all')).toBe(true);
    expect(documentFolderMatchesFilter(undefined, DEFAULT_KNOWLEDGE_FOLDER)).toBe(true);
    expect(documentFolderMatchesFilter('Comercial', 'Comercial')).toBe(true);
    expect(documentFolderMatchesFilter('Comercial', DEFAULT_KNOWLEDGE_FOLDER)).toBe(false);
  });
});
