import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createFakeLlmProvider } from '@atlas/llm';
import { describe, expect, it, vi } from 'vitest';

import { createArtifact, createAtlas, planExecuteAndRemember } from '../src/index.js';
import { searchContentViaRetrieval } from '../src/retrieval/retrieval-content-search.js';

function createTestAtlas(storageFilePath: string) {
  return createAtlas({
    memory: { storageFilePath },
    compiler: {
      generators: () => [
        {
          id: 'summary-generator',
          supported_formats: ['summary'],
          generate: (graph) => [
            createArtifact({
              id: 'artifact.retrieval-unification',
              kind: 'summary',
              content: { nodes: graph.nodes.length },
              source_graph_id: graph.id,
            }),
          ],
        },
      ],
    },
  });
}

describe('INT-001 retrieval unification', () => {
  it('INT-001-A: LLM prefetch and RetrievalModule.searchContent return the same recordIds', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int001-a-'));
    const atlas = createTestAtlas(join(dir, 'memory.json'));

    const stored = await atlas.memory.storeContent({
      content: 'Manual de descuento VIP para clientes estrategicos',
      recordType: 'document',
    });

    const direct = await atlas.retrieval.searchContent({ query: 'descuento VIP' });

    const prefetchViaHelper = await searchContentViaRetrieval(atlas.memory.getEngine(), {
      query: 'descuento VIP',
    });

    expect(direct.records.map((record) => record.id)).toEqual(
      prefetchViaHelper.records.map((record) => record.id),
    );
    expect(direct.records[0]?.id).toBe(stored.recordId);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-001-B: Web searchKnowledge uses RetrievalModule.searchContent', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');

    const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
    const source = readFileSync(join(repoRoot, 'apps/web/src/session-store.ts'), 'utf8');

    expect(source).toContain('client.retrieval.searchContent');
    expect(source).not.toMatch(
      /searchKnowledge[\s\S]*client\.memory\.searchContent\(\{\s*query:\s*trimmedQuery/,
    );
  });

  it('INT-001-C: memory_search tool uses RetrievalModule.searchContent', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int001-c-'));

    const fake = createFakeLlmProvider([
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_search',
              name: 'memory_search',
              arguments: Object.freeze({ query: 'pedido' }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({ role: 'assistant' as const, content: 'Found it.' }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    const llmAtlas = createAtlas({
      memory: { storageFilePath: join(dir, 'memory.json') },
      llm: { provider: fake },
    });
    const llmSearchSpy = vi.spyOn(llmAtlas.retrieval, 'searchContent');

    await llmAtlas.memory.storeContent({ content: 'pedido cliente estrategico' });
    await llmAtlas.llm.ask('buscar pedido');

    expect(llmSearchSpy).toHaveBeenCalledWith(expect.objectContaining({ query: 'pedido' }));

    llmSearchSpy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-001-D: plan_and_execute continues to retrieve prior executions', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int001-d-'));
    const atlas = createTestAtlas(join(dir, 'memory.json'));

    await planExecuteAndRemember(atlas, 'procesar pedido cliente');
    const second = await planExecuteAndRemember(atlas, 'procesar pedido urgente');

    expect(second.retrieval.context.items.length).toBeGreaterThan(0);
    expect(
      second.retrieval.context.items.some((item) => item.text.includes('procesar pedido')),
    ).toBe(true);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-001-E: brand isolation remains intact for retrieval search', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int001-e-'));
    const geeksPath = join(dir, 'geeks-memory.json');
    const revitalPath = join(dir, 'revital-memory.json');

    const geeks = createTestAtlas(geeksPath);
    const revital = createTestAtlas(revitalPath);

    await geeks.memory.storeContent({ content: 'geeks-only-secret retrieval marker' });

    const cross = await revital.retrieval.searchContent({ query: 'geeks-only-secret' });
    const local = await geeks.retrieval.searchContent({ query: 'geeks-only-secret' });

    expect(cross.total).toBe(0);
    expect(local.total).toBe(1);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-001-F: knowledge documents remain discoverable via retrieval search', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int001-f-'));
    const atlas = createTestAtlas(join(dir, 'memory.json'));

    await atlas.memory.storeContent({
      content: 'Contenido PDF sobre garantias extendidas del producto',
      recordType: 'document',
      metadata: Object.freeze({
        source: 'upload',
        fileName: 'garantias.pdf',
        fileType: 'pdf',
      }),
    });

    await atlas.memory.storeContent({
      content: 'Hoja Ventas | fila 1 | descuento comercial 15%',
      recordType: 'document',
      metadata: Object.freeze({
        source: 'upload',
        fileName: 'ventas.xlsx',
        fileType: 'xlsx',
        sheetName: 'Ventas',
      }),
    });

    const pdfSearch = await atlas.retrieval.searchContent({ query: 'garantias extendidas' });
    const excelSearch = await atlas.retrieval.searchContent({ query: 'descuento comercial' });

    expect(pdfSearch.total).toBe(1);
    expect(pdfSearch.records[0]?.metadata?.fileName).toBe('garantias.pdf');
    expect(excelSearch.total).toBe(1);
    expect(excelSearch.records[0]?.metadata?.sheetName).toBe('Ventas');

    rmSync(dir, { recursive: true, force: true });
  });

  it('returns zero results for unmatched queries instead of fallback-ranked records', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int001-zero-'));
    const atlas = createTestAtlas(join(dir, 'memory.json'));

    await atlas.memory.storeContent({ content: 'alpha content only' });
    const search = await atlas.retrieval.searchContent({ query: 'terminoinexistente999' });

    expect(search.total).toBe(0);
    expect(search.records).toHaveLength(0);

    rmSync(dir, { recursive: true, force: true });
  });
});

describe('INT-002 list path (replaces searchContent empty query)', () => {
  it('listRecords({ recordType: "document" }) lists documents without search', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int002-list-'));
    const atlas = createTestAtlas(join(dir, 'memory.json'));

    await atlas.memory.storeContent({ content: 'doc one', recordType: 'document' });
    await atlas.memory.storeContent({ content: 'note two', recordType: 'CliMemory' });

    const listed = await atlas.memory.listRecords({ recordType: 'document' });

    expect(listed.total).toBe(1);
    expect(listed.records[0]?.type).toBe('document');

    rmSync(dir, { recursive: true, force: true });
  });
});
