/**
 * Opaque operation request payload.
 * @see ATLAS-100 §12 Input Contract (request)
 */
export interface EngineRequest {
  readonly [key: string]: unknown;
}
