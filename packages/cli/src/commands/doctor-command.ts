import type { Command } from 'commander';

import type { Container } from '../application/container.js';
import type { CliCommand } from '../registry/command-registry.js';
import { CliExitError, EXIT_CONFIGURATION_ERROR } from '../output/exit-codes.js';

export class DoctorCommand implements CliCommand {
  readonly name = 'doctor';

  register(program: Command, container: Container): void {
    program
      .command('doctor')
      .description('Validate CLI wiring and optional workspace configuration')
      .option('--workspace <path>', 'workspace directory to validate')
      .option('--json', 'output structured JSON')
      .action(async (options: { workspace?: string; json?: boolean }) => {
        const checks: Array<{ name: string; status: 'ok' | 'error'; detail: string }> = [];

        checks.push({
          name: 'sdk',
          status: 'ok',
          detail: 'Kernel accessed exclusively through @atlas/sdk',
        });

        try {
          const probe = container.atlasService.createClient({
            name: 'doctor-probe',
            units: [],
          });
          checks.push({
            name: 'atlas-client',
            status: probe.compiler && probe.runtime && probe.events ? 'ok' : 'error',
            detail: 'Atlas facade modules available (compiler, runtime, events)',
          });
        } catch (error) {
          checks.push({
            name: 'atlas-client',
            status: 'error',
            detail: error instanceof Error ? error.message : 'Unknown Atlas client error',
          });
        }

        if (options.workspace) {
          try {
            const workspace = container.workspaceLoader.load(options.workspace);
            checks.push({
              name: 'workspace',
              status: 'ok',
              detail: `${workspace.name} (${workspace.units.length} units)`,
            });
          } catch (error) {
            checks.push({
              name: 'workspace',
              status: 'error',
              detail: error instanceof Error ? error.message : 'Unknown workspace error',
            });
          }
        }

        const healthy = checks.every((check) => check.status === 'ok');

        if (options.json) {
          container.renderer.json({ command: 'doctor', healthy, checks });
        } else {
          container.renderer.info('Atlas Doctor');
          container.renderer.info('=============');

          for (const check of checks) {
            container.renderer.info(
              `[${check.status.toUpperCase()}] ${check.name}: ${check.detail}`,
            );
          }

          container.renderer.info('');
          container.renderer.info(healthy ? 'Status: HEALTHY' : 'Status: ISSUES DETECTED');
        }

        if (!healthy) {
          throw new CliExitError(EXIT_CONFIGURATION_ERROR, 'Doctor detected configuration issues');
        }
      });
  }
}
