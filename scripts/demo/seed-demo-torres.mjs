#!/usr/bin/env node
/* global console, process, URL -- Node.js script; the root ESLint config only declares TS globals. */
/**
 * Carga directa de la marca "Demo Torres" con datos FICTICIOS, sin LLM y sin red.
 *
 * Escribe en el mismo almacén que usa ATLAS Web para la marca
 * (<ATLAS_WORKSPACES_ROOT | cwd/.atlas/workspaces>/<slug>/memory.json) usando solo la API
 * pública de @atlas/sdk (createAtlas + atlas.org.*), con las mismas llamadas que hacen las
 * herramientas org_upsert_entity / org_link_entities / org_record_evidence / org_record_decision.
 *
 * Idempotente: compara antes de escribir. No crea versiones de política sin cambios, no duplica
 * evidencias, decisiones ni enlaces. Una evidencia o decisión existente con contenido distinto
 * NO se sobrescribe (son registros inmutables): se informa como conflicto.
 *
 * Uso, desde la raíz del repo y tras `pnpm build`, con ATLAS Web DETENIDO:
 *   pnpm demo:seed [--brand demo-torres] [--dry-run | --verify] [--json]
 *
 * Códigos de salida: 0 correcto · 1 conflictos o verificación fallida · 2 error de entorno/uso.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { connect } from 'node:net';
import { join } from 'node:path';
import { isDeepStrictEqual, parseArgs } from 'node:util';

const DEFAULT_BRAND = 'demo-torres';
const AUTHOR = 'Gerencia Comercial';
const DEFAULT_WEB_PORT = 4173;

const ENTITIES = Object.freeze([
  {
    recordType: 'DiscountPolicy',
    id: 'policy.discount.flete-pesado',
    content: { policyCode: 'TARIFA-CARGA-STD', autonomousMaxPercent: 5, currency: 'USD' },
  },
  {
    recordType: 'ApprovalRule',
    id: 'rule.approval.comercial',
    content: {
      appliesWhen: 'Descuento mayor al 5% sobre la tarifa de flete',
      approverRole: 'Gerente Comercial',
      approverQueue: 'cola-comercial',
    },
  },
  {
    recordType: 'Client',
    id: 'client.importadora-andina-demo',
    content: { legalName: 'Importadora Andina Demo S.A.', segment: 'VIP', renewalActive: true },
  },
  {
    recordType: 'Client',
    id: 'client.comercial-pacifico-demo',
    content: {
      legalName: 'Comercial del Pacifico Demo S.A.',
      segment: 'STANDARD',
      renewalActive: true,
    },
  },
  {
    recordType: 'Client',
    id: 'client.agroexport-costa-demo',
    content: { legalName: 'Agroexport Costa Demo S.A.', segment: 'STANDARD', renewalActive: false },
  },
]);

const LINKS = Object.freeze([
  {
    sourceId: 'policy.discount.flete-pesado',
    targetId: 'rule.approval.comercial',
    type: 'dependency',
  },
  {
    sourceId: 'client.importadora-andina-demo',
    targetId: 'policy.discount.flete-pesado',
    type: 'reference',
  },
  {
    sourceId: 'client.comercial-pacifico-demo',
    targetId: 'policy.discount.flete-pesado',
    type: 'reference',
  },
  {
    sourceId: 'client.agroexport-costa-demo',
    targetId: 'policy.discount.flete-pesado',
    type: 'reference',
  },
]);

const EVIDENCE = Object.freeze([
  {
    id: 'record.evidence.caso-carga-pesada-2026-03',
    content:
      'Caso carga pesada 38 t con plazo ajustado: se aprobo 6% a cambio de renovacion anual con volumen minimo. Margen real 8,5%. Ver documento 02.',
  },
  {
    id: 'record.evidence.politica-tarifas-v3',
    content:
      'Politica de tarifas v3: limite autonomo 5%, excepciones aprueba el Gerente Comercial. Ver documento 01.',
  },
  {
    id: 'record.evidence.resultado-andina-2026-03',
    content:
      'Resultado a 90 dias de la excepcion de marzo 2026 (6% aprobado a cambio de renovacion): entrega a tiempo, el cliente renovo, margen real 8,5%.',
  },
  {
    id: 'record.evidence.resultado-andina-2026-07',
    content:
      'Resultado a 90 dias de la excepcion de julio 2026 (7% aprobado, segunda excepcion en 4 meses, sin contraprestacion clara): el cliente volvio a pedir excepciones tres veces y el margen quedo en 5,8%, bajo el minimo de 8%. Precedente: la excepcion de marzo 2026 si tuvo contraprestacion y funciono.',
  },
  {
    id: 'record.evidence.resultado-pacifico-2026-05',
    content:
      'Resultado a 90 dias del rechazo de mayo 2026: el cliente acepto la tarifa estandar y mantuvo el contrato.',
  },
]);

const DECISIONS = Object.freeze([
  {
    id: 'record.decision.andina-2026-03',
    targetId: 'client.importadora-andina-demo',
    evidenceIds: [
      'record.evidence.caso-carga-pesada-2026-03',
      'record.evidence.politica-tarifas-v3',
      'record.evidence.resultado-andina-2026-03',
    ],
    content: {
      subjectType: 'discount_request',
      clientLegalName: 'Importadora Andina Demo S.A.',
      requestedPercent: 8,
      outcome: 'approved',
      approvedPercent: 6,
      decidedBy: 'Gerente Comercial',
      decidedAt: '2026-03-12',
      notes:
        'Carga pesada con plazo ajustado. Se aprobo 6% a cambio de renovacion anual con volumen minimo. Resultado a 90 dias: entrega a tiempo, cliente renovo, margen real 8,5%.',
    },
  },
  {
    id: 'record.decision.pacifico-2026-05',
    targetId: 'client.comercial-pacifico-demo',
    evidenceIds: [
      'record.evidence.politica-tarifas-v3',
      'record.evidence.resultado-pacifico-2026-05',
    ],
    content: {
      subjectType: 'discount_request',
      clientLegalName: 'Comercial del Pacifico Demo S.A.',
      requestedPercent: 10,
      outcome: 'rejected',
      decidedBy: 'Gerente Comercial',
      decidedAt: '2026-05-20',
      notes:
        'Pedia 10% sin volumen comprometido. Se rechazo. Resultado a 90 dias: el cliente acepto tarifa estandar y mantuvo el contrato.',
    },
  },
  {
    id: 'record.decision.andina-2026-07',
    targetId: 'client.importadora-andina-demo',
    evidenceIds: [
      'record.evidence.politica-tarifas-v3',
      'record.evidence.resultado-andina-2026-07',
    ],
    content: {
      subjectType: 'discount_request',
      clientLegalName: 'Importadora Andina Demo S.A.',
      requestedPercent: 12,
      outcome: 'approved',
      approvedPercent: 7,
      decidedBy: 'Gerente Comercial',
      decidedAt: '2026-07-02',
      notes:
        'Segunda excepcion en 4 meses para el mismo cliente. Sin contraprestacion clara. Resultado a 90 dias: el cliente volvio a pedir excepciones tres veces y el margen quedo en 5,8%, bajo el minimo de 8%. Precedente: record.decision.andina-2026-03.',
    },
  },
]);

class UsageError extends Error {}

function parseCliArgs(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      brand: { type: 'string', default: DEFAULT_BRAND },
      'dry-run': { type: 'boolean', default: false },
      verify: { type: 'boolean', default: false },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    strict: true,
  });

  if (values['dry-run'] && values.verify) {
    throw new UsageError('Usa --dry-run o --verify, no ambos.');
  }

  if (!/^[a-z0-9][a-z0-9-]*$/.test(values.brand)) {
    throw new UsageError(`--brand debe ser el id (slug) de la marca, p. ej. ${DEFAULT_BRAND}.`);
  }

  return {
    brand: values.brand,
    mode: values.verify ? 'verify' : values['dry-run'] ? 'dry-run' : 'write',
    json: values.json,
    help: values.help,
  };
}

function resolveWorkspacesRoot() {
  const fromEnv = process.env.ATLAS_WORKSPACES_ROOT;

  return typeof fromEnv === 'string' && fromEnv.trim().length > 0
    ? fromEnv.trim()
    : join(process.cwd(), '.atlas', 'workspaces');
}

function resolveWebPort() {
  const parsed = Number.parseInt(process.env.ATLAS_WEB_PORT ?? '', 10);

  return Number.isNaN(parsed) || parsed <= 0 ? DEFAULT_WEB_PORT : parsed;
}

/** True when something accepts connections on the ATLAS Web port (likely the web server). */
function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = connect({ port, host: '127.0.0.1' });
    const done = (inUse) => {
      socket.destroy();
      resolve(inUse);
    };

    socket.setTimeout(500, () => done(false));
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
  });
}

