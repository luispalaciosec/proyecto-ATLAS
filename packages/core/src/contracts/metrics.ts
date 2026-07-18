/**
 * Execution metrics emitted by engine modules.
 * @see ATLAS-100 §12 Output Contract (metrics)
 */
export interface EngineMetrics {
  readonly [key: string]: number | string | boolean | undefined;
}
