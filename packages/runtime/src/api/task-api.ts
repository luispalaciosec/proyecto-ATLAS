import type { TaskDependency, TaskSnapshot } from '../tasks/types.js';

/**
 * @see ATLAS-RUNTIME-100 §6 Task API
 */
export interface TaskApi {
  listTasks(executionId: string): readonly TaskSnapshot[];

  getTask(taskId: string): TaskSnapshot | null;

  getDependencies(taskId: string): TaskDependency | null;
}
