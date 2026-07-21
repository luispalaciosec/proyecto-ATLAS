import type { DiagnosticsApi } from './diagnostics-api.js';
import type { EventApi } from './event-api.js';
import type { ExecutionApi } from './execution-api.js';
import type { LifecycleApi } from './lifecycle-api.js';
import type { TaskApi } from './task-api.js';
import type { WorkflowApi } from './workflow-api.js';

/**
 * @see ATLAS-RUNTIME-100 Runtime Public API
 */
export interface RuntimePublicApi {
  readonly execution: ExecutionApi;
  readonly lifecycle: LifecycleApi;
  readonly tasks: TaskApi;
  readonly workflows: WorkflowApi;
  readonly events: EventApi;
  readonly diagnostics: DiagnosticsApi;
}

export type { DiagnosticsApi } from './diagnostics-api.js';
export type { EventApi } from './event-api.js';
export type { ExecutionApi } from './execution-api.js';
export type { LifecycleApi } from './lifecycle-api.js';
export type { TaskApi } from './task-api.js';
export type { WorkflowApi } from './workflow-api.js';
