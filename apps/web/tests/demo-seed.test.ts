import { spawn } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createServer, type Server } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createAtlas } from '@atlas/sdk';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

/**
 * End-to-end test of scripts/demo/seed-demo-torres.mjs, always on a temporary
 * workspaces root (never on real data). The script runs as a separate process, as in
 * `pnpm demo:seed`, and the result is checked through the public @atlas/sdk API.
 */

const SCRIPT_PATH = fileURLToPath(
  new URL('../../../scripts/demo/seed-demo-torres.mjs', import.meta.url),
);
const BRAND = 'demo-torres';
const ANDINA = 'Importadora Andina Demo S.A.';

interface Counter {
  readonly created: number;
  readonly updated: number;
  readonly existing: number;
}

interface SeedReport {
  readonly entities: Counter;
  readonly links: Counter;
  readonly evidence: Counter;
  readonly decisions: Counter;
  readonly conflicts: readonly string[];
  readonly checks: readonly { readonly label: string; readonly ok: boolean }[];
}

interface SeedRun {
  readonly code: number | null;
  readonly stdout: string;
  readonly stderr: string;
}

let workspacesRoot = '';
let freePort = 0;

function memoryFilePath(): string {
  return join(workspacesRoot, BRAND, 'memory.json');
}

function runSeed(args: readonly string[], port = freePort): Promise<SeedRun> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [SCRIPT_PATH, ...args], {
      cwd: workspacesRoot,
      env: { ...process.env, ATLAS_WORKSPACES_ROOT: workspacesRoot, ATLAS_WEB_PORT: String(port) },
    });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });
    child.once('error', reject);
    child.once('close', (code) => resolve({ code, stdout, stderr }));
  });
}

async function runSeedJson(
  args: readonly string[] = [],
): Promise<SeedReport & { code: number | null }> {
  const run = await runSeed([...args, '--json']);

  return { ...(JSON.parse(run.stdout) as SeedReport), code: run.code };
}

function countStoredRecords(): number {
  return (JSON.parse(readFileSync(memoryFilePath(), 'utf8')) as { records: unknown[] }).records
    .length;
}

/** Opens the brand store exactly like ATLAS Web does (workspace `brand-<slug>`). */
function openBrandAtlas() {
  return createAtlas({
    workspace: { name: `brand-${BRAND}`, environment: 'memory' },
    memory: { storageFilePath: memoryFilePath() },
  });
}

function listen(port = 0): Promise<Server> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

function close(server: Server): Promise<void> {
  return new Promise((resolve) => server.close(() => resolve()));
}

