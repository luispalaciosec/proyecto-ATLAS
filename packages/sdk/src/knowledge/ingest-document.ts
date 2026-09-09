import type { MemoryRecord } from '@atlas/memory';
import {
  DOCUMENT_CHUNK_RECORD_TYPE,
  KNOWLEDGE_OBJECT_RECORD_TYPE,
  buildIngestChunkMetadata,
  buildKnowledgeObjectRecordMetadata,
  createIngestedDocumentKnowledgeObject,
  type CreateIngestedDocumentParams,
  type IngestChunkReferenceParams,
  type IngestedDocumentKnowledge,
} from '@atlas/knowledge';

import type { MemoryModule, StoreMemoryContentResult } from '../modules/memory-module.js';

export interface StoreIngestedDocumentKnowledgeResult {
  readonly ingest: IngestedDocumentKnowledge;
  readonly knowledgeObjectRecord: StoreMemoryContentResult;
}

export interface StoreIngestedDocumentChunkOptions {
  readonly ingest: IngestedDocumentKnowledge;
  readonly content: string;
  readonly chunk: IngestChunkReferenceParams;
  readonly extraMetadata?: Readonly<Record<string, unknown>>;
}

export function prepareIngestedDocumentKnowledge(
  params: CreateIngestedDocumentParams,
): IngestedDocumentKnowledge {
  return createIngestedDocumentKnowledgeObject(params);
}

export async function storeIngestedDocumentKnowledgeObject(
  memory: MemoryModule,
  ingest: IngestedDocumentKnowledge,
): Promise<StoreIngestedDocumentKnowledgeResult> {
  const knowledgeObjectRecord = await memory.storeStructuredRecord({
    recordType: KNOWLEDGE_OBJECT_RECORD_TYPE,
    content: Object.freeze({
      knowledgeObject: ingest.canonicalSource,
    }),
    metadata: buildKnowledgeObjectRecordMetadata(ingest),
  });

  return Object.freeze({
    ingest,
    knowledgeObjectRecord,
  });
}

export async function storeIngestedDocumentChunk(
  memory: MemoryModule,
  options: StoreIngestedDocumentChunkOptions,
): Promise<StoreMemoryContentResult> {
  return memory.storeContent({
    content: options.content,
    recordType: DOCUMENT_CHUNK_RECORD_TYPE,
    metadata: buildIngestChunkMetadata(options.ingest, options.chunk, options.extraMetadata),
  });
}

export function readKnowledgeObjectId(record: MemoryRecord): string | undefined {
  const metadataValue = record.metadata.knowledgeObjectId;

  return typeof metadataValue === 'string' && metadataValue.trim().length > 0
    ? metadataValue.trim()
    : undefined;
}

export function isDocumentChunkRecord(record: MemoryRecord): boolean {
  return record.type === DOCUMENT_CHUNK_RECORD_TYPE && record.metadata.source === 'upload';
}

export function isKnowledgeObjectRecord(record: MemoryRecord): boolean {
  return record.type === KNOWLEDGE_OBJECT_RECORD_TYPE;
}
