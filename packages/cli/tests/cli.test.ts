import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it, vi } from 'vitest';

import { CliApp } from '../src/application/cli-app.js';
import { createContainer } from '../src/application/container.js';
import { WORKSPACE_FILE_NAME } from '../src/configuration/workspace-loader.js';
import {
  EXIT_COMPILATION_ERROR,
  EXIT_CONFIGURATION_ERROR,
  EXIT_INVALID_ARGUMENTS,
  EXIT_SUCCESS,
  EXIT_VALIDATION_ERROR,
} from '../src/output/exit-codes.js';
import { AtlasService } from '../src/services/atlas-service.js';

function createWorkspaceDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'atlas-cli-test-'));

  writeFileSync(
    join(dir, WORKSPACE_FILE_NAME),
    JSON.stringify(
      {
        name: 'cli-test-workspace',
        environment: 'memory',
        units: [
          {
            id: 'doc.cli.test',
            origin: 'memory://doc.cli.test',
            checksum: 'sha256:cli-test',
            version: '1.0.0',
            source: { body: 'cli test unit' },
            metadata: { kind: 'DocumentNode' },
          },
        ],
      },
      null,
      2,
    ),
    'utf8',
  );

  return dir;
}

async function run(argv: string[]): Promise<number> {
  const app = new CliApp();
  return app.run(['node', 'atlas', ...argv]);
}

describe('@atlas/cli command registry', () => {
  it('registers compile, run, doctor, and version commands', () => {
    const container = createContainer();
    const names = container.commandRegistry.list().map((command) => command.name);

    expect(names).toEqual(['compile', 'run', 'doctor', 'version']);
  });
});

describe('atlas version', () => {
  it('prints CLI version', async () => {
    const code = await run(['version']);
    expect(code).toBe(EXIT_SUCCESS);
  });

  it('supports json output', async () => {
    const code = await run(['version', '--json']);
    expect(code).toBe(EXIT_SUCCESS);
  });
});

describe('atlas compile', () => {
  it('compiles a workspace successfully', async () => {
    const workspace = createWorkspaceDir();
    const code = await run(['compile', '--workspace', workspace]);

    expect(code).toBe(EXIT_SUCCESS);
  });

  it('supports json output', async () => {
    const workspace = createWorkspaceDir();
    const code = await run(['compile', '--workspace', workspace, '--json']);

    expect(code).toBe(EXIT_SUCCESS);
  });

  it('returns compilation exit code for invalid workspace units', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-cli-invalid-'));
    writeFileSync(
      join(dir, WORKSPACE_FILE_NAME),
      JSON.stringify({ name: 'invalid', units: [{ id: 'only-id' }] }),
      'utf8',
    );

    const code = await run(['compile', '--workspace', dir]);
    expect(code).toBe(EXIT_VALIDATION_ERROR);
  });
});

describe('atlas run', () => {
  it('compiles and executes a workspace', async () => {
    const workspace = createWorkspaceDir();
    const code = await run(['run', '--workspace', workspace, '--json']);

    expect(code).toBe(EXIT_SUCCESS);
  });

  it('prints human-readable output', async () => {
    const workspace = createWorkspaceDir();
    const code = await run(['run', '--workspace', workspace]);

    expect(code).toBe(EXIT_SUCCESS);
  });
});

describe('atlas doctor', () => {
  it('reports healthy status without workspace', async () => {
    const code = await run(['doctor']);
    expect(code).toBe(EXIT_SUCCESS);
  });

  it('supports json output', async () => {
    const code = await run(['doctor', '--json']);
    expect(code).toBe(EXIT_SUCCESS);
  });

  it('validates an existing workspace', async () => {
    const workspace = createWorkspaceDir();
    const code = await run(['doctor', '--workspace', workspace]);

    expect(code).toBe(EXIT_SUCCESS);
  });

  it('detects missing workspace configuration', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-cli-empty-'));
    const code = await run(['doctor', '--workspace', dir]);

    expect(code).toBe(EXIT_CONFIGURATION_ERROR);
  });

  it('detects invalid workspace json', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-cli-bad-json-'));
    writeFileSync(join(dir, WORKSPACE_FILE_NAME), '{ invalid', 'utf8');

    const code = await run(['doctor', '--workspace', dir]);
    expect(code).toBe(EXIT_CONFIGURATION_ERROR);
  });
});

describe('atlas help', () => {
  it('shows help for unknown commands with invalid exit code', async () => {
    const code = await run(['unknown-command']);
    expect(code).toBe(EXIT_INVALID_ARGUMENTS);
  });

  it('shows top-level help', async () => {
    const code = await run(['help']);
    expect(code).toBe(EXIT_SUCCESS);
  });
});

describe('kernel dependency boundary', () => {
  it('depends only on @atlas/sdk and commander', () => {
    const packageJson = JSON.parse(
      readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
    ) as { dependencies?: Record<string, string> };

    expect(Object.keys(packageJson.dependencies ?? {}).sort()).toEqual(['@atlas/sdk', 'commander']);
  });
});

describe('compile failures', () => {
  it('returns compilation exit code when the SDK reports failure', async () => {
    const workspace = createWorkspaceDir();
    vi.spyOn(AtlasService.prototype, 'compile').mockResolvedValue({
      success: false,
      context: {
        lifecycle: 'complete',
        artifacts: [],
        diagnostics: [{ severity: 'error', message: 'forced failure' }],
      },
    } as unknown as Awaited<ReturnType<AtlasService['compile']>>);

    const code = await run(['compile', '--workspace', workspace, '--json']);
    expect(code).toBe(EXIT_COMPILATION_ERROR);

    vi.restoreAllMocks();
  });
});
