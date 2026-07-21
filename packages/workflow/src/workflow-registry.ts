import type { WorkflowDefinition } from './workflow-model.js';

export interface WorkflowRegistry {
  register(definition: WorkflowDefinition): void;

  get(workflowId: string, workflowVersion?: string): WorkflowDefinition | null;

  list(): readonly WorkflowDefinition[];
}

export function createWorkflowRegistry(
  definitions: readonly WorkflowDefinition[] = [],
): WorkflowRegistry {
  const store = new Map<string, WorkflowDefinition>();

  function key(definition: WorkflowDefinition): string {
    return `${definition.identity.workflow_id}@${definition.identity.workflow_version}`;
  }

  for (const definition of definitions) {
    store.set(key(definition), definition);
  }

  return {
    register(definition) {
      const registryKey = key(definition);

      if (store.has(registryKey)) {
        throw new Error(`Workflow already registered: ${registryKey}`);
      }

      store.set(registryKey, Object.freeze(definition));
    },

    get(workflowId, workflowVersion) {
      if (workflowVersion) {
        return store.get(`${workflowId}@${workflowVersion}`) ?? null;
      }

      const matches = [...store.values()].filter(
        (definition) => definition.identity.workflow_id === workflowId,
      );

      return matches[0] ?? null;
    },

    list() {
      return Object.freeze([...store.values()]);
    },
  };
}
