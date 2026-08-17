#!/usr/bin/env node
/**
 * Live verification for ATLAS 4.1 org intelligence via /api/chat.
 * Run after `pnpm build` from repo root:
 *   node packages/sdk/scripts/verify-atlas41-live.mjs
 */
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const ORG_NAMESPACE_ID = 'cli.default';

const originalFetch = globalThis.fetch;
let anthropicCallCount = 0;

function serializeOrgContent(content) {
  return JSON.stringify(content);
}

async function storeOrgEntity(atlas, recordType, entityId, content, metadata = {}) {
  await atlas.memory.storeContent({
    content: serializeOrgContent(Object.freeze({ entityId, recordType, ...content })),
    recordType,
    metadata: Object.freeze({
      namespaceId: ORG_NAMESPACE_ID,
      entityId,
      status: 'active',
      revision: 1,
      ...metadata,
    }),
  });
}

async function linkOrgEntities(atlas, sourceId, targetId, relationshipType) {
  const relationshipId = `relationship.${sourceId}.${relationshipType}.${targetId}`;

  await atlas.memory.storeContent({
    content: serializeOrgContent(
      Object.freeze({
        sourceRecord: sourceId,
        targetRecord: targetId,
        relationshipType,
      }),
    ),
    recordType: 'Relationship',
    metadata: Object.freeze({
      namespaceId: ORG_NAMESPACE_ID,
      entityId: relationshipId,
      sourceRecord: sourceId,
      targetRecord: targetId,
      relationshipType,
    }),
  });
}

async function seedFixtures(atlas) {
  await storeOrgEntity(
    atlas,
    'Client',
    'record.client.constructora-andes',
    Object.freeze({
      legalName: 'Constructora Andes S.A.',
      segment: 'VIP',
      renewalActive: true,
    }),
    Object.freeze({ collectionId: 'org.entities' }),
  );

  await storeOrgEntity(
    atlas,
    'DiscountPolicy',
    'record.policy.discount.autonomous',
    Object.freeze({
      policyCode: 'DISCOUNT-VIP-2026',
      autonomousMaxPercent: 10,
      currency: 'USD',
    }),
    Object.freeze({ collectionId: 'org.policies' }),
  );

  await storeOrgEntity(
    atlas,
    'ApprovalRule',
    'record.rule.discount-approval',
    Object.freeze({
      appliesWhen: 'discountPercent > autonomousMaxPercent',
      approverRole: 'SalesDirector',
      approverQueue: 'sales-directors',
    }),
    Object.freeze({ collectionId: 'org.policies' }),
  );

  await linkOrgEntities(
    atlas,
    'record.client.constructora-andes',
    'record.policy.discount.autonomous',
    'reference',
  );

  await linkOrgEntities(
    atlas,
    'record.policy.discount.autonomous',
    'record.rule.discount-approval',
    'dependency',
  );

  await storeOrgEntity(
    atlas,
    'WarrantyPolicy',
    'record.policy.warranty.standard',
    Object.freeze({
      policyCode: 'WARRANTY-STD',
      warrantyDays: 60,
      effectiveFrom: '2026-06-01',
    }),
    Object.freeze({ collectionId: 'org.policies', revision: 2 }),
  );

  await atlas.memory.storeContent({
    content: serializeOrgContent(
      Object.freeze({
        recordId: 'record.policy.warranty.standard',
        revision: 1,
        content: Object.freeze({
          policyCode: 'WARRANTY-STD',
          warrantyDays: 45,
          effectiveFrom: '2025-01-01',
        }),
        author: 'legal.ops',
      }),
    ),
    recordType: 'Version',
    metadata: Object.freeze({
      namespaceId: ORG_NAMESPACE_ID,
      entityId: 'version.record.policy.warranty.standard.r1',
      recordId: 'record.policy.warranty.standard',
      revision: 1,
      status: 'active',
      collectionId: 'org.policies',
    }),
  });
}

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

function stubAnthropicForOrgTools() {
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

    anthropicCallCount += 1;
    const lastUser = [...(body.messages ?? [])]
      .reverse()
      .find((message) => message.role === 'user' && typeof message.content === 'string');
    const goal = typeof lastUser?.content === 'string' ? lastUser.content : '';

    const wantsDiscount =
      goal.toLowerCase().includes('descuento') && goal.toLowerCase().includes('andes');
    const wantsHistory =
      goal.toLowerCase().includes('antes') || goal.toLowerCase().includes('anterior');
    const wantsWarranty =
      goal.toLowerCase().includes('garant') && !wantsHistory;

    if (wantsDiscount && anthropicCallCount === 1) {
      return Response.json({
        content: [
          {
            type: 'tool_use',
            id: 'toolu_discount_live',
            name: 'org_evaluate_discount',
            input: {
              clientLegalName: 'Constructora Andes S.A.',
              requestedPercent: 12,
            },
          },
        ],
        stop_reason: 'tool_use',
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }

    if (wantsWarranty && !wantsHistory) {
      return Response.json({
        content: [
          {
            type: 'tool_use',
            id: 'toolu_policy_live',
            name: 'org_resolve_policy',
            input: {
              policyCode: 'WARRANTY-STD',
              includeHistory: false,
            },
          },
        ],
        stop_reason: 'tool_use',
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }

    if (wantsHistory) {
      return Response.json({
        content: [
          {
            type: 'tool_use',
            id: 'toolu_policy_history_live',
            name: 'org_resolve_policy',
            input: {
              policyCode: 'WARRANTY-STD',
              includeHistory: true,
            },
          },
        ],
        stop_reason: 'tool_use',
        usage: { input_tokens: 1, output_tokens: 1 },
      });
    }

    return Response.json({
      content: [{ type: 'text', text: 'Verificación ATLAS 4.1 completada.' }],
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
  const root = mkdtempSync(join(tmpdir(), 'atlas-org-live-'));
  const atlasDir = join(root, '.atlas');
  mkdirSync(atlasDir, { recursive: true });
  const memoryFile = join(atlasDir, 'memory.json');

  process.env.ATLAS_MEMORY_FILE = memoryFile;
  process.env.ATLAS_LLM_API_KEY = 'live-verify-key';
  process.env.ATLAS_LLM_MODEL = 'claude-live-verify';
  process.env.ATLAS_LLM_PROVIDER = 'anthropic';

  stubAnthropicForOrgTools();

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

  await seedFixtures(atlas);

  const questions = [
    '¿Puedo ofrecerle 12% de descuento a Constructora Andes?',
    '¿Cuál es el plazo de garantía vigente?',
    '¿Cuál era el plazo de garantía antes del cambio?',
  ];

  const answers = [];

  for (const goal of questions) {
    anthropicCallCount = 0;
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