/** Guarantees the "no network" rule: any accidental fetch (e.g. an LLM call) fails loudly. */
function disableNetwork() {
  globalThis.fetch = async () => {
    throw new Error('demo:seed no usa la red (fetch deshabilitado).');
  };
}

async function loadSdk() {
  const entry = new URL('../../packages/sdk/dist/index.js', import.meta.url);

  if (!existsSync(entry)) {
    throw new UsageError('No se encontró packages/sdk/dist. Ejecuta `pnpm build` primero.');
  }

  return import(entry.href);
}

function recordEntityId(record) {
  const value = record.metadata?.entityId;

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : record.id;
}

/** Same text extraction as the SDK (string content or `{ text }`). */
function readRecordText(record) {
  if (typeof record.content === 'string') {
    return record.content;
  }

  if (typeof record.content?.text === 'string') {
    return record.content.text;
  }

  return JSON.stringify(record.content);
}

/** Same reading as the SDK's readEntityPayload: the stored JSON without entityId/recordType. */
function readPayload(record) {
  const text = readRecordText(record);
  const payload = { ...JSON.parse(text) };

  delete payload.entityId;
  delete payload.recordType;

  return payload;
}

function changedFields(current, expected) {
  const keys = new Set([...Object.keys(current), ...Object.keys(expected)]);

  return [...keys].filter((key) => !isDeepStrictEqual(current[key], expected[key])).sort();
}

