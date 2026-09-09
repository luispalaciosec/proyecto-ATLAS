import { Identifier } from '@atlas/core';

import type { KnowledgeObject } from '../domain/aggregates/knowledge-object.js';
import { serializeKnowledgeCanonicalSource } from '../adapters/canonical-source.js';
import { ContextScope } from '../domain/value-objects/context-scope.js';
import { KnowledgeVersion } from '../domain/value-objects/knowledge-version.js';
import { ObjectKind } from '../domain/value-objects/object-kind.js';
import { ObjectMetadata } from '../domain/value-objects/object-metadata.js';
import { createKnowledgeObject } from '../factories/index.js';

export const INGEST_DOCUMENT_OBJECT_KIND = 'Document';
export const INGEST_SOURCE_UPLOAD = 'upload';
export const KNOWLEDGE_OBJECT_RECORD_TYPE = 'KnowledgeObject';
export const DOCUMENT_CHUNK_RECORD_TYPE = 'document';

export interface CreateIngestedDocumentParams {
  readonly documentId: string;
  readonly fileName: string;
  readonly fileType: string;
  readonly folder: string;
  readonly workspace: string;
  readonly uploadedAt: string;
  readonly ownerId?: string;
}

export interface IngestedDocumentProvenance {
  readonly documentId: string;
  readonly fileName: string;
  readonly fileType: string;
  readonly folder: string;
  readonly workspace: string;
  readonly uploadedAt: string;
  readonly ingestSource: typeof INGEST_SOURCE_UPLOAD;
}

export interface IngestedDocumentKnowledge {
  readonly knowledgeObject: KnowledgeObject;
  readonly knowledgeObjectId: string;
  readonly provenance: IngestedDocumentProvenance;
  readonly canonicalSource: ReturnType<typeof serializeIngestedDocumentSource>;
}

export interface IngestChunkReferenceParams {
  readonly chunkIndex: number;
  readonly totalChunks: number;
  readonly sheetName?: string;
  readonly sheetIndex?: number;
  readonly totalSheets?: number;
  readonly rowStart?: number;
  readonly rowEnd?: number;
}

export function serializeIngestedDocumentSource(
  object: KnowledgeObject,
  provenance: IngestedDocumentProvenance,
) {
  return Object.freeze({
    ...serializeKnowledgeCanonicalSource(object),
    ingest: Object.freeze({ ...provenance }),
  });
}

export function createIngestedDocumentKnowledgeObject(
  params: CreateIngestedDocumentParams,
): IngestedDocumentKnowledge {
  const owner = Identifier.create(params.ownerId ?? 'atlas.ingest');
  const workspace = params.workspace.trim().length > 0 ? params.workspace.trim() : 'default';
  const provenance: IngestedDocumentProvenance = Object.freeze({
    documentId: params.documentId,
    fileName: params.fileName,
    fileType: params.fileType,
    folder: params.folder,
    workspace,
    uploadedAt: params.uploadedAt,
    ingestSource: INGEST_SOURCE_UPLOAD,
  });

  const knowledgeObject = createKnowledgeObject({
    id: params.documentId,
    kind: ObjectKind.create(INGEST_DOCUMENT_OBJECT_KIND),
    metadata: ObjectMetadata.create({
      name: params.fileName,
      description: `Ingested ${params.fileType.toUpperCase()} document`,
      tags: Object.freeze([params.fileType, params.folder, INGEST_SOURCE_UPLOAD]),
      labels: Object.freeze(['ingest', 'document']),
    }),
    owner,
    contexts: Object.freeze([
      ContextScope.create({
        organizational: workspace,
        technical: params.fileType,
      }),
    ]),
    version: KnowledgeVersion.initial(),
  });

  return Object.freeze({
    knowledgeObject,
    knowledgeObjectId: knowledgeObject.id.toString(),
    provenance,
    canonicalSource: serializeIngestedDocumentSource(knowledgeObject, provenance),
  });
}

export function buildIngestChunkMetadata(
  ingest: IngestedDocumentKnowledge,
  chunk: IngestChunkReferenceParams,
  extra: Readonly<Record<string, unknown>> = {},
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    source: INGEST_SOURCE_UPLOAD,
    recordRole: 'document-chunk',
    knowledgeObjectId: ingest.knowledgeObjectId,
    knowledgeObjectVersion: ingest.knowledgeObject.currentVersion.version.toString(),
    documentId: ingest.provenance.documentId,
    fileName: ingest.provenance.fileName,
    fileType: ingest.provenance.fileType,
    folder: ingest.provenance.folder,
    workspace: ingest.provenance.workspace,
    uploadedAt: ingest.provenance.uploadedAt,
    ingestSource: ingest.provenance.ingestSource,
    chunkIndex: chunk.chunkIndex,
    totalChunks: chunk.totalChunks,
    ...(chunk.sheetName !== undefined ? { sheetName: chunk.sheetName } : {}),
    ...(chunk.sheetIndex !== undefined ? { sheetIndex: chunk.sheetIndex } : {}),
    ...(chunk.totalSheets !== undefined ? { totalSheets: chunk.totalSheets } : {}),
    ...(chunk.rowStart !== undefined ? { rowStart: chunk.rowStart } : {}),
    ...(chunk.rowEnd !== undefined ? { rowEnd: chunk.rowEnd } : {}),
    ...extra,
  });
}

export function buildKnowledgeObjectRecordMetadata(
  ingest: IngestedDocumentKnowledge,
): Readonly<Record<string, unknown>> {
  return Object.freeze({
    source: INGEST_SOURCE_UPLOAD,
    recordRole: 'knowledge-object',
    knowledgeObjectId: ingest.knowledgeObjectId,
    knowledgeObjectVersion: ingest.knowledgeObject.currentVersion.version.toString(),
    documentId: ingest.provenance.documentId,
    fileName: ingest.provenance.fileName,
    fileType: ingest.provenance.fileType,
    folder: ingest.provenance.folder,
    workspace: ingest.provenance.workspace,
    uploadedAt: ingest.provenance.uploadedAt,
    ingestSource: ingest.provenance.ingestSource,
  });
}
