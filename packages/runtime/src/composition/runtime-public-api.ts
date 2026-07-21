import type { RuntimeEventFilter, RuntimeEventHandler } from '../events/types.js';
import type { RuntimePublicApi } from '../api/index.js';
import type { LegacyAtlasRuntimeOptions } from '../compat/legacy-atlas-runtime.js';
import { createLegacyAtlasRuntime } from '../compat/legacy-atlas-runtime.js';
import type { RuntimeDependencies } from './runtime-dependencies.js';

export function createRuntimePublicApi(
  dependencies: RuntimeDependencies,
  compatOptions: LegacyAtlasRuntimeOptions = {},
): RuntimePublicApi {
  const legacyRuntime = createLegacyAtlasRuntime(compatOptions);

  return Object.freeze({
    execution: Object.freeze({
      execute: legacyRuntime.execute.bind(legacyRuntime),
      getExecution(executionId: string) {
        return dependencies.executionEngine.getExecution(executionId);
      },
    }),
    lifecycle: Object.freeze({
      getCurrentStage(executionId: string) {
        return dependencies.lifecycleManager.getCurrentStage(executionId);
      },
      getHistory(executionId: string) {
        return dependencies.lifecycleManager.getHistory(executionId);
      },
    }),
    tasks: Object.freeze({
      listTasks(executionId: string) {
        return dependencies.taskScheduler.listTasks(executionId);
      },
      getTask(taskId: string) {
        return dependencies.taskScheduler.getTask(taskId);
      },
      getDependencies(taskId: string) {
        return dependencies.taskScheduler.getDependencies(taskId);
      },
    }),
    workflows: Object.freeze({
      getWorkflow(workflowId: string) {
        return dependencies.workflowEngine.getWorkflow(workflowId);
      },
      listWorkflows(executionId: string) {
        return dependencies.workflowEngine.listWorkflows(executionId);
      },
      getStages(workflowId: string) {
        return dependencies.workflowEngine.getStages(workflowId);
      },
    }),
    events: Object.freeze({
      query(filter: RuntimeEventFilter) {
        return dependencies.eventDispatcher.query(filter);
      },
      subscribe(handler: RuntimeEventHandler) {
        return dependencies.eventDispatcher.subscribe(handler);
      },
    }),
    diagnostics: Object.freeze({
      getSnapshot(executionId: string) {
        return dependencies.diagnostics.getSnapshot(executionId);
      },
    }),
  });
}
