import { describe, expect, it, vi } from 'vitest';

vi.mock('pdf-parse', () => ({
  PDFParse: vi.fn().mockImplementation(() => ({
    getText: vi.fn(async () => ({ text: 'PDF zeta-quantum-7742 contenido extraido' })),
    destroy: vi.fn(async () => undefined),
  })),
}));

import { chunkText } from '../src/lib/knowledge-upload/chunk-text.js';
import {
  EMPTY_EXTRACTION_MESSAGE,
  formatUnsupportedExtensionMessage,
  resolveSupportedExtension,
} from '../src/lib/knowledge-upload/constants.js';
import {
  assertExtractedText,
  extractTextFromBuffer,
} from '../src/lib/knowledge-upload/extract-text.js';
import { KnowledgeUploadError } from '../src/lib/knowledge-upload/upload-errors.js';
import {
  createDocxFixture,
  createPptxFixture,
  createXlsxFixture,
  readFixture,
} from './fixtures/fixture-utils.js';

const KEYWORD = 'zeta-quantum-7742';

describe('knowledge upload helpers', () => {
  it('resolves supported extensions', () => {
    expect(resolveSupportedExtension('Manual.pdf')).toBe('pdf');
    expect(resolveSupportedExtension('notes.TXT')).toBe('txt');
    expect(resolveSupportedExtension('slides.pptx')).toBe('pptx');
    expect(resolveSupportedExtension('budget.xlsx')).toBe('xlsx');
    expect(resolveSupportedExtension('legacy.xls')).toBe('xls');
    expect(resolveSupportedExtension('archive.zip')).toBeUndefined();
  });

  it('formats unsupported extension messages', () => {
    expect(formatUnsupportedExtensionMessage('zip')).toContain('.zip');
    expect(formatUnsupportedExtensionMessage('zip')).toContain('pdf, docx, pptx, txt, md, xls, xlsx');
  });

  it('chunks long text on paragraph boundaries', () => {
    const paragraph = 'Oración de prueba. ';
    const text = `${paragraph.repeat(400)}\n\n${paragraph.repeat(400)}`;
    const chunks = chunkText(text, 6000);

    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.length <= 6000)).toBe(true);
  });

  it('extracts txt and md fixtures', async () => {
    const txt = await extractTextFromBuffer(readFixture('sample.txt'), 'txt', 'sample.txt');
    const md = await extractTextFromBuffer(readFixture('sample.md'), 'md', 'sample.md');

    expect(txt).toContain(KEYWORD);
    expect(md).toContain(KEYWORD);
  });

  it('extracts docx fixture text', async () => {
    const buffer = await createDocxFixture(`DOCX ${KEYWORD} contenido`);
    const text = await extractTextFromBuffer(buffer, 'docx', 'sample.docx');

    expect(text).toContain(KEYWORD);
  });

  it('extracts pptx fixture text', async () => {
    const buffer = await createPptxFixture(`PPTX ${KEYWORD} diapositiva`);
    const text = await extractTextFromBuffer(buffer, 'pptx', 'sample.pptx');

    expect(text).toContain(KEYWORD);
  });

  it('extracts pdf fixture text via pdf-parse', async () => {
    const buffer = Buffer.from('%PDF-1.4 fake', 'utf8');
    const text = await extractTextFromBuffer(buffer, 'pdf', 'sample.pdf');

    expect(text).toContain(KEYWORD);
  });

  it('extracts xlsx fixture text', async () => {
    const buffer = createXlsxFixture({
      Datos: [
        ['Keyword', 'Valor'],
        ['Busqueda', KEYWORD],
      ],
    });
    const text = await extractTextFromBuffer(buffer, 'xlsx', 'sample.xlsx');

    expect(text).toContain('[Hoja: Datos]');
    expect(text).toContain(KEYWORD);
  });

  it('rejects empty extracted text', () => {
    expect(() => assertExtractedText('   ')).toThrow(KnowledgeUploadError);
    expect(() => assertExtractedText('   ')).toThrow(EMPTY_EXTRACTION_MESSAGE);
  });
});
