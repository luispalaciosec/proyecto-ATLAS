import type {
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmProvider,
} from '../provider.js';

export function createFakeLlmProvider(
  script: readonly LlmCompletionResult[],
): LlmProvider {
  let index = 0;

  return Object.freeze({
    id: 'fake',
    async complete(_request: LlmCompletionRequest): Promise<LlmCompletionResult> {
      if (index >= script.length) {
        throw new Error(`FakeLlmProvider script exhausted at index ${index}`);
      }

      const result = script[index];
      index += 1;

      if (result === undefined) {
        throw new Error(`FakeLlmProvider script missing result at index ${index - 1}`);
      }

      return result;
    },
  });
}
