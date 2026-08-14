export interface PartitionUploadFilesResult {
  readonly supported: readonly File[];
  readonly unsupported: readonly string[];
}

export function partitionUploadFiles(
  files: readonly File[],
  isSupported: (fileName: string) => boolean,
): PartitionUploadFilesResult {
  const supported: File[] = [];
  const unsupported: string[] = [];

  for (const file of files) {
    if (isSupported(file.name)) {
      supported.push(file);
      continue;
    }

    unsupported.push(file.name);
  }

  return Object.freeze({
    supported: Object.freeze([...supported]),
    unsupported: Object.freeze([...unsupported]),
  });
}
