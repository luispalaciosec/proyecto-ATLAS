import { createInMemoryEventBus } from '@atlas/events';

import { CompilerModule } from '../modules/compiler-module.js';
import { EventsModule } from '../modules/events-module.js';
import { LlmModule } from '../modules/llm-module.js';
import { MemoryModule } from '../modules/memory-module.js';
import { GovernanceModule } from '../modules/governance-module.js';
import { OrgMemoryModule } from '../modules/org-memory-module.js';
import { PlanningModule } from '../modules/planning-module.js';
import { RetrievalModule } from '../modules/retrieval-module.js';
import { RuntimeModule } from '../modules/runtime-module.js';
import { WorkflowModule } from '../modules/workflow-module.js';
import type { AtlasOptions } from './options.js';

/**
 * Main SDK facade — SDK-202 §7, §14.
 * Orchestrates Kernel packages without embedding business logic.
 */
export class Atlas {
  readonly compiler: CompilerModule;
  readonly runtime: RuntimeModule;
  readonly memory: MemoryModule;
  readonly retrieval: RetrievalModule;
  readonly planning: PlanningModule;
  readonly workflow: WorkflowModule;
  readonly llm: LlmModule;
  readonly org: OrgMemoryModule;
  readonly governance: GovernanceModule;
  readonly events: EventsModule;

  constructor(options: AtlasOptions = {}) {
    const bus = options.eventBus ?? createInMemoryEventBus();

    this.events = new EventsModule(bus);
    this.compiler = new CompilerModule(bus, options.compiler, options.workspace);
    this.runtime = new RuntimeModule(bus, options.runtime, options.workspace);
    this.memory = new MemoryModule(bus, options.memory, options.workspace);
    this.retrieval = new RetrievalModule(
      bus,
      options.retrieval,
      this.memory.getEngine(),
      options.workspace,
    );
    this.planning = new PlanningModule(bus, options.planning, options.workspace);
    this.workflow = new WorkflowModule(bus, options.workflow, options.workspace);
    this.llm = new LlmModule(bus, options.llm, this, options.workspace);
    this.org = new OrgMemoryModule(this);
    this.governance = new GovernanceModule(this, bus, options.workspace);
  }
}

export function createAtlas(options: AtlasOptions = {}): Atlas {
  return new Atlas(options);
}
