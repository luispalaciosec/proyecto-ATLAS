import type { EngineConfiguration } from './configuration.js';
import type { EngineContext } from './context.js';
import type { EngineMetadata } from './metadata.js';
import type { EngineRequest } from './request.js';

/**
 * Engine module input contract.
 * @see ATLAS-100 §12 Input Contract
 */
export interface EngineInput {
  readonly context: EngineContext;
  readonly request: EngineRequest;
  readonly configuration: EngineConfiguration;
  readonly metadata: EngineMetadata;
}
