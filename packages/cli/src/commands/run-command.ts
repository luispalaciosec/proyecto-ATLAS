import type { Command } from 'commander';

import type { Container } from '../application/container.js';
import type { CliCommand } from '../registry/command-registry.js';

export class RunCommand implements CliCommand {
  readonly name = 'run';

  register(program: Command, container: Container): void {
    program
      .command('run')
      .description('Compile and execute workspace artifacts through the Atlas Kernel')
      .option('--workspace <path>', 'workspace directory', process.cwd())
      .option('--json', 'output structured JSON')
      .action(async (options: { workspace: string; json?: boolean }) => {
        const workspace = container.workspaceLoader.load(options.workspace);
        const client = container.atlasService.createClient(workspace);
        const { compile, execute } = await container.atlasService.compileAndExecute(
          client,
          workspace.units,
        );

        if (options.json) {
          container.renderer.json({
            command: 'run',
            success: execute.success,
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
          container.renderer.info(`Workspace:   ${workspace.name}`);
          container.renderer.info(`Compilation: ${compile.success ? 'SUCCESS' : 'FAILED'}`);
          container.renderer.info(`Execution:   ${execute.success ? 'SUCCESS' : 'FAILED'}`);
          container.renderer.info(`Lifecycle:   ${execute.context.lifecycle}`);
          container.renderer.info(`Outputs:     ${execute.context.outputs.length}`);
          container.renderer.info(`Session:     ${execute.context.session_id.toJSON()}`);
        }
      });
  }
}
