import { describe, expect, it } from 'vitest';

import {
  INGEST_DOCUMENT_OBJECT_KIND,
  buildIngestChunkMetadata,
  createIngestedDocumentKnowledgeObject,
} from '../../src/ingest/document-ingest.js';

describe('document ingest knowledge helpers', () => {
  it('creates a Document KnowledgeObject with stable ingest provenance', () => {
    const ingest = createIngestedDocumentKnowledgeObject({
      documentId: 'doc.test.001',
      fileName: 'manual.pdf',
      fileType: 'pdf',
      folder: 'General',
      workspace: 'geeks',
      uploadedAt: '2026-09-08T12:00:00.000Z',
    });

    expect(ingest.knowledgeObjectId).toBe('doc.test.001');
    expect(ingest.knowledgeObject.kind.name).toBe(INGEST_DOCUMENT_OBJECT_KIND);
    expect(ingest.provenance.fileName).toBe('manual.pdf');
    expect(ingest.provenance.workspace).toBe('geeks');
    expect(ingest.canonicalSource.ingest.documentId).toBe('doc.test.001');
  });

  it('builds chunk metadata that references the parent KnowledgeObject', () => {
    const ingest = createIngestedDocumentKnowledgeObject({
      documentId: 'doc.test.002',
      fileName: 'notes.txt',
      fileType: 'txt',
      folder: 'General',
      workspace: 'default',
      uploadedAt: '2026-09-08T12:00:00.000Z',
    });

    const metadata = buildIngestChunkMetadata(ingest, {
      chunkIndex: 0,
      totalChunks: 2,
    });

    expect(metadata.knowledgeObjectId).toBe('doc.test.002');
    expect(metadata.documentId).toBe('doc.test.002');
    expect(metadata.fileName).toBe('notes.txt');
    expect(metadata.recordRole).toBe('document-chunk');
  });
});
