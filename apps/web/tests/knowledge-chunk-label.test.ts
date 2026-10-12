import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { AtlasContextBuilder, KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH } from '@atlas/sdk';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  KNOWLEDGE_CHUNK_LABEL_MAX_LENGTH,
  formatKnowledgeChunkLabel,
  labelKnowledgeChunk,
} from '../src/lib/knowledge-upload/chunk-label.js';
import { chunkText } from '../src/lib/knowledge-upload/chunk-text.js';
import { KNOWLEDGE_CHUNK_MAX_CHARS } from '../src/lib/knowledge-upload/constants.js';
import { SessionStore } from '../src/session-store.js';
import { readFixture } from './fixtures/fixture-utils.js';

// Fictitious demo document (it says so in its own header).
const FILE_NAME = '01-politica-tarifas-y-excepciones.md';
const DOCUMENT = readFixture(FILE_NAME).toString('utf8');

function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

describe('knowledge chunk labels', () => {
  it('sizes chunks so that label + newline + text fit the 1200-char context snippet', () => {
    expect(KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH).toBe(1200);
    expect(KNOWLEDGE_CHUNK_LABEL_MAX_LENGTH).toBe(117);
    expect(KNOWLEDGE_CHUNK_MAX_CHARS).toBe(1082);
    expect(KNOWLEDGE_CHUNK_MAX_CHARS + 1 + KNOWLEDGE_CHUNK_LABEL_MAX_LENGTH).toBe(
      KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
    );
  });

  it('splits the policy document into labeled fragments that fit, without losing or duplicating text', () => {
    expect(DOCUMENT.length).toBeGreaterThan(KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH);

    const chunks = chunkText(DOCUMENT);
    const labeled = chunks.map((chunk, index) =>
      labelKnowledgeChunk(FILE_NAME, index, chunks.length, chunk),
    );

    expect(chunks.length).toBeGreaterThan(1);

    for (const [index, fragment] of labeled.entries()) {
      expect(fragment.length).toBeLessThanOrEqual(KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH);
      expect(
        fragment.startsWith(
          `[Documento: ${FILE_NAME} · fragmento ${index + 1}/${chunks.length}]\n`,
        ),
      ).toBe(true);
    }

    // Nothing lost or duplicated: the fragments put back together are the document.
    expect(normalizeWhitespace(chunks.join('\n\n'))).toBe(normalizeWhitespace(DOCUMENT));

    // The chunker cut at paragraph boundaries: no section is split in half.
    for (const chunk of chunks.slice(0, -1)) {
      expect(DOCUMENT).toContain(`${chunk}\n\n`);
    }

    const reviewSection = '## 5. Revisión\nLas excepciones aprobadas se revisan a los 90 días';
    expect(chunks.filter((chunk) => chunk.includes(reviewSection))).toHaveLength(1);
  });

  it('shortens very long file names in the label only', () => {
    const longName = `${'informe-muy-largo-'.repeat(10)}.md`;
    const label = formatKnowledgeChunkLabel(longName, 99_998, 99_999);

    expect(label.length).toBeLessThanOrEqual(KNOWLEDGE_CHUNK_LABEL_MAX_LENGTH);
    expect(label).toContain('…');
  });
});

describe('uploaded knowledge reaches the model whole and attributed', () => {
  const savedCwd = process.cwd();
  const savedMemoryFile = process.env.ATLAS_MEMORY_FILE;
  let testRoot = '';

  beforeEach(() => {
    testRoot = mkdtempSync(join(tmpdir(), 'atlas-web-chunk-label-'));
    process.chdir(testRoot);
    mkdirSync(join(testRoot, '.atlas', 'workspaces'), { recursive: true });
    delete process.env.ATLAS_MEMORY_FILE;
  });

  afterEach(() => {
    process.chdir(savedCwd);
    rmSync(testRoot, { recursive: true, force: true });

    if (savedMemoryFile !== undefined) {
      process.env.ATLAS_MEMORY_FILE = savedMemoryFile;
    }
  });

  it('stores labeled fragments and the 90-day review reaches the context sent to the model', async () => {
    const store = new SessionStore();
    const upload = await store.uploadKnowledgeDocument(
      undefined,
      FILE_NAME,
      readFixture(FILE_NAME),
    );
    const session = await store.getOrCreate(undefined);
    const { records } = await session.client.memory.listRecords();
    const fragments = records
      .filter(
        (record) => record.metadata.documentId === upload.documentId && record.type === 'document',
      )
      .map((record) =>
        typeof record.content === 'string'
          ? record.content
          : String((record.content as { text?: unknown }).text),
      );

    expect(upload.chunks).toBe(fragments.length);
    expect(fragments.length).toBeGreaterThan(1);
    expect(fragments.every((text) => text.length <= KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH)).toBe(
      true,
    );
    expect(
      fragments.every((text) => text.startsWith(`[Documento: ${FILE_NAME} · fragmento `)),
    ).toBe(true);

    const context = await AtlasContextBuilder.build({
      goal: '¿Cuándo se revisan las excepciones aprobadas según la política de tarifas?',
      atlas: session.client,
    });

    expect(context.systemPrompt).toContain(
      `[Documento: ${FILE_NAME} · fragmento ${fragments.length}/${fragments.length}]`,
    );
    expect(context.systemPrompt).toContain('se revisan a los 90 días');
  });
});
