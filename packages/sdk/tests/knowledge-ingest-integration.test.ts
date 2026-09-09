import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { KNOWLEDGE_OBJECT_RECORD_TYPE } from '@atlas/knowledge';
import { describe, expect, it, vi } from 'vitest';

import {
  createAtlas,
  isDocumentChunkRecord,
  isKnowledgeObjectRecord,
  prepareIngestedDocumentKnowledge,
  readKnowledgeObjectId,
  storeIngestedDocumentChunk,
  storeIngestedDocumentKnowledgeObject,
} from '../src/index.js';
import * as retrievalContentSearch from '../src/retrieval/retrieval-content-search.js';

const UPLOADED_AT = '2026-09-08T12:00:00.000Z';

function createIngestAtlas(storageFilePath: string, workspace = 'default') {
  return createAtlas({
    workspace: { name: workspace },
    memory: { storageFilePath },
  });
}

async function ingestSampleDocument(
  atlas: ReturnType<typeof createAtlas>,
  params: {
    documentId: string;
    fileName: string;
    fileType: string;
    content: string;
    workspace?: string;
  },
) {
  const ingest = prepareIngestedDocumentKnowledge({
    documentId: params.documentId,
    fileName: params.fileName,
    fileType: params.fileType,
    folder: 'General',
    workspace: params.workspace ?? 'default',
    uploadedAt: UPLOADED_AT,
  });

  await storeIngestedDocumentKnowledgeObject(atlas.memory, ingest);

  const chunk = await storeIngestedDocumentChunk(atlas.memory, {
    ingest,
    content: params.content,
    chunk: { chunkIndex: 0, totalChunks: 1 },
  });

  return { ingest, chunk };
}

describe('INT-003 knowledge ingest integration', () => {
  it('INT-003-A: ingested document creates and associates a KnowledgeObject', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int003-a-'));
    const atlas = createIngestAtlas(join(dir, 'memory.json'));

    const { ingest, chunk } = await ingestSampleDocument(atlas, {
      documentId: 'doc.int003.a',
      fileName: 'policy.txt',
      fileType: 'txt',
      content: 'Politica INT-003 alpha contenido trazable',
    });

    const records = await atlas.memory.listRecords();
    const knowledgeObjectRecord = records.records.find((record) => isKnowledgeObjectRecord(record));

    expect(knowledgeObjectRecord).toBeDefined();
    expect(knowledgeObjectRecord?.type).toBe(KNOWLEDGE_OBJECT_RECORD_TYPE);
    expect(readKnowledgeObjectId(knowledgeObjectRecord!)).toBe(ingest.knowledgeObjectId);
    expect(readKnowledgeObjectId(chunk.record)).toBe(ingest.knowledgeObjectId);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-003-B: ingestion chunks keep a traceable parent KnowledgeObject reference', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int003-b-'));
    const atlas = createIngestAtlas(join(dir, 'memory.json'));

    const { ingest } = await ingestSampleDocument(atlas, {
      documentId: 'doc.int003.b',
      fileName: 'chunked.md',
      fileType: 'md',
      content: 'Fragmento INT-003 beta trazable',
    });

    const listed = await atlas.memory.listRecords({ recordType: 'document' });
    const chunkRecord = listed.records[0];

    expect(chunkRecord).toBeDefined();
    expect(isDocumentChunkRecord(chunkRecord!)).toBe(true);
    expect(chunkRecord?.metadata.knowledgeObjectId).toBe(ingest.knowledgeObjectId);
    expect(chunkRecord?.metadata.documentId).toBe(ingest.provenance.documentId);
    expect(chunkRecord?.metadata.recordRole).toBe('document-chunk');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-003-C: metadata identifies file, origin, and workspace', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int003-c-'));
    const atlas = createIngestAtlas(join(dir, 'memory.json'), 'geeks');

    const { chunk } = await ingestSampleDocument(atlas, {
      documentId: 'doc.int003.c',
      fileName: 'manual.pdf',
      fileType: 'pdf',
      content: 'Manual INT-003 gamma',
      workspace: 'geeks',
    });

    expect(chunk.record.metadata.fileName).toBe('manual.pdf');
    expect(chunk.record.metadata.fileType).toBe('pdf');
    expect(chunk.record.metadata.ingestSource).toBe('upload');
    expect(chunk.record.metadata.workspace).toBe('geeks');
    expect(chunk.record.metadata.folder).toBe('General');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-003-D: retrieval still finds ingested content after integration', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int003-d-'));
    const atlas = createIngestAtlas(join(dir, 'memory.json'));

    await ingestSampleDocument(atlas, {
      documentId: 'doc.int003.d',
      fileName: 'searchable.txt',
      fileType: 'txt',
      content: 'termino-retrieval-int003-delta unico',
    });

    const search = await atlas.retrieval.searchContent({
      query: 'termino-retrieval-int003-delta',
    });

    expect(search.total).toBeGreaterThan(0);
    expect(search.records[0]?.metadata.knowledgeObjectId).toBe('doc.int003.d');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-003-E: brand/workspace isolation remains intact for ingested knowledge', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int003-e-'));
    const geeks = createIngestAtlas(join(dir, 'geeks.json'), 'geeks');
    const revital = createIngestAtlas(join(dir, 'revital.json'), 'revital');

    await ingestSampleDocument(geeks, {
      documentId: 'doc.int003.geeks',
      fileName: 'geeks-only.txt',
      fileType: 'txt',
      content: 'contenido exclusivo geeks int003',
      workspace: 'geeks',
    });

    const crossSearch = await revital.retrieval.searchContent({
      query: 'contenido exclusivo geeks int003',
    });
    const localSearch = await geeks.retrieval.searchContent({
      query: 'contenido exclusivo geeks int003',
    });

    expect(crossSearch.total).toBe(0);
    expect(localSearch.total).toBeGreaterThan(0);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-003-F: re-ingestion preserves existing semantics without incorrect deduplication', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int003-f-'));
    const atlas = createIngestAtlas(join(dir, 'memory.json'));

    const first = await ingestSampleDocument(atlas, {
      documentId: 'doc.int003.f.1',
      fileName: 'repeat.txt',
      fileType: 'txt',
      content: 'mismo archivo reingestado int003',
    });

    const second = await ingestSampleDocument(atlas, {
      documentId: 'doc.int003.f.2',
      fileName: 'repeat.txt',
      fileType: 'txt',
      content: 'mismo archivo reingestado int003',
    });

    const knowledgeObjects = (await atlas.memory.listRecords()).records.filter((record) =>
      isKnowledgeObjectRecord(record),
    );

    expect(first.ingest.knowledgeObjectId).not.toBe(second.ingest.knowledgeObjectId);
    expect(knowledgeObjects).toHaveLength(2);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-003-G helper: ingest path does not invoke retrieval pipeline during list/store', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int003-g-'));
    const atlas = createIngestAtlas(join(dir, 'memory.json'));
    const pipelineSpy = vi.spyOn(retrievalContentSearch, 'searchContentViaRetrieval');

    await ingestSampleDocument(atlas, {
      documentId: 'doc.int003.g',
      fileName: 'list-only.txt',
      fileType: 'txt',
      content: 'listado sin retrieval int003',
    });

    expect(pipelineSpy).not.toHaveBeenCalled();

    pipelineSpy.mockRestore();
    rmSync(dir, { recursive: true, force: true });
  });
});
