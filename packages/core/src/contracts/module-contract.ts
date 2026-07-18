import type { EngineInput } from './input.js';
import type { EngineOutput } from './output.js';

/**
 * Formal module contract for Engine modules.
 * @see ATLAS-100 §8 Engine Interfaces
 */
export interface EngineModuleContract<TInput extends Record<string, unknown>, TOutput> {
  readonly module: string;
  execute(input: EngineInput & TInput): Promise<EngineOutput<TOutput>>;
}
