import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createFakeLlmProviderWithRequests } from '@atlas/llm';
import { describe, expect, it } from 'vitest';

import {
  AtlasContextBuilder,
  createAtlas,
  createAtlasToolExecutors,
  createOrgLlmToolExecutors,
  listAtlasOrgToolNames,
} from '../src/index.js';
import { ORG_RECORD_TYPE_WARRANTY_POLICY } from '../src/org/constants.js';
import {
  seedCase1DiscountGraph,
  seedCase1WithApproval,
  seedCase2WarrantyPolicy,
} from '../src/org/fixtures.js';
import { parseWarrantyPolicy } from '../src/org/schemas/warranty-policy.js';
import { readEntityPayload } from '../src/org/entity-resolver.js';
import { resolvePolicyHistory } from '../src/org/version-resolver.js';

function createLlmAtlas(
  storageFilePath: string,
  fakeScript: Parameters<typeof createFakeLlmProviderWithRequests>[0],
) {
  const fake = createFakeLlmProviderWithRequests(fakeScript);

  return Object.freeze({
    atlas: createAtlas({
      memory: { storageFilePath },
      llm: { provider: fake.provider },
    }),
    fake,
  });
}

describe('INT-005 LLM organizational intelligence integration', () => {
  it('INT-005-A: LLM tool registry exposes certified org tools', () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int005-a-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });
    const toolNames = createAtlasToolExecutors(atlas).map((tool) => tool.definition.name);

    expect(listAtlasOrgToolNames()).toEqual([
      'org_evaluate_discount',
      'org_resolve_policy',
      'org_upsert_entity',
      'org_link_entities',
      'org_record_evidence',
      'org_record_decision',
      'org_resolve_decision',
      'org_execute_record_approved_discount',
    ]);
    expect(toolNames).toEqual(expect.arrayContaining([...listAtlasOrgToolNames()]));

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-005-B: discount 12% requires approval from SalesDirector', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int005-b-'));
    const { atlas, fake } = createLlmAtlas(join(dir, 'memory.json'), [
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_discount',
              name: 'org_evaluate_discount',
              arguments: Object.freeze({
                clientLegalName: 'Constructora Andes S.A.',
                requestedPercent: 12,
              }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content:
            'No puedes aplicar 12% de forma autónoma. Límite autónomo: 10%. Requiere aprobación de SalesDirector.',
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    await seedCase1DiscountGraph(atlas);

    const result = await atlas.llm.ask('¿Puedo ofrecerle 12% de descuento a Constructora Andes?');

    expect(result.success).toBe(true);
    expect(result.finalMessage).toContain('10%');
    expect(result.finalMessage).toContain('SalesDirector');
    expect(fake.requests[0]?.tools?.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([...listAtlasOrgToolNames()] as string[]),
    );

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-005-C: VIP client and active renewal context participates in org reasoning', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int005-c-'));
    const { atlas } = createLlmAtlas(join(dir, 'memory.json'), [
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_discount',
              name: 'org_evaluate_discount',
              arguments: Object.freeze({
                clientLegalName: 'Constructora Andes S.A.',
                requestedPercent: 12,
              }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content:
            'Cliente VIP con renovación activa; 12% excede el límite autónomo de 10% y requiere SalesDirector.',
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    await seedCase1DiscountGraph(atlas);

    const orgTools = createOrgLlmToolExecutors(atlas);
    const evaluate = orgTools.find((tool) => tool.definition.name === 'org_evaluate_discount');
    const toolResult = await evaluate?.execute({
      clientLegalName: 'Constructora Andes S.A.',
      requestedPercent: 12,
    });

    expect(toolResult).toContain('VIP');
    expect(toolResult).toContain('renovación activa');
    expect(toolResult).toContain('SalesDirector');

    const contextPackage = await AtlasContextBuilder.build({
      goal: '¿Puedo ofrecerle 12% de descuento a Constructora Andes S.A.?',
      atlas,
      workspace: 'default',
    });

    expect(contextPackage.systemPrompt).toContain('VIP');
    expect(contextPackage.systemPrompt).toContain('SalesDirector');

    const result = await atlas.llm.ask(
      '¿Puedo ofrecerle 12% de descuento a Constructora Andes S.A.?',
    );
    expect(result.finalMessage).toContain('VIP');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-005-D: decision and evidence are produced and traceable through org tools', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int005-d-'));
    const { atlas } = createLlmAtlas(join(dir, 'memory.json'), [
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_resolve',
              name: 'org_resolve_decision',
              arguments: Object.freeze({
                clientLegalName: 'Constructora Andes S.A.',
                subjectType: 'discount_request',
              }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content:
            'SalesDirector aprobó el 12% citando la renovación continua desde 2023 sin incidentes de pago.',
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    await seedCase1WithApproval(atlas);

    const result = await atlas.llm.ask(
      '¿Quién aprobó el descuento de Constructora Andes y por qué?',
    );

    expect(result.success).toBe(true);
    expect(result.finalMessage).toContain('SalesDirector');
    expect(result.finalMessage).toContain('renovación continua desde 2023');

    const resolved = await atlas.org.resolveDecisionWithEvidence(
      'Constructora Andes S.A.',
      'discount_request',
    );

    expect(resolved).toBeDefined();
    expect(resolved?.evidence).toHaveLength(1);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-005-E: warranty versioning preserves 45 → 60 → 90 day history', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int005-e-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    await seedCase2WarrantyPolicy(atlas);

    await atlas.org.upsertEntity(
      ORG_RECORD_TYPE_WARRANTY_POLICY,
      'record.policy.warranty.standard',
      Object.freeze({
        policyCode: 'WARRANTY-STD',
        warrantyDays: 90,
        effectiveFrom: '2026-09-01',
      }),
      'legal.ops',
    );

    const orgTools = createOrgLlmToolExecutors(atlas);
    const resolvePolicy = orgTools.find((tool) => tool.definition.name === 'org_resolve_policy');
    const formatted = await resolvePolicy?.execute({
      policyCode: 'WARRANTY-STD',
      includeHistory: true,
    });

    expect(formatted).toContain('90');
    expect(formatted).toContain('60');
    expect(formatted).toContain('45');

    const current = await atlas.org.resolveCurrentWarrantyByCode('WARRANTY-STD');
    const history = await resolvePolicyHistory(atlas, current.entityId);

    expect(parseWarrantyPolicy(readEntityPayload(current.record)).warrantyDays).toBe(90);
    expect(current.revision).toBe(3);
    expect(history.map((entry) => parseWarrantyPolicy(entry.content).warrantyDays)).toEqual([
      45, 60,
    ]);

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-005-F: org tools respect brand/workspace isolation', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int005-f-'));
    const geeks = createAtlas({
      workspace: { name: 'geeks' },
      memory: { storageFilePath: join(dir, 'geeks.json') },
    });
    const revital = createAtlas({
      workspace: { name: 'revital' },
      memory: { storageFilePath: join(dir, 'revital.json') },
    });

    await seedCase1DiscountGraph(geeks);

    const orgTools = createOrgLlmToolExecutors(revital);
    const evaluate = orgTools.find((tool) => tool.definition.name === 'org_evaluate_discount');

    await expect(
      evaluate?.execute({
        clientLegalName: 'Constructora Andes S.A.',
        requestedPercent: 12,
      }),
    ).rejects.toThrow(/not found/i);

    const local = await createOrgLlmToolExecutors(geeks)
      .find((tool) => tool.definition.name === 'org_evaluate_discount')
      ?.execute({
        clientLegalName: 'Constructora Andes S.A.',
        requestedPercent: 12,
      });

    expect(local).toContain('SalesDirector');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-005-G: tool results return to the LLM and shape the final answer', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int005-g-'));
    const { atlas, fake } = createLlmAtlas(join(dir, 'memory.json'), [
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: '',
          toolCalls: Object.freeze([
            Object.freeze({
              id: 'toolu_discount',
              name: 'org_evaluate_discount',
              arguments: Object.freeze({
                clientLegalName: 'Constructora Andes S.A.',
                requestedPercent: 12,
              }),
            }),
          ]),
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'tool_use' as const,
      }),
      Object.freeze({
        message: Object.freeze({
          role: 'assistant' as const,
          content: 'Respuesta basada en la herramienta: límite autónomo 10%, SalesDirector.',
        }),
        usage: Object.freeze({ inputTokens: 1, outputTokens: 1 }),
        stopReason: 'end_turn' as const,
      }),
    ]);

    await seedCase1DiscountGraph(atlas);

    const result = await atlas.llm.ask('Evalúa 12% para Constructora Andes');

    expect(result.success).toBe(true);
    expect(result.finalMessage).toContain('SalesDirector');

    const toolMessages = fake.requests[1]?.messages.filter((message) => message.role === 'tool');
    expect(toolMessages?.length).toBeGreaterThan(0);
    expect(String(toolMessages?.[0]?.content)).toContain('10%');

    rmSync(dir, { recursive: true, force: true });
  });

  it('INT-005-H: LLM module does not access org stores directly', () => {
    const repoRoot = fileURLToPath(new URL('../../../', import.meta.url));
    const llmModuleSource = readFileSync(
      join(repoRoot, 'packages/sdk/src/modules/llm-module.ts'),
      'utf8',
    );
    const orgToolsSource = readFileSync(
      join(repoRoot, 'packages/sdk/src/org/org-llm-tools.ts'),
      'utf8',
    );

    expect(llmModuleSource).not.toMatch(
      /entity-store|decision-store|entity-resolver|policy-evaluator/,
    );
    expect(llmModuleSource).toContain('createAtlasToolExecutors');
    expect(orgToolsSource).toContain('atlas.org.');
    expect(orgToolsSource).not.toMatch(
      /from '\.\/entity-store|from '\.\/decision-store|from '\.\/entity-resolver/,
    );
  });

  it('INT-005-I: regression — context builder, retrieval and knowledge ingest paths remain available', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'atlas-int005-i-'));
    const atlas = createAtlas({ memory: { storageFilePath: join(dir, 'memory.json') } });

    await atlas.memory.storeContent({
      content: 'regression-int005-retrieval-marker',
      recordType: 'document',
      metadata: Object.freeze({
        source: 'upload',
        documentId: 'doc.regression.int005',
        knowledgeObjectId: 'doc.regression.int005',
        fileName: 'regression.txt',
      }),
    });

    const contextPackage = await AtlasContextBuilder.build({
      goal: 'regression-int005-retrieval-marker',
      atlas,
      workspace: 'default',
    });

    expect(contextPackage.orgToolsAvailable).toEqual(listAtlasOrgToolNames());
    expect(contextPackage.retrieval.selected).toBeGreaterThan(0);

    const search = await atlas.retrieval.searchContent({
      query: 'regression-int005-retrieval-marker',
    });

    expect(search.total).toBeGreaterThan(0);

    rmSync(dir, { recursive: true, force: true });
  });
});
