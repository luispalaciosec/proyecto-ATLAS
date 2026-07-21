import type { TaskScheduler } from './task-scheduler.js';

export function createTaskScheduler(): TaskScheduler {
  return {
    component: 'task-scheduler',
    listTasks() {
      return Object.freeze([]);
    },
    getTask() {
      return null;
    },
    getDependencies() {
      return null;
    },
  };
}
