import type {
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmProvider,
} from '../provider.js';

export interface FakeLlmProviderHandle {
  readonly provider: LlmProvider;
  readonly requests: readonly LlmCompletionRequest[];
}

export function createFakeLlmProvider(
  script: readonly LlmCompletionResult[],
): LlmProvider {
  return createFakeLlmProviderWithRequests(script).provider;
}

export function createFakeLlmProviderWithRequests(
  script: readonly LlmCompletionResult[],
): FakeLlmProviderHandle {
  const requests: LlmCompletionRequest[] = [];
  let index = 0;

  const provider: LlmProvider = Object.freeze({
    id: 'fake',
    async complete(request: LlmCompletionRequest): Promise<LlmCompletionResult> {
      requests.push(request);

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

  return Object.freeze({
    provider,
    get requests() {
      return Object.freeze([...requests]);
    },
  });
}
