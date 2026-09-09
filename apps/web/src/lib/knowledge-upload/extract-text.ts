import mammoth from 'mammoth';
import JSZip from 'jszip';
import { PDFParse } from 'pdf-parse';

import { EMPTY_EXTRACTION_MESSAGE, type SupportedExtension } from './constants.js';
import { extractExcelWorkbook, flattenExcelWorkbook } from './extract-excel.js';
import { KnowledgeUploadError } from './upload-errors.js';

function stripXmlText(xml: string): string {
  return xml
    .replace(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g, (_match, value: string) => value)
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function extractPptxText(buffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const slidePaths = Object.keys(zip.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((left, right) => {
      const leftNumber = Number.parseInt(left.match(/slide(\d+)/i)?.[1] ?? '0', 10);
      const rightNumber = Number.parseInt(right.match(/slide(\d+)/i)?.[1] ?? '0', 10);
      return leftNumber - rightNumber;
    });

  const slideTexts: string[] = [];

  for (const slidePath of slidePaths) {
    const file = zip.file(slidePath);

    if (file === null) {
      continue;
    }

    const xml = await file.async('text');
    const text = stripXmlText(xml);

    if (text.length > 0) {
      slideTexts.push(text);
    }
  }

  return slideTexts.join('\n\n').trim();
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

function extractPlainText(buffer: Buffer): string {
  return buffer
    .toString('utf8')
    .replace(/^\uFEFF/, '')
    .trim();
}

export async function extractTextFromBuffer(
  buffer: Buffer,
  extension: SupportedExtension,
  fileName: string,
): Promise<string> {
  try {
    switch (extension) {
      case 'pdf':
        return await extractPdfText(buffer);
      case 'docx':
        return await extractDocxText(buffer);
      case 'pptx':
        return await extractPptxText(buffer);
      case 'txt':
      case 'md':
        return extractPlainText(buffer);
      case 'xls':
      case 'xlsx':
        return flattenExcelWorkbook(extractExcelWorkbook(buffer, fileName));
      default:
        throw new KnowledgeUploadError(400, `Formato no soportado para ${fileName}.`);
    }
  } catch (error) {
    if (error instanceof KnowledgeUploadError) {
      throw error;
    }

    throw new KnowledgeUploadError(
      422,
      `No se pudo leer el archivo ${fileName}. Comprueba que no esté dañado.`,
    );
  }
}

export function assertExtractedText(text: string): string {
  if (text.trim().length === 0) {
    throw new KnowledgeUploadError(422, EMPTY_EXTRACTION_MESSAGE);
  }

  return text.trim();
}
