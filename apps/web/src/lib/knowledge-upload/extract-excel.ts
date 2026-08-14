import * as XLSX from 'xlsx';

import { KnowledgeUploadError } from './upload-errors.js';

export interface ExcelSheetData {
  readonly sheetName: string;
  readonly sheetIndex: number;
  readonly headers: readonly string[];
  readonly rows: readonly string[];
}

export interface ExcelWorkbookData {
  readonly fileName: string;
  readonly sheets: readonly ExcelSheetData[];
}

const AMBIGUOUS_DATE_PATTERN = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/;

function looksLikeExcelBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) {
    return false;
  }

  if (buffer[0] === 0x50 && buffer[1] === 0x4b) {
    return true;
  }

  return (
    buffer[0] === 0xd0 &&
    buffer[1] === 0xcf &&
    buffer[2] === 0x11 &&
    buffer[3] === 0xe0
  );
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

function formatDateParts(parts: { y: number; m: number; d: number }): string {
  return `${parts.y}-${pad2(parts.m)}-${pad2(parts.d)}`;
}

export function formatExcelCellValue(cell: XLSX.CellObject | undefined): string {
  if (cell === undefined) {
    return '';
  }

  const hasFormula = typeof cell.f === 'string' && cell.f.length > 0;
  const hasCachedValue =
    cell.v !== undefined &&
    cell.v !== null &&
    !(typeof cell.v === 'string' && cell.v.trim().length === 0);
  const hasFormattedText = typeof cell.w === 'string' && cell.w.trim().length > 0;

  if (hasFormula && !hasCachedValue && !hasFormattedText) {
    return `[fórmula sin valor cacheado: ${cell.f}]`;
  }

  if (hasFormattedText) {
    const formatted = cell.w!.trim();

    if (cell.t === 's' && AMBIGUOUS_DATE_PATTERN.test(formatted)) {
      return formatted;
    }

    return formatted;
  }

  if (cell.t === 'd' && cell.v instanceof Date && !Number.isNaN(cell.v.getTime())) {
    return cell.v.toISOString().slice(0, 10);
  }

  if (cell.t === 'b') {
    return cell.v === true ? 'TRUE' : 'FALSE';
  }

  if (cell.t === 'n' && typeof cell.v === 'number') {
    if (typeof cell.z === 'string' && /[dmy]/i.test(cell.z)) {
      const parsed = XLSX.SSF.parse_date_code(cell.v);

      if (parsed !== undefined && parsed !== null) {
        return formatDateParts(parsed);
      }
    }

    return String(cell.v);
  }

  if (cell.v === undefined || cell.v === null) {
    return '';
  }

  return String(cell.v).trim();
}

function columnLabel(index: number): string {
  return `Columna ${index + 1}`;
}

function detectHeaders(rowValues: readonly string[]): readonly string[] {
  const nonEmpty = rowValues.filter((value) => value.length > 0);

  if (nonEmpty.length >= 2) {
    return rowValues.map((value, index) =>
      value.length > 0 ? value : columnLabel(index),
    );
  }

  return rowValues.map((_value, index) => columnLabel(index));
}

function formatDataRow(headers: readonly string[], rowValues: readonly string[]): string {
  const parts: string[] = [];

  for (let index = 0; index < headers.length; index += 1) {
    const header = headers[index] ?? columnLabel(index);
    const value = rowValues[index] ?? '';
    parts.push(`${header}: ${value.length > 0 ? value : ''}`);
  }

  return parts.join(' | ');
}

function readSheetRows(
  sheet: XLSX.WorkSheet,
  sheetName: string,
  sheetIndex: number,
): ExcelSheetData {
  const ref = sheet['!ref'];

  if (ref === undefined || ref.length === 0) {
    return Object.freeze({
      sheetName,
      sheetIndex,
      headers: Object.freeze([]),
      rows: Object.freeze([]),
    });
  }

  const range = XLSX.utils.decode_range(ref);
  const matrix: string[][] = [];

  for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
    const rowValues: string[] = [];

    for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
      const address = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
      rowValues.push(formatExcelCellValue(sheet[address]));
    }

    if (rowValues.some((value) => value.length > 0)) {
      matrix.push(rowValues);
    }
  }

  if (matrix.length === 0) {
    return Object.freeze({
      sheetName,
      sheetIndex,
      headers: Object.freeze([]),
      rows: Object.freeze([]),
    });
  }

  const headers = detectHeaders(matrix[0] ?? []);
  const dataRows = matrix.slice(1);
  const rows = dataRows.map((rowValues, index) => `Fila ${index + 1}: ${formatDataRow(headers, rowValues)}`);

  return Object.freeze({
    sheetName,
    sheetIndex,
    headers,
    rows: Object.freeze(rows),
  });
}

export function extractExcelWorkbook(buffer: Buffer, fileName: string): ExcelWorkbookData {
  if (!looksLikeExcelBuffer(buffer)) {
    throw new KnowledgeUploadError(
      422,
      `No se pudo leer el archivo Excel ${fileName}. Comprueba que no esté dañado.`,
    );
  }

  try {
    const workbook = XLSX.read(buffer, {
      type: 'buffer',
      cellDates: true,
      cellNF: true,
      cellText: false,
    });

    const sheets = workbook.SheetNames.map((sheetName, sheetIndex) =>
      readSheetRows(workbook.Sheets[sheetName]!, sheetName, sheetIndex + 1),
    );

    const nonEmptySheets = sheets.filter(
      (sheet) => sheet.headers.length > 0 || sheet.rows.length > 0,
    );

    if (nonEmptySheets.length === 0) {
      throw new KnowledgeUploadError(
        422,
        `No se pudo extraer contenido legible de ${fileName}. Comprueba que no esté vacío o dañado.`,
      );
    }

    return Object.freeze({
      fileName,
      sheets: Object.freeze(nonEmptySheets),
    });
  } catch (error) {
    if (error instanceof KnowledgeUploadError) {
      throw error;
    }

    throw new KnowledgeUploadError(
      422,
      `No se pudo leer el archivo Excel ${fileName}. Comprueba que no esté dañado.`,
    );
  }
}

export function flattenExcelWorkbook(workbook: ExcelWorkbookData): string {
  const sections = workbook.sheets.map((sheet) => {
    const headerLine =
      sheet.headers.length > 0 ? `Headers: ${sheet.headers.join(' | ')}` : 'Headers: (sin encabezados)';
    const body = sheet.rows.length > 0 ? sheet.rows.join('\n') : '(sin filas de datos)';

    return `[Hoja: ${sheet.sheetName}]\n${headerLine}\n\n${body}`;
  });

  return sections.join('\n\n---\n\n').trim();
}

export function isExcelExtension(extension: string): extension is 'xls' | 'xlsx' {
  return extension === 'xls' || extension === 'xlsx';
}