/** Latest stored record per entityId for a journal type (Evidence/Decision), plus duplicates. */
async function indexJournal(atlas, recordType) {
  const { records } = await atlas.memory.listRecords({ recordType });
  const byId = new Map();
  const counts = new Map();

  for (const record of records) {
    const id = recordEntityId(record);
    counts.set(id, (counts.get(id) ?? 0) + 1);

    const existing = byId.get(id);

    if (existing === undefined || record.timestamp.localeCompare(existing.timestamp) > 0) {
      byId.set(id, record);
    }
  }

  return { byId, counts };
}

/**
 * Existing relationships as "source|type|target" keys. Read directly from the Relationship
 * records instead of atlas.org.getRelated: getRelated resolves several targets in parallel and
 * the memory engine rejects concurrent reads ("already has an active execution").
 */
async function indexLinks(atlas) {
  const { records } = await atlas.memory.listRecords({ recordType: 'Relationship' });
  const keys = new Set();

  for (const record of records) {
    const { sourceRecord, relationshipType, targetRecord } = readPayload(record);
    keys.add(`${sourceRecord}|${relationshipType}|${targetRecord}`);
  }

  return keys;
}

function emptyCounter() {
  return { created: 0, updated: 0, existing: 0 };
}

function createReport(brand, memoryFilePath, mode) {
  return {
    brand,
    memoryFilePath,
    mode,
    entities: emptyCounter(),
    links: emptyCounter(),
    evidence: emptyCounter(),
    decisions: emptyCounter(),
    actions: [],
    conflicts: [],
    warnings: [],
    checks: [],
    backupPath: undefined,
  };
}

