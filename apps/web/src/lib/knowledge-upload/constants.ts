export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
export const KNOWLEDGE_CHUNK_MAX_CHARS = 6000;

export const SUPPORTED_EXTENSIONS = ['pdf', 'docx', 'pptx', 'txt', 'md'] as const;

export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export function resolveSupportedExtension(fileName: string): SupportedExtension | undefined {
  const trimmed = fileName.trim();
  const dotIndex = trimmed.lastIndexOf('.');

  if (dotIndex <= 0 || dotIndex === trimmed.length - 1) {
    return undefined;
  }

  const extension = trimmed.slice(dotIndex + 1).toLowerCase();

  if ((SUPPORTED_EXTENSIONS as readonly string[]).includes(extension)) {
    return extension as SupportedExtension;
  }

  return undefined;
}

export function formatUnsupportedExtensionMessage(extension: string): string {
  return `Formato no soportado: .${extension}. Formatos válidos: pdf, docx, pptx, txt, md.`;
}

export const EMPTY_EXTRACTION_MESSAGE =
  'No se pudo extraer texto de este archivo (¿es una imagen escaneada?).';
