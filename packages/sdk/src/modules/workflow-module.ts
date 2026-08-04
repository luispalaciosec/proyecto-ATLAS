import type { CreateCompilationUnitParams } from '@atlas/compiler';
import type { EventBus } from '@atlas/events';
import {
  createWorkflowCompiler,
  type PipelineDefinition,
  type WorkflowCompiler,
  type WorkflowDefinition,
  type WorkflowResult,
} from '@atlas/workflow';

import { WorkflowProjectionAdapter } from '../adapters/workflow-projection-adapter.js';
import type { AtlasWorkflowOptions, AtlasWorkspaceOptions } from '../atlas/options.js';

/**
 * Public workflow facade — wraps @atlas/workflow WorkflowCompiler.
 */
export class WorkflowModule {
  readonly #compiler: WorkflowCompiler;
  readonly #defaultWorkspace: AtlasWorkspaceOptions;
  readonly #projectionAdapter = new WorkflowProjectionAdapter();

  constructor(
    _bus: EventBus,
    _workflowOptions: AtlasWorkflowOptions = {},
    workspace: AtlasWorkspaceOptions = {},
  ) {
    this.#defaultWorkspace = workspace;
    this.#compiler = createWorkflowCompiler();
  }

  getCompiler(): WorkflowCompiler {
    return this.#compiler;
  }

  compileDefinition(definition: WorkflowDefinition): WorkflowResult {
    return this.#compiler.compile(definition);
  }

  projectForCompilation(
    pipeline: PipelineDefinition,
    workflow: WorkflowDefinition,
  ): readonly CreateCompilationUnitParams[] {
    return this.#projectionAdapter.projectToUnits({ pipeline, workflow });
  }

  getDefaultWorkspace(): AtlasWorkspaceOptions {
    return this.#defaultWorkspace;
  }
}
