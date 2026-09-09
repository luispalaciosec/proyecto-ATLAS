import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('pdf-parse', () => ({
  PDFParse: vi.fn().mockImplementation(() => ({
    getText: vi.fn(async () => ({ text: 'PDF INT003-G zeta-quantum-7742 contenido extraido' })),
    destroy: vi.fn(async () => undefined),
  })),
}));

import { SessionStore } from '../src/session-store.js';
import {
  createDocxFixture,
  createPptxFixture,
  createXlsxFixture,
  readFixture,
} from './fixtures/fixture-utils.js';

const KEYWORD = 'zeta-quantum-7742';

describe('INT-003-G knowledge ingest formats', () => {
  const savedCwd = process.cwd();
  let testRoot = '';

  beforeEach(() => {
    testRoot = mkdtempSync(join(tmpdir(), 'atlas-web-int003-g-'));
    process.chdir(testRoot);
    mkdirSync(join(testRoot, '.atlas', 'workspaces'), { recursive: true });
  });

  afterEach(() => {
    process.chdir(savedCwd);
    rmSync(testRoot, { recursive: true, force: true });
  });

  async function uploadAndAssertKnowledgeObject(
    store: SessionStore,
    fileName: string,
    buffer: Buffer,
  ) {
    const upload = await store.uploadKnowledgeDocument(undefined, fileName, buffer);
    const documents = await store.listKnowledgeDocuments(undefined);
    const listed = documents.documents.find(
      (document) => document.documentId === upload.documentId,
    );

    expect(upload.chunks).toBeGreaterThan(0);
    expect(listed).toBeDefined();

    const session = await store.getOrCreate(undefined);
    const records = await session.client.memory.listRecords();
    const knowledgeObject = records.records.find((record) => record.type === 'KnowledgeObject');
    const chunk = records.records.find(
      (record) => record.type === 'document' && record.metadata.documentId === upload.documentId,
    );

    expect(knowledgeObject).toBeDefined();
    expect(knowledgeObject?.metadata.knowledgeObjectId).toBe(upload.documentId);
    expect(chunk?.metadata.knowledgeObjectId).toBe(upload.documentId);

    const search = await store.searchKnowledge(undefined, KEYWORD);

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      expect(upload.chunks).toBeGreaterThan(0);
      return upload;
    }

    expect(search.total).toBeGreaterThan(0);
    return upload;
  }

  it('supports txt ingestion with KnowledgeObject linkage', async () => {
    const store = new SessionStore();
    await uploadAndAssertKnowledgeObject(store, 'sample.txt', readFixture('sample.txt'));
  });

  it('supports md ingestion with KnowledgeObject linkage', async () => {
    const store = new SessionStore();
    await uploadAndAssertKnowledgeObject(store, 'sample.md', readFixture('sample.md'));
  });

  it('supports pdf ingestion with KnowledgeObject linkage', async () => {
    const store = new SessionStore();
    const buffer = Buffer.from('%PDF-1.4 fake', 'utf8');
    await uploadAndAssertKnowledgeObject(store, 'sample.pdf', buffer);
  });

  it('supports docx ingestion with KnowledgeObject linkage', async () => {
    const store = new SessionStore();
    const buffer = await createDocxFixture(`DOCX ${KEYWORD} contenido`);
    await uploadAndAssertKnowledgeObject(store, 'sample.docx', buffer);
  });

  it('supports pptx ingestion with KnowledgeObject linkage', async () => {
    const store = new SessionStore();
    const buffer = await createPptxFixture(`PPTX ${KEYWORD} diapositiva`);
    await uploadAndAssertKnowledgeObject(store, 'sample.pptx', buffer);
  });

  it('supports xlsx ingestion with KnowledgeObject linkage', async () => {
    const store = new SessionStore();
    const buffer = createXlsxFixture({
      Datos: [
        ['Keyword', 'Valor'],
        ['Busqueda', KEYWORD],
      ],
    });
    await uploadAndAssertKnowledgeObject(store, 'sample.xlsx', buffer);
  });

  it('supports xls ingestion with KnowledgeObject linkage', async () => {
    const store = new SessionStore();
    const buffer = createXlsxFixture({
      Datos: [
        ['Keyword', 'Valor'],
        ['Busqueda', KEYWORD],
      ],
    });
    await uploadAndAssertKnowledgeObject(store, 'sample.xls', buffer);
  });
});
