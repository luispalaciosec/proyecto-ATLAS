#!/usr/bin/env node
/**
 * Live verification for ATLAS 4.2 Decision + Evidence via /api/chat.
 * Run after `pnpm build` from repo root:
 *   node packages/sdk/scripts/verify-atlas42-live.mjs
 */
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const originalFetch = globalThis.fetch;

function extractLatestToolResult(body) {
  for (let index = (body.messages ?? []).length - 1; index >= 0; index -= 1) {
    const message = body.messages[index];

    if (message.role !== 'user' || !Array.isArray(message.content)) {
      continue;
    }

    for (const block of message.content) {
      if (block.type === 'tool_result' && typeof block.content === 'string') {
        return block.content;
      }
    }
  }

  return undefined;
}

function stubAnthropicForAtlas42() {
  globalThis.fetch = async (input, init) => {
    const url = String(input);

    if (!url.includes('anthropic.com')) {
      return originalFetch(input, init);
    }

    const body =
      typeof init?.body === 'string'
        ? JSON.parse(init.body)
        : init?.body !== undefined
          ? JSON.parse(String(init.body))
          : {};

    const toolResultText = extractLatestToolResult(body);

    if (typeof toolResultText === 'string' && toolResultText.length > 0) {
      return Response.json({
        content: [{ type: 'text', text: toolResultText }],
        stop_reason: 'end_turn',
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }

    const lastUser = [...(body.messages ?? [])]
      .reverse()
      .find((message) => message.role === 'user' && typeof message.content === 'string');
    const goal = typeof lastUser?.content === 'string' ? lastUser.content : '';
    const normalizedGoal = goal.toLowerCase();

    const toolResponse = (id, name, input) =>
      Response.json({
        content: [{ type: 'tool_use', id, name, input }],
        stop_reason: 'tool_use',
        usage: { input_tokens: 1, output_tokens: 1 },
      });

    if (normalizedGoal.startsWith('[seed-fixtures]')) {
      return toolResponse('toolu_seed_done', 'memory_store', {
        content: 'ATLAS 4.1 graph seeded via fixtures (out of band)',
      });
    }

    if (normalizedGoal.startsWith('[record-evidence]')) {
      return toolResponse('toolu_record_evidence', 'org_record_evidence', {
        entityId: 'record.evidence.andes-renewal-2023',
        content: 'cliente en renovación continua desde 2023, sin incidentes de pago',
        sourceType: 'manual',
        recordedBy: 'SalesDirector',
        recordedAt: '2026-08-15',
      });
    }

    if (normalizedGoal.startsWith('[record-decision]')) {
      return toolResponse('toolu_record_decision', 'org_record_decision', {
        entityId: 'record.decision.andes-discount-2026-08-15',
        content: {
          subjectType: 'discount_request',
          clientLegalName: 'Constructora Andes S.A.',
          requestedPercent: 12,
          outcome: 'approved',
          approvedPercent: 12,
          decidedBy: 'SalesDirector',
          decidedAt: '2026-08-15',
          requestId: 'req.andes-discount-2026-08',
        },
        targetEntityId: 'record.client.constructora-andes',
        evidenceIds: ['record.evidence.andes-renewal-2023'],
      });
    }

    if (normalizedGoal.includes('aprob') && normalizedGoal.includes('andes')) {
      return toolResponse('toolu_resolve_decision', 'org_resolve_decision', {
        clientLegalName: 'Constructora Andes S.A.',
        subjectType: 'discount_request',
      });
    }

    return Response.json({
      content: [{ type: 'text', text: 'Verificación ATLAS 4.2 completada.' }],
      stop_reason: 'end_turn',
      usage: { input_tokens: 1, output_tokens: 1 },
    });
  };
}

async function withServer(app, run) {
  const server = createServer(app);

  const baseUrl = await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (address === null || typeof address !== 'object') {
        reject(new Error('Unable to resolve verification server port'));
        return;
      }

      resolve(`http://127.0.0.1:${address.port}`);
    });
  });

  try {
    return await run(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve(undefined);
      });
    });
  }
}

async function postChat(baseUrl, goal) {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ goal }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(`Chat failed (${response.status}): ${JSON.stringify(payload)}`);
  }

  return payload;
}

async function main() {
  const root = mkdtempSync(join(tmpdir(), 'atlas-42-live-'));
  const atlasDir = join(root, '.atlas');
  mkdirSync(atlasDir, { recursive: true });
  const memoryFile = join(atlasDir, 'memory.json');

  process.env.ATLAS_MEMORY_FILE = memoryFile;
  process.env.ATLAS_LLM_API_KEY = 'live-verify-key';
  process.env.ATLAS_LLM_MODEL = 'claude-live-verify';
  process.env.ATLAS_LLM_PROVIDER = 'anthropic';

  stubAnthropicForAtlas42();

  const { createAtlas } = await import(
    pathToFileURL(join(process.cwd(), 'packages/sdk/dist/index.js')).href
  );
  const { createWebServer } = await import(
    pathToFileURL(join(process.cwd(), 'apps/web/dist/server.js')).href
  );

  const atlas = createAtlas({
    memory: { storageFilePath: memoryFile },
    llm: {
      apiKey: process.env.ATLAS_LLM_API_KEY,
      model: process.env.ATLAS_LLM_MODEL,
      providerId: 'anthropic',
    },
  });

  await atlas.org.upsertEntity(
    'Client',
    'record.client.constructora-andes',
    Object.freeze({
      legalName: 'Constructora Andes S.A.',
      segment: 'VIP',
      renewalActive: true,
    }),
  );
  await atlas.org.upsertEntity(
    'DiscountPolicy',
    'record.policy.discount.autonomous',
    Object.freeze({
      policyCode: 'DISCOUNT-VIP-2026',
      autonomousMaxPercent: 10,
      currency: 'USD',
    }),
  );
  await atlas.org.upsertEntity(
    'ApprovalRule',
    'record.rule.discount-approval',
    Object.freeze({
      appliesWhen: 'discountPercent > autonomousMaxPercent',
      approverRole: 'SalesDirector',
      approverQueue: 'sales-directors',
    }),
  );
  await atlas.org.linkEntities(
    'record.client.constructora-andes',
    'record.policy.discount.autonomous',
    'reference',
  );
  await atlas.org.linkEntities(
    'record.policy.discount.autonomous',
    'record.rule.discount-approval',
    'dependency',
  );

  const goals = [
    '[record-evidence] Registrar evidencia de renovación Andes',
    '[record-decision] Registrar aprobación del 12% por SalesDirector',
    '¿Quién aprobó el descuento de Constructora Andes y por qué?',
  ];

  const answers = [];

  for (const goal of goals) {
    const app = createWebServer();

    await withServer(app, async (baseUrl) => {
      const payload = await postChat(baseUrl, goal);
      answers.push({
        question: goal,
        llm_message: payload.llm_message ?? payload.message ?? JSON.stringify(payload),
        mode: payload.mode,
        success: payload.success,
      });
    });
  }

  globalThis.fetch = originalFetch;
  rmSync(root, { recursive: true, force: true });

  console.log(JSON.stringify({ answers }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
