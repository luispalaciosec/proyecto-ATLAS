import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { EXIT_SUCCESS } from '../src/output/exit-codes.js';

const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
const rootPackageJson = JSON.parse(
  readFileSync(join(repoRoot, 'package.json'), 'utf8'),
) as { scripts?: Record<string, string> };
const atlasBinPath = join(repoRoot, 'packages/cli/dist/atlas.js');

describe('repository-local atlas bootstrap', () => {
  it('exposes a root pnpm atlas script targeting the built CLI package', () => {
    expect(rootPackageJson.scripts?.atlas).toBe('node packages/cli/dist/atlas.js');
  });

  it('runs pnpm atlas --help from the repository root after build', () => {
    expect(existsSync(atlasBinPath)).toBe(true);

    const result = spawnSync('pnpm', ['atlas', '--help'], {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: 30_000,
    });

    expect(result.status).toBe(EXIT_SUCCESS);
    expect(result.stdout).toContain('Usage: atlas [options] [command]');
    expect(result.stdout).toContain('doctor');
  });

  it('runs pnpm atlas doctor from the repository root after build', () => {
    expect(existsSync(atlasBinPath)).toBe(true);

    const result = spawnSync('pnpm', ['atlas', 'doctor'], {
      cwd: repoRoot,
      encoding: 'utf8',
      timeout: 30_000,
    });

    expect(result.status).toBe(EXIT_SUCCESS);
    expect(result.stdout).toContain('Status: HEALTHY');
  });
});
