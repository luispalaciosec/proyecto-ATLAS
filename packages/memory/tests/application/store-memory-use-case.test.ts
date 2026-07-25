import { describe, expect, it, vi } from 'vitest';

import { StoreMemoryUseCase } from '../../src/application/use-cases/StoreMemoryUseCase.js';
import {
  INVALID_MEMORY_RECORD,
  MEMORY_STORAGE_ERROR,
} from '../../src/domain/errors/memory-error-codes.js';
import { memoryErr, memoryOk } from '../../src/internal/result.js';
import { createEngineError, ENGINE_STORE } from '../../src/engine/engine-errors.js';
import { createEngineSpy, createMemoryRecord, createTestEngine } from './test-helpers.js';

describe('StoreMemoryUseCase', () => {
  it('delegates valid requests to MemoryEngine.store', async () => {
    const engine = createTestEngine();
    const useCase = new StoreMemoryUseCase(engine);
    const record = createMemoryRecord();

    const result = await useCase.execute({
      sessionId: 'session.1',
      record,
      metadata: { source: 'application' },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.created).toBe(true);
      expect(result.value.record.metadata.source).toBe('application');
      expect(result.value.version).toBe(1);
    }
  });

  it('returns application validation errors without calling the engine', async () => {
    const engine = createEngineSpy();
    const useCase = new StoreMemoryUseCase(engine);

    const result = await useCase.execute({ record: createMemoryRecord({ id: '' }) });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(INVALID_MEMORY_RECORD);
    }
    expect(engine.store).not.toHaveBeenCalled();
  });

  it('maps engine failures to ApplicationError', async () => {
    const engine = createEngineSpy();
    engine.store = vi.fn().mockResolvedValue(
      memoryErr(createEngineError(ENGINE_STORE, 'store unavailable')),
    );
    const useCase = new StoreMemoryUseCase(engine);

    const result = await useCase.execute({ record: createMemoryRecord() });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(MEMORY_STORAGE_ERROR);
    }
  });

  it('returns Result from @atlas/core without custom wrappers', async () => {
    const engine = createEngineSpy();
    engine.store = vi.fn().mockResolvedValue(memoryOk(createMemoryRecord()));
    const useCase = new StoreMemoryUseCase(engine);

    const result = await useCase.execute({ record: createMemoryRecord() });

    expect(typeof result.ok).toBe('boolean');
    expect('value' in result || 'error' in result).toBe(true);
  });
});
