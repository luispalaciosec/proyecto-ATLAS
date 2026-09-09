import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { createAtlas } from '../src/index.js';
import { listRecordsByType } from '../src/org/entity-resolver.js';
import * as retrievalContentSearch from '../src/retrieval/retrieval-content-search.js';

describe('INT-002 memory list vs search separation', () => {
  it('INT-002-A: listRecords({ recordType: "document" }) matches legacy document listing', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int002-a-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    const docA = await atlas.memory.storeContent({
      content: 'Document alpha content',
      recordType: 'document',
      metadata: Object.freeze({ fileName: 'alpha.pdf' }),
    });
    await atlas.memory.storeContent({ content: 'plain note', recordType: 'CliMemory' });
    const docB = await atlas.memory.storeContent({
      content: 'Document beta content',
      recordType: 'document',
      metadata: Object.freeze({ fileName: 'beta.pdf' }),
    });

    const listed = await atlas.memory.listRecords({ recordType: 'document' });
    const legacyCompat = await atlas.memory.searchContent({ query: '', recordType: 'document' });

    expect(listed.total).toBe(2);
    expect(legacyCompat.total).toBe(2);
    expect(listed.records.map((record) => record.id).sort()).toEqual(
      legacyCompat.records.map((record) => record.id).sort(),
    );
    expect(listed.records.map((record) => record.id)).toEqual(
      expect.arrayContaining([docA.recordId, docB.recordId]),
    );

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-002-B: listRecords() preserves general listing used for activity counts', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int002-b-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    await atlas.memory.storeContent({ content: 'one', recordType: 'document' });
    await atlas.memory.storeContent({ content: 'two', recordType: 'CliMemory' });
    await atlas.memory.storeContent({ content: 'three', recordType: 'PlanExecution' });

    const listed = await atlas.memory.listRecords();
    const legacyCompat = await atlas.memory.searchContent({ query: '' });

    expect(listed.total).toBe(3);
    expect(legacyCompat.total).toBe(3);
    expect(listed.records.map((record) => record.id).sort()).toEqual(
      legacyCompat.records.map((record) => record.id).sort(),
    );

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-002-C: listRecords does not use RetrievalModule or retrieval pipeline', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int002-c-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    await atlas.memory.storeContent({ content: 'listed item', recordType: 'document' });

    const retrievalSpy = vi.spyOn(atlas.retrieval, 'searchContent');
    const pipelineSpy = vi.spyOn(retrievalContentSearch, 'searchContentViaRetrieval');

    const listed = await atlas.memory.listRecords({ recordType: 'document' });

    expect(listed.total).toBe(1);
    expect(retrievalSpy).not.toHaveBeenCalled();
    expect(pipelineSpy).not.toHaveBeenCalled();

    retrievalSpy.mockRestore();
    pipelineSpy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-002-D: brand/workspace isolation remains intact for listRecords', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int002-d-'));
    const geeks = createAtlas({ memory: { storageFilePath: join(dir, 'geeks.json') } });
    const revital = createAtlas({ memory: { storageFilePath: join(dir, 'revital.json') } });

    await geeks.memory.storeContent({ content: 'geeks-only-list-marker', recordType: 'document' });

    const cross = await revital.memory.listRecords({ recordType: 'document' });
    const local = await geeks.memory.listRecords({ recordType: 'document' });

    expect(cross.total).toBe(0);
    expect(local.total).toBe(1);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-002-E: entity-resolver listRecordsByType continues to work', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int002-e-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    await atlas.org.storeEntity(
      'Client',
      'record.client.test',
      Object.freeze({
        legalName: 'Test Client S.A.',
        segment: 'VIP',
        renewalActive: true,
      }),
    );

    const clients = await listRecordsByType(atlas, 'Client');

    expect(clients).toHaveLength(1);
    expect(clients[0]?.type).toBe('Client');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-002-F: searchContent({ query: "texto real" }) still delegates to retrieval', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int002-f-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    await atlas.memory.storeContent({ content: 'texto real de prueba en memoria' });

    const pipelineSpy = vi.spyOn(retrievalContentSearch, 'searchContentViaRetrieval');
    const search = await atlas.memory.searchContent({ query: 'texto real' });

    expect(search.total).toBe(1);
    expect(pipelineSpy).toHaveBeenCalled();

    pipelineSpy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-002-G: product sources do not use searchContent empty query for listing', async () => {
    const { readFileSync } = await import('node:fs');
    const { join: joinPath } = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
    const productSources = [
      'apps/web/src/session-store.ts',
      'packages/sdk/src/org/entity-resolver.ts',
      'packages/cli/src/workspace/feedback-context.ts',
    ] as const;

    for (const relativePath of productSources) {
      const source = readFileSync(joinPath(repoRoot, relativePath), 'utf8');
      expect(source).not.toMatch(/searchContent\(\{\s*query:\s*['"]{2}/);
    }
  });
});
