import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  createStoredKnowledgeFolder,
  listStoredKnowledgeFolders,
  mergeKnowledgeFolderLists,
  registerKnowledgeFolderIfMissing,
} from '../../src/lib/knowledge-upload/knowledge-folders-store.js';

describe('knowledge-folders-store', () => {
  it('creates and lists folders per workspace', () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-knowledge-folders-'));
    const previous = process.cwd();

    try {
      process.chdir(root);
      mkdirSync(join(root, '.atlas'), { recursive: true });

      expect(listStoredKnowledgeFolders(undefined)).toEqual(['General']);
      expect(createStoredKnowledgeFolder(undefined, 'Comercial')).toEqual(['General', 'Comercial']);
      expect(listStoredKnowledgeFolders(undefined)).toEqual(['General', 'Comercial']);
    } finally {
      process.chdir(previous);
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('registers folders without duplicating', () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-knowledge-folders-'));
    const previous = process.cwd();

    try {
      process.chdir(root);
      mkdirSync(join(root, '.atlas', 'workspaces', 'geeks'), { recursive: true });
      writeFileSync(join(root, '.atlas', 'workspaces', 'geeks', 'memory.json'), '{}', 'utf8');

      expect(registerKnowledgeFolderIfMissing('geeks', 'Legal')).toEqual(['General', 'Legal']);
      expect(registerKnowledgeFolderIfMissing('geeks', 'Legal')).toEqual(['General', 'Legal']);
    } finally {
      process.chdir(previous);
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('merges stored and document folders', () => {
    expect(mergeKnowledgeFolderLists(['General', 'Comercial'], ['General', 'Legal'])).toEqual([
      'General',
      'Comercial',
      'Legal',
    ]);
  });
});