async function syncEntities(atlas, report, write) {
  for (const entity of ENTITIES) {
    const existing = await atlas.org.resolveEntityById(entity.id);

    if (existing !== undefined && existing.type !== entity.recordType) {
      report.conflicts.push(
        `${entity.id}: existe como ${existing.type}, se esperaba ${entity.recordType}.`,
      );
      continue;
    }

    if (existing !== undefined) {
      const fields = changedFields(readPayload(existing), entity.content);

      if (fields.length === 0) {
        report.entities.existing += 1;
        continue;
      }

      report.entities.updated += 1;
      report.actions.push(
        `actualizar ${entity.recordType} ${entity.id} (cambia: ${fields.join(', ')})`,
      );
    } else {
      report.entities.created += 1;
      report.actions.push(`crear ${entity.recordType} ${entity.id}`);
    }

    if (write) {
      // Same call as org_upsert_entity. Only reached when the content really differs,
      // so policies never get a version without changes.
      await atlas.org.upsertEntity(entity.recordType, entity.id, { ...entity.content }, AUTHOR);
    }
  }
}

async function ensureLink(atlas, report, link, write, existingLinks) {
  if (existingLinks.has(`${link.sourceId}|${link.type}|${link.targetId}`)) {
    report.links.existing += 1;
    return;
  }

  report.links.created += 1;
  report.actions.push(`enlazar ${link.sourceId} -[${link.type}]-> ${link.targetId}`);

  if (write) {
    // Same call as org_link_entities (idempotent in the SDK as well).
    await atlas.org.linkEntities(link.sourceId, link.targetId, link.type);
  }
}

async function syncJournal(atlas, report, write) {
  const evidenceIndex = await indexJournal(atlas, 'Evidence');
  const decisionIndex = await indexJournal(atlas, 'Decision');
  const existingLinks = await indexLinks(atlas);
  // Entities exist already or are created by syncEntities before this runs (an entity
  // conflict blocks writing altogether), so they count as present for decisions.
  const presentIds = new Set(ENTITIES.map((entity) => entity.id));

  for (const evidence of EVIDENCE) {
    const expected = { content: evidence.content, sourceType: 'manual', recordedBy: AUTHOR };
    const existing = evidenceIndex.byId.get(evidence.id);

    if ((evidenceIndex.counts.get(evidence.id) ?? 0) > 1) {
      report.warnings.push(
        `${evidence.id} ya estaba duplicada (${evidenceIndex.counts.get(evidence.id)} registros).`,
      );
    }

    if (existing !== undefined) {
      const fields = changedFields(readPayload(existing), expected);

      if (fields.length === 0) {
        report.evidence.existing += 1;
      } else {
        report.conflicts.push(
          `${evidence.id}: ya existe con otro contenido (${fields.join(', ')}); no se sobrescribe.`,
        );
      }

      presentIds.add(evidence.id);
      continue;
    }

    report.evidence.created += 1;
    report.actions.push(`registrar evidencia ${evidence.id}`);
    presentIds.add(evidence.id);

    if (write) {
      // Same payload as org_record_evidence builds.
      await atlas.org.storeEvidence(evidence.id, expected);
    }
  }

  for (const link of LINKS) {
    await ensureLink(atlas, report, link, write, existingLinks);
  }

  for (const decision of DECISIONS) {
    const existing = decisionIndex.byId.get(decision.id);

    if ((decisionIndex.counts.get(decision.id) ?? 0) > 1) {
      report.warnings.push(
        `${decision.id} ya estaba duplicada (${decisionIndex.counts.get(decision.id)} registros).`,
      );
    }

    if (existing === undefined) {
      const missing = decision.evidenceIds.filter((id) => !presentIds.has(id));

      if (missing.length > 0 || !presentIds.has(decision.targetId)) {
        report.conflicts.push(`${decision.id}: faltan registros citados; no se registra.`);
        continue;
      }

      report.decisions.created += 1;
      report.links.created += 1 + decision.evidenceIds.length;
      report.actions.push(
        `registrar decisión ${decision.id} (+${1 + decision.evidenceIds.length} enlaces)`,
      );

      if (write) {
        // Same call as org_record_decision: validates, stores and links resolves/cites.
        await atlas.org.recordDecision(decision.id, { ...decision.content }, decision.targetId, [
          ...decision.evidenceIds,
        ]);
      }

      continue;
    }

    const fields = changedFields(readPayload(existing), decision.content);

    if (fields.length > 0) {
      report.conflicts.push(
        `${decision.id}: ya existe con otro contenido (${fields.join(', ')}); no se sobrescribe.`,
      );
      continue;
    }

    report.decisions.existing += 1;

    // Repair links of an existing decision without duplicating the decision itself.
    const decisionLinks = [
      { sourceId: decision.id, targetId: decision.targetId, type: 'resolves' },
      ...decision.evidenceIds.map((id) => ({ sourceId: decision.id, targetId: id, type: 'cites' })),
    ];

    for (const link of decisionLinks) {
      await ensureLink(atlas, report, link, write, existingLinks);
    }
  }
}

