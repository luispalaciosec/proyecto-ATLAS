import type { ArtifactExecutor } from '../contracts/artifact-executor.js';

export class ExecutorRegistry {
  readonly #executors = new Map<string, ArtifactExecutor>();

  register(executor: ArtifactExecutor): void {
    if (this.#executors.has(executor.kind)) {
      throw new Error(`Executor already registered for kind: ${executor.kind}`);
    }

    this.#executors.set(executor.kind, executor);
  }

  resolve(kind: string): ArtifactExecutor | undefined {
    return this.#executors.get(kind);
  }

  list(): readonly ArtifactExecutor[] {
    return Object.freeze([...this.#executors.values()]);
  }
}

export function createExecutorRegistry(
  executors: readonly ArtifactExecutor[] = [],
): ExecutorRegistry {
  const registry = new ExecutorRegistry();

  for (const executor of executors) {
    registry.register(executor);
  }

  return registry;
}
