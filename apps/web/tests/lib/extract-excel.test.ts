import { describe, expect, it } from 'vitest';

import {
  extractExcelWorkbook,
  flattenExcelWorkbook,
  formatExcelCellValue,
} from '../../src/lib/knowledge-upload/extract-excel.js';
import { KnowledgeUploadError } from '../../src/lib/knowledge-upload/upload-errors.js';
import {
  createXlsxFixture,
  createXlsxFixtureWithCells,
} from '../fixtures/fixture-utils.js';

describe('extractExcelWorkbook', () => {
  it('parses a single sheet with headers and rows', () => {
    const buffer = createXlsxFixture({
      Ventas: [
        ['Cliente', 'Monto'],
        ['Farmacias del Oriente', 150000],
        ['Clinica Norte', 98000],
      ],
    });

    const workbook = extractExcelWorkbook(buffer, 'ventas.xlsx');

    expect(workbook.sheets).toHaveLength(1);
    expect(workbook.sheets[0]?.sheetName).toBe('Ventas');
    expect(workbook.sheets[0]?.headers).toEqual(['Cliente', 'Monto']);
    expect(workbook.sheets[0]?.rows[0]).toContain('Farmacias del Oriente');
    expect(workbook.sheets[0]?.rows[0]).toContain('150000');
  });

  it('parses multiple sheets without mixing content', () => {
    const buffer = createXlsxFixture({
      Clientes: [
        ['Cliente', 'Ciudad'],
        ['Ana', 'Quito'],
      ],
      Productos: [
        ['Producto', 'Precio'],
        ['Plan Premium', 1200],
      ],
      Resumen: [['Total', 2]],
    });

    const workbook = extractExcelWorkbook(buffer, 'catalogo.xlsx');

    expect(workbook.sheets).toHaveLength(3);
    expect(workbook.sheets.map((sheet) => sheet.sheetName)).toEqual([
      'Clientes',
      'Productos',
      'Resumen',
    ]);
    expect(flattenExcelWorkbook(workbook)).toContain('[Hoja: Clientes]');
    expect(flattenExcelWorkbook(workbook)).toContain('[Hoja: Productos]');
    expect(flattenExcelWorkbook(workbook)).toContain('[Hoja: Resumen]');
  });

  it('stringifies booleans and leaves empty cells explicit', () => {
    const buffer = createXlsxFixture({
      Flags: [
        ['Activo', 'Notas'],
        [true, ''],
        [false, 'Observacion'],
      ],
    });

    const workbook = extractExcelWorkbook(buffer, 'flags.xlsx');
    const rowOne = workbook.sheets[0]?.rows[0] ?? '';
    const rowTwo = workbook.sheets[0]?.rows[1] ?? '';

    expect(rowOne).toContain('Activo: TRUE');
    expect(rowOne).toContain('Notas: ');
    expect(rowTwo).toContain('Activo: FALSE');
  });

  it('separates headers and values with whitespace for search tokenization', () => {
    const buffer = createXlsxFixture({
      Inventario: [
        ['Cliente', 'Producto', 'Monto'],
        ['Ferreteria Andina', 'Taladro', 45000],
        ['Comercial Loja', 'Sierra', 32000],
      ],
    });

    const row = extractExcelWorkbook(buffer, 'inventario.xlsx').sheets[0]?.rows[0] ?? '';

    expect(row).toContain('Cliente: Ferreteria Andina');
    expect(row).toContain('Producto: Taladro');
    expect(row).toContain('Monto: 45000');
    expect(row).not.toContain('Producto=Taladro');
    expect(row).not.toContain('Monto=45000');

    const tokens = row.split(/\s+/);
    expect(tokens).toContain('Taladro');
    expect(tokens).toContain('45000');
  });

  it('prefers formatted dates and converts date serial numbers', () => {
    const formattedBuffer = createXlsxFixture({
      Fechas: [
        ['Fecha', 'Valor'],
        ['2026-07-15', 'alpha'],
      ],
    });
    const formatted = extractExcelWorkbook(formattedBuffer, 'fechas.xlsx');
    expect(formatted.sheets[0]?.rows[0]).toContain('2026-07-15');

    const serialBuffer = createXlsxFixtureWithCells('Serial', {
      A1: { t: 's', v: 'Fecha', w: 'Fecha' },
      B1: { t: 's', v: 'Etiqueta', w: 'Etiqueta' },
      A2: { t: 'n', v: 45558, z: 'yyyy-mm-dd', w: '2026-07-15' },
      B2: { t: 's', v: 'serial', w: 'serial' },
    });
    const serial = extractExcelWorkbook(serialBuffer, 'serial.xlsx');
    expect(serial.sheets[0]?.rows[0]).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('uses cached formula values and marks missing cached formulas', () => {
    const cachedBuffer = createXlsxFixtureWithCells('Formulas', {
      A1: { t: 's', v: 'Metric', w: 'Metric' },
      B1: { t: 's', v: 'Valor', w: 'Valor' },
      A2: { t: 's', v: 'Total', w: 'Total' },
      B2: { t: 'n', f: 'SUM(C1:C2)', v: 300, w: '300' },
      A3: { t: 's', v: 'Pendiente', w: 'Pendiente' },
      B3: { t: 'n', f: 'SUM(D1:D2)' },
    });

    const workbook = extractExcelWorkbook(cachedBuffer, 'formulas.xlsx');
    const rows = workbook.sheets[0]?.rows ?? [];

    expect(rows[0]).toContain('Valor: 300');
    expect(formatExcelCellValue({ t: 'n', f: 'SUM(D1:D2)' })).toContain(
      '[fórmula sin valor cacheado: SUM(D1:D2)]',
    );
  });

  it('rejects corrupt workbooks with a human error', () => {
    expect(() =>
      extractExcelWorkbook(Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]), 'roto.xlsx'),
    ).toThrow(KnowledgeUploadError);

    try {
      extractExcelWorkbook(Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]), 'roto.xlsx');
    } catch (error) {
      expect(error).toBeInstanceOf(KnowledgeUploadError);
      expect((error as KnowledgeUploadError).message).toContain('No se pudo leer el archivo Excel');
      expect((error as KnowledgeUploadError).message).not.toContain('stack');
    }
  });

  it('reads legacy .xls workbooks', () => {
    const buffer = createXlsxFixture(
      {
        Legacy: [
          ['Codigo', 'Valor'],
          ['LEGACY-001', 'zeta-quantum-7742'],
        ],
      },
      'xls',
    );

    const workbook = extractExcelWorkbook(buffer, 'legacy.xls');
    expect(workbook.sheets[0]?.rows[0]).toContain('LEGACY-001');
    expect(workbook.sheets[0]?.rows[0]).toContain('zeta-quantum-7742');
  });
});

describe('flattenExcelWorkbook', () => {
  it('keeps sheet banners in flattened text', () => {
    const buffer = createXlsxFixture({
      Hoja1: [
        ['Col', 'Dato'],
        ['A', 'B'],
      ],
    });

    const flattened = flattenExcelWorkbook(extractExcelWorkbook(buffer, 'demo.xlsx'));

    expect(flattened).toContain('[Hoja: Hoja1]');
    expect(flattened).toContain('Headers: Col | Dato');
  });
});
