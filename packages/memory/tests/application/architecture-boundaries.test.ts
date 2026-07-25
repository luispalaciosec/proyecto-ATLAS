import { describe, expect, it } from 'vitest';

import {
  DeleteMemoryUseCase,
  RetrieveMemoryUseCase,
  SearchMemoryUseCase,
  StoreMemoryUseCase,
  UpdateMemoryUseCase,
} from '../../src/application/index.js';
import { createTestEngine } from './test-helpers.js';

describe('Application layer ADR-0003 boundaries', () => {
  it('use cases depend only on MemoryEngine and return application responses', async () => {
    const engine = createTestEngine();
    const storeUseCase = new StoreMemoryUseCase(engine);
    const retrieveUseCase = new RetrieveMemoryUseCase(engine);
    const deleteUseCase = new DeleteMemoryUseCase(engine);
    const searchUseCase = new SearchMemoryUseCase(engine);
    const updateUseCase = new UpdateMemoryUseCase(engine);

    expect(storeUseCase).toBeDefined();
    expect(retrieveUseCase).toBeDefined();
    expect(deleteUseCase).toBeDefined();
    expect(searchUseCase).toBeDefined();
    expect(updateUseCase).toBeDefined();

    const storeResult = await storeUseCase.execute({
      record: {
        id: 'record.fact.boundary',
        type: 'Fact',
        content: {},
        metadata: {},
        timestamp: '2026-07-24T00:00:00.000Z',
      },
    });

    expect(storeResult.ok).toBe(true);
    if (storeResult.ok) {
      expect(storeResult.value.created).toBe(true);
      expect('code' in storeResult.value).toBe(false);
    }
  });
});
