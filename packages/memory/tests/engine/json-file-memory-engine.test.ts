import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { createJsonFileMemoryEngine } from '../../src/providers/storage/create-json-file-memory-engine.js';

describe('createJsonFileMemoryEngine', () => {
  it('stores and searches records across engine restarts', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-json-engine-'));
    const filePath = join(dir, 'memory.json');

    const firstEngine = createJsonFileMemoryEngine(filePath);
    const storeResult = await firstEngine.store({
      id: 'record.engine.persisted',
      type: 'CliMemory',
      content: { text: 'persist across restart' },
      metadata: { namespaceId: 'cli.default' },
      timestamp: '2026-08-04T00:00:00.000Z',
    });

    expect(storeResult.ok).toBe(true);

    const secondEngine = createJsonFileMemoryEngine(filePath);
    const searchResult = await secondEngine.search({ namespaceId: 'cli.default' });

    expect(searchResult.ok).toBe(true);
    if (searchResult.ok) {
      expect(searchResult.value.records).toHaveLength(1);
      expect(searchResult.value.records[0]?.id).toBe('record.engine.persisted');
    }

    rmSync(dir, { recursive: true, force: true });
  });
});
