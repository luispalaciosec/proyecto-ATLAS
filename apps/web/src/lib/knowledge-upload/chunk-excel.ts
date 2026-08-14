import { KNOWLEDGE_CHUNK_MAX_CHARS } from './constants.js';
import type { ExcelSheetData, ExcelWorkbookData } from './extract-excel.js';

export interface ExcelChunk {
  readonly content: string;
  readonly sheetName: string;
  readonly sheetIndex: number;
  readonly totalSheets: number;
  readonly rowStart: number;
  readonly rowEnd: number;
}

function buildChunkPrefix(
  fileName: string,
  sheet: ExcelSheetData,
  totalSheets: number,
): string {
  const headerLine =
    sheet.headers.length > 0 ? sheet.headers.join(' | ') : '(sin encabezados)';

  return [
    `Archivo: ${fileName}`,
    `Hoja: ${sheet.sheetName} (${sheet.sheetIndex}/${totalSheets})`,
    `Headers: ${headerLine}`,
    '',
  ].join('\n');
}

function truncateRow(row: string, maxChars: number): string {
  if (row.length <= maxChars) {
    return row;
  }

  return `${row.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`;
}

export function chunkExcelWorkbook(
  workbook: ExcelWorkbookData,
  maxChars: number = KNOWLEDGE_CHUNK_MAX_CHARS,
): readonly ExcelChunk[] {
  const chunks: ExcelChunk[] = [];
  const totalSheets = workbook.sheets.length;

  for (const sheet of workbook.sheets) {
    if (sheet.rows.length === 0) {
      continue;
    }

    const prefix = buildChunkPrefix(workbook.fileName, sheet, totalSheets);
    let currentRows: string[] = [];
    let rowStart = 1;

    const pushChunk = (rowEnd: number): void => {
      if (currentRows.length === 0) {
        return;
      }

      chunks.push(
        Object.freeze({
          content: `${prefix}${currentRows.join('\n')}`.trim(),
          sheetName: sheet.sheetName,
          sheetIndex: sheet.sheetIndex,
          totalSheets,
          rowStart,
          rowEnd,
        }),
      );
      currentRows = [];
      rowStart = rowEnd + 1;
    };

    for (let index = 0; index < sheet.rows.length; index += 1) {
      const row = sheet.rows[index] ?? '';
      const rowNumber = index + 1;
      const candidate = [...currentRows, row];
      const candidateContent = `${prefix}${candidate.join('\n')}`.trim();

      if (candidateContent.length <= maxChars) {
        currentRows = candidate;
        continue;
      }

      if (currentRows.length > 0) {
        pushChunk(rowNumber - 1);
      }

      const singleRowContent = `${prefix}${row}`.trim();

      if (singleRowContent.length <= maxChars) {
        currentRows = [row];
        rowStart = rowNumber;
        continue;
      }

      chunks.push(
        Object.freeze({
          content: `${prefix}${truncateRow(row, maxChars - prefix.length)}`.trim(),
          sheetName: sheet.sheetName,
          sheetIndex: sheet.sheetIndex,
          totalSheets,
          rowStart: rowNumber,
          rowEnd: rowNumber,
        }),
      );
      rowStart = rowNumber + 1;
    }

    if (currentRows.length > 0) {
      pushChunk(rowStart + currentRows.length - 1);
    }
  }

  return Object.freeze(chunks);
}
