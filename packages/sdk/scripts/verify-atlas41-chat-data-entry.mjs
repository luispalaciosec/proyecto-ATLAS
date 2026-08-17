#!/usr/bin/env node
/**
 * Live verification for ATLAS 4.1 chat data entry — builds org graph via
 * org_upsert_entity / org_link_entities (no seedFixtures), then validates
 * discount evaluation and warranty versioning through /api/chat.
 *
 * Run after `pnpm build` from repo root:
 *   node packages/sdk/scripts/verify-atlas41-chat-data-entry.mjs
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

function stubAnthropicForChatDataEntry() {
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

    if (normalizedGoal.startsWith('[setup-client]')) {
      return toolResponse('toolu_setup_client', 'org_upsert_entity', {
        recordType: 'Client',
        entityId: 'record.client.constructora-andes',
        content: {
          legalName: 'Constructora Andes S.A.',
          segment: 'VIP',
          renewalActive: true,
        },
      });
    }

    if (normalizedGoal.startsWith('[setup-discount-policy]')) {
      return toolResponse('toolu_setup_discount', 'org_upsert_entity', {
        recordType: 'DiscountPolicy',
        entityId: 'record.policy.discount.autonomous',
        content: {
          policyCode: 'DISCOUNT-VIP-2026',
          autonomousMaxPercent: 10,
          currency: 'USD',
        },
      });
    }

    if (normalizedGoal.startsWith('[setup-approval-rule]')) {
      return toolResponse('toolu_setup_rule', 'org_upsert_entity', {
        recordType: 'ApprovalRule',
        entityId: 'record.rule.discount-approval',
        content: {
          appliesWhen: 'discountPercent > autonomousMaxPercent',
          approverRole: 'SalesDirector',
          approverQueue: 'sales-directors',
        },
      });
    }

    if (normalizedGoal.startsWith('[setup-link-client-policy]')) {
      return toolResponse('toolu_setup_link_cp', 'org_link_entities', {
        sourceId: 'record.client.constructora-andes',
        targetId: 'record.policy.discount.autonomous',
        relationshipType: 'reference',
      });
    }

    if (normalizedGoal.startsWith('[setup-link-policy-rule]')) {
      return toolResponse('toolu_setup_link_pr', 'org_link_entities', {
        sourceId: 'record.policy.discount.autonomous',
        targetId: 'record.rule.discount-approval',
        relationshipType: 'dependency',
      });
    }

    if (normalizedGoal.startsWith('[setup-warranty-45]')) {
      return toolResponse('toolu_setup_warranty_45', 'org_upsert_entity', {
        recordType: 'WarrantyPolicy',
        entityId: 'record.policy.warranty.standard',
        content: {
          policyCode: 'WARRANTY-STD',
          warrantyDays: 45,
          effectiveFrom: '2025-01-01',
        },
        author: 'legal.ops',
      });
    }

    if (normalizedGoal.startsWith('[setup-warranty-60]')) {
      return toolResponse('toolu_setup_warranty_60', 'org_upsert_entity', {
        recordType: 'WarrantyPolicy',
        entityId: 'record.policy.warranty.standard',
        content: {
          policyCode: 'WARRANTY-STD',
          warrantyDays: 60,
          effectiveFrom: '2026-06-01',
        },
        author: 'legal.ops',
      });
    }

    if (normalizedGoal.startsWith('[setup-warranty-90]')) {
      return toolResponse('toolu_setup_warranty_90', 'org_upsert_entity', {
        recordType: 'WarrantyPolicy',
        entityId: 'record.policy.warranty.standard',
        content: {
          policyCode: 'WARRANTY-STD',
          warrantyDays: 90,
          effectiveFrom: '2026-09-01',
        },
        author: 'chat',
      });
    }

    if (normalizedGoal.includes('descuento') && normalizedGoal.includes('andes')) {
      return toolResponse('toolu_discount_live', 'org_evaluate_discount', {
        clientLegalName: 'Constructora Andes S.A.',
        requestedPercent: 12,
      });
    }

    if (
      normalizedGoal.includes('garant') &&
      (normalizedGoal.includes('antes') ||
        normalizedGoal.includes('anterior') ||
        normalizedGoal.includes('historial'))
    ) {
      return toolResponse('toolu_policy_history_live', 'org_resolve_policy', {
        policyCode: 'WARRANTY-STD',
        includeHistory: true,
      });
    }

    if (normalizedGoal.includes('garant')) {
      return toolResponse('toolu_policy_live', 'org_resolve_policy', {
        policyCode: 'WARRANTY-STD',
        includeHistory: false,
      });
    }

    return Response.json({
      content: [{ type: 'text', text: 'Verificación chat data entry completada.' }],
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
  const root = mkdtempSync(join(tmpdir(), 'atlas-chat-data-entry-'));
  const atlasDir = join(root, '.atlas');
  mkdirSync(atlasDir, { recursive: true });
  const memoryFile = join(atlasDir, 'memory.json');

  process.env.ATLAS_MEMORY_FILE = memoryFile;
  process.env.ATLAS_LLM_API_KEY = 'live-verify-key';
  process.env.ATLAS_LLM_MODEL = 'claude-live-verify';
  process.env.ATLAS_LLM_PROVIDER = 'anthropic';

  stubAnthropicForChatDataEntry();

  const { createWebServer } = await import(
    pathToFileURL(join(process.cwd(), 'apps/web/dist/server.js')).href
  );

  const setupGoals = [
    '[setup-client] Registrar cliente Constructora Andes',
    '[setup-discount-policy] Registrar política de descuento VIP',
    '[setup-approval-rule] Registrar regla de aprobación',
    '[setup-link-client-policy] Vincular cliente con política',
    '[setup-link-policy-rule] Vincular política con regla',
    '[setup-warranty-45] Crear garantía inicial 45 días',
    '[setup-warranty-60] Actualizar garantía a 60 días',
  ];

  const verificationGoals = [
    '¿Puedo ofrecerle 12% de descuento a Constructora Andes?',
    '¿Cuál es el plazo de garantía vigente?',
    '[setup-warranty-90] Actualizar garantía a 90 días',
    '¿Cuál era el plazo de garantía antes del cambio? Muéstrame el historial completo.',
  ];

  const answers = [];

  for (const goal of [...setupGoals, ...verificationGoals]) {
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
