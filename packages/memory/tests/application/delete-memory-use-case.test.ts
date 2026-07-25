import { describe, expect, it, vi } from 'vitest';

import { DeleteMemoryUseCase } from '../../src/application/use-cases/DeleteMemoryUseCase.js';
import {
  INVALID_MEMORY_RECORD,
  MEMORY_STORAGE_ERROR,
} from '../../src/domain/errors/memory-error-codes.js';
import { memoryErr } from '../../src/internal/result.js';
import { createEngineError, ENGINE_STORE } from '../../src/engine/engine-errors.js';
import { createEngineSpy, createMemoryRecord, createTestEngine } from './test-helpers.js';

describe('DeleteMemoryUseCase', () => {
  it('delegates to MemoryEngine.delete and returns typed response', async () => {
    const record = createMemoryRecord();
    const engine = createTestEngine();
    const useCase = new DeleteMemoryUseCase(engine);

    const result = await useCase.execute({ record, sessionId: 'session.1' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.deleted).toBe(true);
      expect(result.value.recordId).toBe(record.id);
    }
  });

  it('returns validation errors without calling the engine', async () => {
    const engine = createEngineSpy();
    const useCase = new DeleteMemoryUseCase(engine);

    const result = await useCase.execute({
      record: createMemoryRecord({ type: '' }),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(INVALID_MEMORY_RECORD);
    }
    expect(engine.delete).not.toHaveBeenCalled();
  });

  it('maps engine failures to ApplicationError', async () => {
    const engine = createEngineSpy();
    engine.delete = vi.fn().mockResolvedValue(
      memoryErr(createEngineError(ENGINE_STORE, 'delete failed')),
    );
    const useCase = new DeleteMemoryUseCase(engine);

    const result = await useCase.execute({ record: createMemoryRecord() });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe(MEMORY_STORAGE_ERROR);
    }
  });
});
