import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  listWorkspaces,
  loadOrCreateBrandProfile,
  renderProfileAsContext,
  resolveWorkspacePaths,
  sanitizeBrandSlug,
} from '../src/workspace/brand-profile.js';

describe('sanitizeBrandSlug', () => {
  it('accepts simple brand names', () => {
    expect(sanitizeBrandSlug('geeks')).toBe('geeks');
    expect(sanitizeBrandSlug('banco-machala')).toBe('banco-machala');
    expect(sanitizeBrandSlug('Banco Machala')).toBe('banco-machala');
  });

  it('rejects path traversal and empty names', () => {
    expect(() => sanitizeBrandSlug('../etc')).toThrow(/Invalid brand name/i);
    expect(() => sanitizeBrandSlug('geeks/../../x')).toThrow(/Invalid brand name/i);
    expect(() => sanitizeBrandSlug('   ')).toThrow(/must not be empty/i);
    expect(() => sanitizeBrandSlug('!!!')).toThrow(/valid characters/i);
  });
});

describe('resolveWorkspacePaths', () => {
  it('returns distinct paths for different brands', () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-brand-paths-'));
    const geeks = resolveWorkspacePaths('geeks', join(root, 'workspaces'));
    const revital = resolveWorkspacePaths('revital', join(root, 'workspaces'));

    expect(geeks.memoryFilePath).not.toBe(revital.memoryFilePath);
    expect(geeks.directory).not.toBe(revital.directory);

    rmSync(root, { recursive: true, force: true });
  });
});

describe('loadOrCreateBrandProfile', () => {
  it('creates a default profile once and respects manual edits afterward', () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-brand-profile-'));
    const paths = resolveWorkspacePaths('geeks', join(root, 'workspaces'));

    const created = loadOrCreateBrandProfile(paths, 'Geeks');
    expect(created.name).toBe('Geeks');
    expect(existsSync(paths.profilePath)).toBe(true);

    const edited = Object.freeze({
      ...created,
      purpose: 'Electronics retail for enthusiasts',
      tone: 'Expert and friendly',
      rules: Object.freeze(['Always cite stock levels']),
    });
    writeFileSync(paths.profilePath, `${JSON.stringify(edited, null, 2)}\n`, 'utf8');

    const reloaded = loadOrCreateBrandProfile(paths, 'Geeks');
    expect(reloaded.purpose).toBe('Electronics retail for enthusiasts');
    expect(reloaded.rules).toEqual(['Always cite stock levels']);

    rmSync(root, { recursive: true, force: true });
  });
});

describe('renderProfileAsContext', () => {
  it('includes purpose, tone, and rules in the rendered context block', () => {
    const text = renderProfileAsContext(
      Object.freeze({
        name: 'Geeks',
        purpose: 'Electronics retail',
        tone: 'Expert',
        processes: Object.freeze(['Quote', 'Fulfill']),
        clients: Object.freeze(['Retail']),
        rules: Object.freeze(['No discounts without approval']),
        createdAt: '2026-08-05T00:00:00.000Z',
      }),
    );

    expect(text).toContain('Purpose: Electronics retail');
    expect(text).toContain('Tone: Expert');
    expect(text).toContain('No discounts without approval');
  });
});

describe('listWorkspaces', () => {
  it('returns an empty list when the workspaces directory does not exist', () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-list-workspaces-empty-'));

    expect(listWorkspaces(join(root, 'missing-workspaces'))).toEqual([]);

    rmSync(root, { recursive: true, force: true });
  });

  it('returns workspace slugs for existing brand directories', () => {
    const root = mkdtempSync(join(tmpdir(), 'atlas-list-workspaces-'));
    const workspacesRoot = join(root, 'workspaces');

    loadOrCreateBrandProfile(resolveWorkspacePaths('geeks', workspacesRoot), 'Geeks');
    loadOrCreateBrandProfile(resolveWorkspacePaths('revital', workspacesRoot), 'Revital');

    expect(listWorkspaces(workspacesRoot)).toEqual(['geeks', 'revital']);

    rmSync(root, { recursive: true, force: true });
  });
});
