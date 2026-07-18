/**
 * Opaque execution context resolved by the Context Engine.
 * @see ATLAS-100 §12 Input Contract (context)
 */
export interface EngineContext {
  readonly [key: string]: unknown;
}
