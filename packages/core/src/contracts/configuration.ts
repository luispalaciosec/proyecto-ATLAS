/**
 * Opaque execution configuration.
 * @see ATLAS-100 §12 Input Contract (configuration)
 */
export interface EngineConfiguration {
  readonly [key: string]: unknown;
}
