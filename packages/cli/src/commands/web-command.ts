import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Command } from 'commander';

import type { Container } from '../application/container.js';
import type { CliCommand } from '../registry/command-registry.js';

function resolveWebHost(): string {
  const fromEnv = process.env.ATLAS_WEB_HOST;

  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }

  return '127.0.0.1';
}

function resolveWebPort(): number {
  const fromEnv = process.env.ATLAS_WEB_PORT;

  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    const parsed = Number.parseInt(fromEnv, 10);

    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return 4173;
}

function formatWebUrl(host: string, port: number): string {
  const displayHost = host === '0.0.0.0' || host === '::' ? '127.0.0.1' : host;

  return `http://${displayHost}:${port}`;
}

export function resolveWebServerPath(): string {
  const require = createRequire(import.meta.url);

  try {
    const packageJsonPath = require.resolve('@atlas/web/package.json');

    return join(dirname(packageJsonPath), 'dist', 'server.js');
  } catch {
    return join(
      fileURLToPath(new URL('../../../../apps/web/dist/server.js', import.meta.url)),
    );
  }
}

export class WebCommand implements CliCommand {
  readonly name = 'web';

  register(program: Command, container: Container): void {
    program
      .command('web')
      .description('Start the local Atlas Web interface')
      .action(async () => {
        const host = resolveWebHost();
        const port = resolveWebPort();
        const serverPath = resolveWebServerPath();

        container.renderer.info(`Starting Atlas Web at ${formatWebUrl(host, port)}`);

        const child = spawn(process.execPath, [serverPath], {
          stdio: 'inherit',
          env: process.env,
        });

        await new Promise<void>((resolve, reject) => {
          child.once('error', reject);
          child.once('exit', (code) => {
            if (code === 0 || code === null) {
              resolve();
              return;
            }

            reject(new Error(`Atlas Web exited with code ${code ?? 'unknown'}`));
          });
        });
      });
  }
}
