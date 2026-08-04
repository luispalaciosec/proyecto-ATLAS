import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

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

const memorySuiteDir = mkdtempSync(join(tmpdir(), 'atlas-cli-memory-suite-'));
const memoryFilePath = join(memorySuiteDir, 'memory.json');
const atlasBinPath = fileURLToPath(new URL('../dist/atlas.js', import.meta.url));

beforeAll(() => {
  process.env.ATLAS_MEMORY_FILE = memoryFilePath;
});

afterAll(() => {
  delete process.env.ATLAS_MEMORY_FILE;
  rmSync(memorySuiteDir, { recursive: true, force: true });
});

beforeEach(() => {
  if (existsSync(memoryFilePath)) {
    rmSync(memoryFilePath, { force: true });
  }
});

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
  it('registers compile, run, plan, memory, doctor, and version commands', () => {
    const container = createContainer();
    const names = container.commandRegistry.list().map((command) => command.name);

    expect(names).toEqual(['compile', 'run', 'plan', 'chat', 'memory', 'doctor', 'version']);
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

describe('atlas plan', () => {
  it('plans, compiles, and executes a goal without requiring a workspace file', async () => {
    const code = await run(['plan', '--goal', 'hacer X', '--json']);
    expect(code).toBe(EXIT_SUCCESS);
  });

  it('plans, compiles, and executes a goal with an explicit workspace', async () => {
    const workspace = createWorkspaceDir();
    const code = await run(['plan', '--goal', 'hacer X', '--workspace', workspace, '--json']);

    expect(code).toBe(EXIT_SUCCESS);
  });

  it('prints human-readable output', async () => {
    const workspace = createWorkspaceDir();
    const code = await run(['plan', '--goal', 'hacer X', '--workspace', workspace]);

    expect(code).toBe(EXIT_SUCCESS);
  });

  it('rejects empty goals', async () => {
    const code = await run(['plan', '--goal', '   ']);
    expect(code).toBe(EXIT_INVALID_ARGUMENTS);
  });
});

describe('atlas plan retrieval integration', () => {
  it(
    'shows retrieved memory in plan json output for similar goals',
    () => {
      const memoryFile = join(tmpdir(), `atlas-retrieval-plan-${Date.now()}.json`);
      const env = { ...process.env, ATLAS_MEMORY_FILE: memoryFile };

      const first = spawnSync(
        process.execPath,
        [atlasBinPath, 'plan', '--goal', 'procesar pedido cliente', '--json'],
        { env, encoding: 'utf8', timeout: 30_000 },
      );
      expect(first.status).toBe(EXIT_SUCCESS);

      const second = spawnSync(
        process.execPath,
        [atlasBinPath, 'plan', '--goal', 'procesar pedido urgente', '--json'],
        { env, encoding: 'utf8', timeout: 30_000 },
      );
      expect(second.status).toBe(EXIT_SUCCESS);

      const payload = JSON.parse(second.stdout) as {
        retrieval: { selected: number; prior_goals: string[] };
      };
      expect(payload.retrieval.selected).toBeGreaterThan(0);
      expect(payload.retrieval.prior_goals.some((goal) => goal.includes('procesar pedido'))).toBe(
        true,
      );

      rmSync(memoryFile, { force: true });
    },
    60_000,
  );
});

describe('atlas plan memory integration', () => {
  it('stores plan executions that are searchable via atlas memory search', async () => {
    const app = new CliApp();

    const planCode = await app.run(['node', 'atlas', 'plan', '--goal', 'hacer X', '--json']);
    expect(planCode).toBe(EXIT_SUCCESS);

    const searchCode = await app.run(['node', 'atlas', 'memory', 'search', '--query', 'hacer X', '--json']);
    expect(searchCode).toBe(EXIT_SUCCESS);
  });

  it('keeps distinct plan executions searchable separately', async () => {
    const app = new CliApp();

    expect(await app.run(['node', 'atlas', 'plan', '--goal', 'procesar pedido A', '--json'])).toBe(
      EXIT_SUCCESS,
    );
    expect(await app.run(['node', 'atlas', 'plan', '--goal', 'analizar dataset B', '--json'])).toBe(
      EXIT_SUCCESS,
    );

    expect(await app.run(['node', 'atlas', 'memory', 'search', '--query', 'pedido A', '--json'])).toBe(
      EXIT_SUCCESS,
    );
    expect(await app.run(['node', 'atlas', 'memory', 'search', '--query', 'dataset B', '--json'])).toBe(
      EXIT_SUCCESS,
    );
  });
});

describe('atlas memory', () => {
  it('stores content and returns a record id', async () => {
    const app = new CliApp();
    const code = await app.run(['node', 'atlas', 'memory', 'store', '--content', 'hola mundo', '--json']);
    expect(code).toBe(EXIT_SUCCESS);
  });

  it('searches stored content in the same CLI process session', async () => {
    const app = new CliApp();

    const storeCode = await app.run([
      'node',
      'atlas',
      'memory',
      'store',
      '--content',
      'hola mundo',
      '--json',
    ]);
    expect(storeCode).toBe(EXIT_SUCCESS);

    const searchCode = await app.run(['node', 'atlas', 'memory', 'search', '--query', 'hola', '--json']);
    expect(searchCode).toBe(EXIT_SUCCESS);
  });

  it('rejects empty content', async () => {
    const app = new CliApp();
    const code = await app.run(['node', 'atlas', 'memory', 'store', '--content', '   ']);
    expect(code).toBe(EXIT_INVALID_ARGUMENTS);
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

describe('atlas memory persistence', () => {
  it(
    'survives separate CLI process restarts',
    () => {
      const memoryFile = join(tmpdir(), `atlas-cli-persist-${Date.now()}.json`);
      const env = { ...process.env, ATLAS_MEMORY_FILE: memoryFile };

      const store = spawnSync(
        process.execPath,
        [atlasBinPath, 'memory', 'store', '--content', 'persist across restart', '--json'],
        { env, encoding: 'utf8', timeout: 30_000 },
      );
      expect(store.status).toBe(EXIT_SUCCESS);

      const search = spawnSync(
        process.execPath,
        [atlasBinPath, 'memory', 'search', '--query', 'persist', '--json'],
        { env, encoding: 'utf8', timeout: 30_000 },
      );
      expect(search.status).toBe(EXIT_SUCCESS);

      const payload = JSON.parse(search.stdout) as {
        total: number;
        records: Array<{ content: { text: string } }>;
      };
      expect(payload.total).toBe(1);
      expect(payload.records[0]?.content.text).toBe('persist across restart');

      rmSync(memoryFile, { force: true });
    },
    60_000,
  );
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
