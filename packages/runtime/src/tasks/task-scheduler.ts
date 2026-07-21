import type { TaskDependency, TaskSnapshot } from './types.js';

/**
 * @see ATLAS-RUNTIME-004
 * @see ATLAS-RUNTIME-009 §3 Task Scheduler
 */
export interface TaskScheduler {
  readonly component: 'task-scheduler';

  listTasks(executionId: string): readonly TaskSnapshot[];

  getTask(taskId: string): TaskSnapshot | null;

  getDependencies(taskId: string): TaskDependency | null;
}
