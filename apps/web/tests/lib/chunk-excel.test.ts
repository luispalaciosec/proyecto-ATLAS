import { describe, expect, it } from 'vitest';

import { chunkExcelWorkbook } from '../../src/lib/knowledge-upload/chunk-excel.js';
import { extractExcelWorkbook } from '../../src/lib/knowledge-upload/extract-excel.js';
import { createXlsxFixture } from '../fixtures/fixture-utils.js';

describe('chunkExcelWorkbook', () => {
  it('never splits a row across chunks and repeats sheet context', () => {
    const dataRows = Array.from({ length: 120 }, (_value, index) => [
      `Cliente-${index + 1}`,
      1000 + index,
    ]);

    const buffer = createXlsxFixture({
      Ventas: [['Cliente', 'Monto'], ...dataRows],
    });

    const workbook = extractExcelWorkbook(buffer, 'ventas-grandes.xlsx');
    const chunks = chunkExcelWorkbook(workbook, 800);

    expect(chunks.length).toBeGreaterThan(1);

    for (const chunk of chunks) {
      expect(chunk.content).toContain('Archivo: ventas-grandes.xlsx');
      expect(chunk.content).toContain('Hoja: Ventas (1/1)');
      expect(chunk.content).toContain('Headers: Cliente | Monto');
      expect(chunk.content.startsWith('Fila')).toBe(false);
      expect(chunk.content.includes('\nFila')).toBe(true);
      expect(chunk.rowStart).toBeGreaterThan(0);
      expect(chunk.rowEnd).toBeGreaterThanOrEqual(chunk.rowStart);
    }
  });

  it('creates separate chunks per sheet', () => {
    const buffer = createXlsxFixture({
      Uno: [
        ['Nombre', 'Dato'],
        ['Alpha', 'alpha-token-001'],
      ],
      Dos: [
        ['Nombre', 'Dato'],
        ['Beta', 'beta-token-002'],
      ],
    });

    const chunks = chunkExcelWorkbook(extractExcelWorkbook(buffer, 'dos-hojas.xlsx'));

    expect(chunks.some((chunk) => chunk.sheetName === 'Uno')).toBe(true);
    expect(chunks.some((chunk) => chunk.sheetName === 'Dos')).toBe(true);
    expect(chunks.every((chunk) => chunk.totalSheets === 2)).toBe(true);
  });
});
