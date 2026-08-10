declare module 'pdf-parse' {
  interface PdfParseResult {
    readonly text: string;
  }

  export default function pdfParse(data: Buffer): Promise<PdfParseResult>;
}
