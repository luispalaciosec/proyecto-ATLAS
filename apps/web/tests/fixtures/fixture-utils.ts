import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import JSZip from 'jszip';
import * as XLSX from 'xlsx';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
export const FIXTURES_DIR = moduleDirectory;

export function readFixture(name: string): Buffer {
  return readFileSync(join(FIXTURES_DIR, name));
}

export async function createDocxFixture(text: string): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`,
  );
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:body>
</w:document>`,
  );
  return Buffer.from(await zip.generateAsync({ type: 'nodebuffer' }));
}

export async function createPptxFixture(text: string): Promise<Buffer> {
  const zip = new JSZip();
  zip.file(
    'ppt/slides/slide1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld><p:spTree><p:sp><p:txBody><a:p><a:r><a:t>${text}</a:t></a:r></a:p></p:txBody></p:sp></p:spTree></p:cSld>
</p:sld>`,
  );
  return Buffer.from(await zip.generateAsync({ type: 'nodebuffer' }));
}

export function createMinimalPdfFixture(text: string): Buffer {
  const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  const content = `BT /F1 12 Tf 50 700 Td (${escaped}) Tj ET`;
  const pdf = `%PDF-1.4
1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj
2 0 obj<< /Type /Pages /Kids [3 0 R] /Count 1 >>endobj
3 0 obj<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources<< /Font<< /F1 5 0 R >> >> >>endobj
4 0 obj<< /Length ${content.length} >>stream
${content}
endstream endobj
5 0 obj<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000274 00000 n 
0000000374 00000 n 
trailer<< /Root 1 0 R /Size 6 >>
startxref
456
%%EOF`;
  return Buffer.from(pdf, 'utf8');
}

export function createXlsxFixture(
  sheets: Record<string, unknown[][]>,
  bookType: 'xlsx' | 'xls' = 'xlsx',
): Buffer {
  const workbook = XLSX.utils.book_new();

  for (const [sheetName, rows] of Object.entries(sheets)) {
    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  return Buffer.from(
    XLSX.write(workbook, {
      type: 'buffer',
      bookType,
    }),
  );
}

export function createXlsxFixtureWithCells(
  sheetName: string,
  cells: Record<string, XLSX.CellObject>,
  bookType: 'xlsx' | 'xls' = 'xlsx',
): Buffer {
  const workbook = XLSX.utils.book_new();
  const worksheet: XLSX.WorkSheet = { ...cells };
  const addresses = Object.keys(cells);

  if (addresses.length > 0) {
    let minRow = Number.POSITIVE_INFINITY;
    let maxRow = 0;
    let minCol = Number.POSITIVE_INFINITY;
    let maxCol = 0;

    for (const address of addresses) {
      const decoded = XLSX.utils.decode_cell(address);
      minRow = Math.min(minRow, decoded.r);
      maxRow = Math.max(maxRow, decoded.r);
      minCol = Math.min(minCol, decoded.c);
      maxCol = Math.max(maxCol, decoded.c);
    }

    worksheet['!ref'] = XLSX.utils.encode_range({
      s: { r: minRow, c: minCol },
      e: { r: maxRow, c: maxCol },
    });
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return Buffer.from(
    XLSX.write(workbook, {
      type: 'buffer',
      bookType,
    }),
  );
}
