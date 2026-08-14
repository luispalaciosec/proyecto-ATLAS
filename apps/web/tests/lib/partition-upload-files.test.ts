import { describe, expect, it } from 'vitest';

import { partitionUploadFiles } from '../../src/lib/knowledge-upload/partition-upload-files.js';

describe('partitionUploadFiles', () => {
  it('separates supported and unsupported files', () => {
    const files = [
      new File(['a'], 'manual.pdf', { type: 'application/pdf' }),
      new File(['b'], 'notes.txt', { type: 'text/plain' }),
      new File(['c'], 'sheet.xlsx', { type: 'application/vnd.ms-excel' }),
    ];

    const result = partitionUploadFiles(files, (fileName) => {
      const extension = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();
      return ['pdf', 'txt', 'md', 'docx', 'pptx'].includes(extension);
    });

    expect(result.supported).toHaveLength(2);
    expect(result.supported.map((file) => file.name)).toEqual(['manual.pdf', 'notes.txt']);
    expect(result.unsupported).toEqual(['sheet.xlsx']);
  });
});
