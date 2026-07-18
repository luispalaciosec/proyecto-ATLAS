import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Command } from 'commander';

import type { Container } from '../application/container.js';
import type { CliCommand } from '../registry/command-registry.js';

function readPackageVersion(): string {
  const currentDir = dirname(fileURLToPath(import.meta.url));
  const candidates = [join(currentDir, '../package.json'), join(currentDir, '../../package.json')];

  for (const candidate of candidates) {
    try {
      const raw = JSON.parse(readFileSync(candidate, 'utf8')) as { version?: string };
      if (raw.version) {
        return raw.version;
      }
    } catch {
      continue;
    }
  }

  return '0.0.0';
}

export class VersionCommand implements CliCommand {
  readonly name = 'version';

  register(program: Command, container: Container): void {
    program
      .command('version')
      .description('Show Atlas CLI and Kernel facade version')
      .option('--json', 'output structured JSON')
      .action((options: { json?: boolean }) => {
        const payload = {
          cli: readPackageVersion(),
          kernel: {
            facade: '@atlas/sdk',
            packages: [
              '@atlas/core',
              '@atlas/compiler',
              '@atlas/events',
              '@atlas/runtime',
              '@atlas/sdk',
            ],
          },
        };

        if (options.json) {
          container.renderer.json(payload);
        } else {
          container.renderer.info(`Atlas CLI ${payload.cli}`);
          container.renderer.info(`Kernel facade: ${payload.kernel.facade}`);
        }
      });
  }
}

export { readPackageVersion };
