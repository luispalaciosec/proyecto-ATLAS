import type { Command } from 'commander';

import type { Container } from '../application/container.js';
import type { CliCommand } from '../registry/command-registry.js';
import { CliExitError, EXIT_INVALID_ARGUMENTS } from '../output/exit-codes.js';

export class PlanCommand implements CliCommand {
  readonly name = 'plan';

  register(program: Command, container: Container): void {
    program
      .command('plan')
      .description('Plan a goal into a workflow, compile it, and execute through the Atlas Kernel')
      .requiredOption('--goal <text>', 'goal to plan and execute')
      .option('--workspace <path>', 'workspace directory')
      .option('--json', 'output structured JSON')
      .action(async (options: { goal: string; workspace?: string; json?: boolean }) => {
        if (options.goal.trim().length === 0) {
          throw new CliExitError(EXIT_INVALID_ARGUMENTS, 'Goal must not be empty');
        }

        const client = options.workspace
          ? container.atlasService.createClient(
              container.workspaceLoader.load(options.workspace),
            )
          : container.atlasService.createClient();
        const { planning, compile, execute } = await container.atlasService.planAndExecute(
          client,
          options.goal,
        );

        if (options.json) {
          container.renderer.json({
            command: 'plan',
            success: execute.success,
            goal: options.goal,
            workflow_id: planning.workflow?.identity.workflow_id,
            compilation: {
              lifecycle: compile.context.lifecycle,
              artifacts: compile.context.artifacts.length,
            },
            execution: {
              lifecycle: execute.context.lifecycle,
              outputs: execute.context.outputs.length,
              session_id: execute.context.session_id.toJSON(),
            },
          });
        } else {
          container.renderer.info(`Goal:       ${options.goal}`);
          container.renderer.info(`Workflow:   ${planning.workflow?.identity.workflow_id ?? 'n/a'}`);
          container.renderer.info(`Compilation: ${compile.success ? 'SUCCESS' : 'FAILED'}`);
          container.renderer.info(`Execution:   ${execute.success ? 'SUCCESS' : 'FAILED'}`);
          container.renderer.info(`Lifecycle:   ${execute.context.lifecycle}`);
          container.renderer.info(`Outputs:     ${execute.context.outputs.length}`);
          container.renderer.info(`Session:     ${execute.context.session_id.toJSON()}`);
        }
      });
  }
}