async function runChecks(atlas, report) {
  const check = (label, ok, detail) => report.checks.push({ label, ok, detail });

  try {
    const evaluation = await atlas.org.evaluateDiscountRequest('Importadora Andina Demo S.A.', 10);
    check(
      'Andina 10%: no autónomo, límite 5%, aprueba Gerente Comercial',
      evaluation.autonomous === false &&
        evaluation.limitPercent === 5 &&
        evaluation.approverRole === 'Gerente Comercial',
      `autónomo=${evaluation.autonomous}, límite=${evaluation.limitPercent}%, aprobador=${evaluation.approverRole ?? '—'}`,
    );
  } catch (error) {
    check(
      'Andina 10%: evaluación de descuento',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }

  try {
    const history = await atlas.org.resolveDecisionHistoryWithEvidence(
      'Importadora Andina Demo S.A.',
      'discount_request',
    );
    const decidedAt = history.map((entry) => readPayload(entry.decision).decidedAt);
    const formatted = history.length > 0 ? await atlas.org.formatDecisionHistory(history) : '';

    check(
      'Andina: 2 decisiones, 2026-07-02 primero, con evidencia y "Notas:"',
      history.length === 2 &&
        decidedAt[0] === '2026-07-02' &&
        decidedAt[1] === '2026-03-12' &&
        history.every((entry) => entry.evidence.length > 0) &&
        formatted.includes('Notas:'),
      `decisiones=${history.length} [${decidedAt.join(', ')}], evidencias=[${history
        .map((entry) => entry.evidence.length)
        .join(', ')}]`,
    );
  } catch (error) {
    check(
      'Andina: historial de decisiones',
      false,
      error instanceof Error ? error.message : String(error),
    );
  }
}

function printReport(report) {
  const verb = report.mode === 'write' ? '' : ' (simulado)';
  const line = (label, counter, ending = 'as') =>
    `  ${label.padEnd(11)} cread${ending} ${counter.created} · actualizad${ending} ${counter.updated} · ya existían ${counter.existing}`;

  const modeLabel = {
    write: 'escritura',
    'dry-run': 'simulación (--dry-run): no se escribe nada',
    verify: 'verificación (--verify): no se escribe nada',
  }[report.mode];

  console.log(`Marca: ${report.brand}`);
  console.log(`Almacén: ${report.memoryFilePath}`);
  console.log(`Modo: ${modeLabel}`);

  if (report.backupPath !== undefined) {
    console.log(`Copia de seguridad: ${report.backupPath}`);
  }

  if (report.actions.length > 0 && report.mode !== 'verify') {
    console.log(`\nAcciones${verb}:`);
    for (const action of report.actions) {
      console.log(`  - ${action}`);
    }
  }

  console.log(`\nResumen${verb}:`);
  console.log(line('Entidades', report.entities));
  console.log(line('Enlaces', report.links, 'os'));
  console.log(line('Evidencias', report.evidence));
  console.log(line('Decisiones', report.decisions));

  for (const warning of report.warnings) {
    console.log(`Aviso: ${warning}`);
  }

  for (const conflict of report.conflicts) {
    console.log(`Conflicto: ${conflict}`);
  }

  if (report.checks.length > 0) {
    console.log('\nComprobaciones:');
    for (const result of report.checks) {
      console.log(`  ${result.ok ? '✓' : '✗'} ${result.label} — ${result.detail}`);
    }
  }
}

function isFullyLoaded(report) {
  const pending = (counter) => counter.created + counter.updated;

  return (
    pending(report.entities) +
      pending(report.links) +
      pending(report.evidence) +
      pending(report.decisions) ===
    0
  );
}

async function main(argv) {
  const options = parseCliArgs(argv);

  if (options.help) {
    console.log('Uso: pnpm demo:seed [--brand <slug>] [--dry-run | --verify] [--json]');
    return 0;
  }

  const brandDirectory = join(resolveWorkspacesRoot(), options.brand);
  const memoryFilePath = join(brandDirectory, 'memory.json');

  if (!existsSync(join(brandDirectory, 'profile.json'))) {
    throw new UsageError(
      `La marca "${options.brand}" no existe en ${brandDirectory}. Créala primero desde ATLAS Web.`,
    );
  }

  const report = createReport(options.brand, memoryFilePath, options.mode);
  const port = resolveWebPort();

  if (await isPortInUse(port)) {
    const message = `Hay algo escuchando en el puerto ${port}: probablemente ATLAS Web está corriendo. Detén el servidor (Ctrl+C en su terminal) antes de cargar datos: escribe el mismo memory.json y se pisarían los cambios.`;

    if (options.mode === 'write') {
      console.error(`No se escribió nada. ${message}`);
      return 2;
    }

    report.warnings.push(message);
  }

  disableNetwork();

  const { createAtlas } = await loadSdk();
  // Same workspace name and storage as ATLAS Web's brand client; no LLM options at all.
  const atlas = createAtlas({
    workspace: { name: `brand-${options.brand}`, environment: 'memory' },
    memory: { storageFilePath: memoryFilePath },
  });

  // Plan first (read-only), then write only if there is something to do.
  await syncEntities(atlas, report, false);
  await syncJournal(atlas, report, false);

  const write = options.mode === 'write' && report.conflicts.length === 0 && !isFullyLoaded(report);

  if (write) {
    if (existsSync(memoryFilePath)) {
      report.backupPath = `${memoryFilePath}.bak-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      copyFileSync(memoryFilePath, report.backupPath);
    }

    // Re-run the same comparison while writing, so the summary reflects what was applied.
    const applied = createReport(options.brand, memoryFilePath, options.mode);
    applied.backupPath = report.backupPath;

    await syncEntities(atlas, applied, true);
    await syncJournal(atlas, applied, true);
    Object.assign(report, applied);
  }

  if (options.mode !== 'dry-run') {
    await runChecks(atlas, report);
  }

  if (options.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printReport(report);
  }

  const checksOk = report.checks.every((result) => result.ok);

  if (report.conflicts.length > 0 || !checksOk) {
    return 1;
  }

  if (options.mode === 'verify' && !isFullyLoaded(report)) {
    return 1;
  }

  return 0;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(
      error instanceof UsageError
        ? error.message
        : `Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exitCode = 2;
  },
);
