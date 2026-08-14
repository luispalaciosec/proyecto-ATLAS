import { describe, expect, it } from 'vitest';

import { mapKnowledgeDocumentsToProduct } from '../../src/presentation/map-knowledge-documents.js';

describe('mapKnowledgeDocumentsToProduct', () => {
  it('aggregates upload chunks into one document', () => {
    const result = mapKnowledgeDocumentsToProduct('geeks', [
      {
        id: 'record.1',
        type: 'document',
        metadata: {
          source: 'upload',
          documentId: 'doc.1',
          fileName: 'Manual.pdf',
          fileType: 'pdf',
          folder: 'Comercial',
          chunkIndex: 0,
          totalChunks: 2,
          uploadedAt: '2026-08-10T12:00:00.000Z',
        },
      },
      {
        id: 'record.2',
        type: 'document',
        metadata: {
          source: 'upload',
          documentId: 'doc.1',
          fileName: 'Manual.pdf',
          fileType: 'pdf',
          folder: 'Comercial',
          chunkIndex: 1,
          totalChunks: 2,
          uploadedAt: '2026-08-10T12:00:00.000Z',
        },
      },
    ]);

    expect(result.workspace).toBe('geeks');
    expect(result.total).toBe(1);
    expect(result.documents[0]?.fileName).toBe('Manual.pdf');
    expect(result.documents[0]?.folder).toBe('Comercial');
    expect(result.documents[0]?.chunks).toBe(2);
    expect(result.folders).toContain('Comercial');
    expect(result.folders).toContain('General');
  });

  it('filters documents by folder', () => {
    const filtered = mapKnowledgeDocumentsToProduct(
      'default',
      [
        {
          id: 'record.1',
          type: 'document',
          metadata: {
            source: 'upload',
            documentId: 'doc.1',
            fileName: 'A.pdf',
            fileType: 'pdf',
            folder: 'Legal',
            uploadedAt: '2026-08-10T12:00:00.000Z',
          },
        },
        {
          id: 'record.2',
          type: 'document',
          metadata: {
            source: 'upload',
            documentId: 'doc.2',
            fileName: 'B.pdf',
            fileType: 'pdf',
            folder: 'General',
            uploadedAt: '2026-08-11T12:00:00.000Z',
          },
        },
      ],
      'Legal',
    );

    expect(filtered.total).toBe(1);
    expect(filtered.documents[0]?.fileName).toBe('A.pdf');
    expect(filtered.folder).toBe('Legal');
  });

  it('groups legacy uploads without documentId by fileName and uploadedAt', () => {
    const result = mapKnowledgeDocumentsToProduct('default', [
      {
        id: 'record.1',
        type: 'document',
        metadata: {
          source: 'upload',
          fileName: 'Legacy.docx',
          fileType: 'docx',
          chunkIndex: 0,
          totalChunks: 2,
          uploadedAt: '2026-08-01T10:00:00.000Z',
        },
      },
      {
        id: 'record.2',
        type: 'document',
        metadata: {
          source: 'upload',
          fileName: 'Legacy.docx',
          fileType: 'docx',
          chunkIndex: 1,
          totalChunks: 2,
          uploadedAt: '2026-08-01T10:00:00.000Z',
        },
      },
    ]);

    expect(result.total).toBe(1);
    expect(result.documents[0]?.chunks).toBe(2);
    expect(result.documents[0]?.folder).toBe('General');
  });
});
