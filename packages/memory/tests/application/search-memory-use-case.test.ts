import { describe, expect, it, vi } from 'vitest';

import { SearchMemoryUseCase } from '../../src/application/use-cases/SearchMemoryUseCase.js';
import { INVALID_QUERY, MEMORY_STORAGE_ERROR } from '../../src/domain/errors/memory-error-codes.js';
import { memoryErr } from '../../src/internal/result.js';
import { createEngineError, ENGINE_STORE } from '../../src/engine/engine-errors.js';
import { createEngineSpy, createMemoryRecord, createSearchResult, createTestEngine } from './test-helpers.js';

describe('SearchMemoryUseCase', () => {
  it('delegates to MemoryEngine.search and returns typed response', async () => {
    const records = [createMemoryRecord(), createMemoryRecord({ id: 'record.fact.2' })];
    const engine = createTestEngine({
      search: vi.fn().mockResolvedValue(createSearchResult(records)),
    });
    const useCase = new SearchMemoryUseCase(engine);
    const query = { recordType: 'Fact' };

    const result = await useCase.execute({ query, sessionId: 'session.1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.total).toBe(2);
      expect(result.value.records).toHaveLength(2);
      expect(result.value.query).toEqual(query);
    }
  });

  it('rejects invalid queries before calling the engine', async () => {
    const engine = createEngineSpy();
    const useCase = new SearchMemoryUseCase(engine);

    const result = await useCase.execute({ query: { recordType: '  ' } });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(INVALID_QUERY);
    }
    expect(engine.search).not.toHaveBeenCalled();
  });

  it('maps engine failures to ApplicationError', async () => {
    const engine = createEngineSpy();
    engine.search = vi.fn().mockResolvedValue(
      memoryErr(createEngineError(ENGINE_STORE, 'search failed', { canonicalCode: MEMORY_STORAGE_ERROR })),
    );
    const useCase = new SearchMemoryUseCase(engine);

    const result = await useCase.execute({ query: {} });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(MEMORY_STORAGE_ERROR);
    }
  });
});
