import type { Command } from 'commander';

import type { Container } from '../application/container.js';
import type { CliCommand } from '../registry/command-registry.js';
import { CliExitError, EXIT_COMPILATION_ERROR } from '../output/exit-codes.js';

export class CompileCommand implements CliCommand {
  readonly name = 'compile';

  register(program: Command, container: Container): void {
    program
      .command('compile')
      .description('Compile workspace units through the Atlas Kernel')
      .option('--workspace <path>', 'workspace directory', process.cwd())
      .option('--json', 'output structured JSON')
      .action(async (options: { workspace: string; json?: boolean }) => {
        const workspace = container.workspaceLoader.load(options.workspace);
        const client = container.atlasService.createClient(workspace);
        const result = await container.atlasService.compile(client, workspace.units);

        if (options.json) {
          container.renderer.json({
            command: 'compile',
            success: result.success,
            lifecycle: result.context.lifecycle,
            artifacts: result.context.artifacts.length,
            diagnostics: result.context.diagnostics.length,
          });
        } else {
          container.renderer.info(`Workspace:   ${workspace.name}`);
          container.renderer.info(`Compilation: ${result.success ? 'SUCCESS' : 'FAILED'}`);
          container.renderer.info(`Lifecycle:   ${result.context.lifecycle}`);
          container.renderer.info(`Artifacts:   ${result.context.artifacts.length}`);
          container.renderer.info(`Diagnostics: ${result.context.diagnostics.length}`);
        }

        if (!result.success) {
          throw new CliExitError(EXIT_COMPILATION_ERROR, 'Compilation failed');
        }
      });
  }
}