describe('demo:seed (Demo Torres)', () => {
  beforeEach(async () => {
    workspacesRoot = mkdtempSync(join(tmpdir(), 'atlas-demo-seed-'));
    mkdirSync(join(workspacesRoot, BRAND), { recursive: true });
    writeFileSync(join(workspacesRoot, BRAND, 'profile.json'), '{"name":"Demo Torres"}\n');

    // A port nobody listens on, so the "web server running" guard stays quiet.
    const probe = await listen();
    const address = probe.address();
    freePort = typeof address === 'object' && address !== null ? address.port : 0;
    await close(probe);
  });

  afterEach(() => {
    rmSync(workspacesRoot, { recursive: true, force: true });
  });

  it('loads the demo data and passes the business checks', async () => {
    const report = await runSeedJson();

    expect(report.code).toBe(0);
    expect(report.entities).toEqual({ created: 5, updated: 0, existing: 0 });
    expect(report.links).toEqual({ created: 14, updated: 0, existing: 0 });
    expect(report.evidence).toEqual({ created: 5, updated: 0, existing: 0 });
    expect(report.decisions).toEqual({ created: 3, updated: 0, existing: 0 });
    expect(report.conflicts).toEqual([]);
    expect(report.checks.every((check) => check.ok)).toBe(true);

    const atlas = openBrandAtlas();
    const evaluation = await atlas.org.evaluateDiscountRequest(ANDINA, 10);

    expect(evaluation.autonomous).toBe(false);
    expect(evaluation.limitPercent).toBe(5);
    expect(evaluation.approverRole).toBe('Gerente Comercial');

    const history = await atlas.org.resolveDecisionHistoryWithEvidence(ANDINA, 'discount_request');
    const formatted = await atlas.org.formatDecisionHistory(history);

    expect(history).toHaveLength(2);
    expect(history.map((entry) => entry.decision.metadata.entityId)).toEqual([
      'record.decision.andina-2026-07',
      'record.decision.andina-2026-03',
    ]);
    expect(history.map((entry) => entry.evidence.length)).toEqual([2, 3]);
    expect(formatted).toContain('Notas:');
  });

  it('is idempotent: a second run writes nothing and keeps every count', async () => {
    await runSeedJson();
    const recordsAfterFirstRun = countStoredRecords();

    const second = await runSeedJson();

    expect(second.code).toBe(0);
    expect(second.entities).toEqual({ created: 0, updated: 0, existing: 5 });
    expect(second.links).toEqual({ created: 0, updated: 0, existing: 14 });
    expect(second.evidence).toEqual({ created: 0, updated: 0, existing: 5 });
    expect(second.decisions).toEqual({ created: 0, updated: 0, existing: 3 });
    expect(countStoredRecords()).toBe(recordsAfterFirstRun);
    expect(readdirSync(join(workspacesRoot, BRAND)).some((name) => name.includes('.bak-'))).toBe(
      false,
    );

    const verify = await runSeed(['--verify']);
    expect(verify.code).toBe(0);
  });

  it('reuses entities already loaded by chat without adding policy versions', async () => {
    const atlas = openBrandAtlas();

    // What the chat tools left behind: same policy and rule, one client with a different segment.
    await atlas.org.upsertEntity(
      'DiscountPolicy',
      'policy.discount.flete-pesado',
      { policyCode: 'TARIFA-CARGA-STD', autonomousMaxPercent: 5, currency: 'USD' },
      'Gerencia Comercial',
    );
    await atlas.org.upsertEntity('ApprovalRule', 'rule.approval.comercial', {
      appliesWhen: 'Descuento mayor al 5% sobre la tarifa de flete',
      approverRole: 'Gerente Comercial',
      approverQueue: 'cola-comercial',
    });
    await atlas.org.upsertEntity('Client', 'client.agroexport-costa-demo', {
      legalName: 'Agroexport Costa Demo S.A.',
      segment: 'VIP',
      renewalActive: false,
    });

    const report = await runSeedJson();

    expect(report.code).toBe(0);
    expect(report.entities).toEqual({ created: 2, updated: 1, existing: 2 });

    const reopened = openBrandAtlas();
    expect(await reopened.org.getEntityHistory('policy.discount.flete-pesado')).toHaveLength(0);
  });

  it('does not write anything with --dry-run or --verify', async () => {
    const dryRun = await runSeedJson(['--dry-run']);

    expect(dryRun.code).toBe(0);
    expect(dryRun.decisions.created).toBe(3);
    expect(existsSync(memoryFilePath())).toBe(false);

    const verify = await runSeed(['--verify']);

    expect(verify.code).toBe(1);
    expect(existsSync(memoryFilePath())).toBe(false);
  });

  it('refuses to write while something listens on the web port', async () => {
    const busy = await listen();
    const address = busy.address();
    const busyPort = typeof address === 'object' && address !== null ? address.port : 0;

    try {
      const run = await runSeed([], busyPort);

      expect(run.code).toBe(2);
      expect(run.stderr).toContain('No se escribió nada');
      expect(existsSync(memoryFilePath())).toBe(false);
    } finally {
      await close(busy);
    }
  });

  it('rejects an unknown brand', async () => {
    const run = await runSeed(['--brand', 'marca-inexistente']);

    expect(run.code).toBe(2);
    expect(run.stderr).toContain('no existe');
  });
});
