import { Identifier } from '@atlas/core';
import { describe, expect, it } from 'vitest';

import {
  ContextScope,
  GovernanceRecord,
  LifecycleState,
  ObjectKind,
  ObjectMetadata,
  StatementContent,
  createKnowledgeObject,
  createKnowledgeStatement,
} from '@atlas/knowledge';
import type { KnowledgeObject } from '@atlas/knowledge';
import {
  Atlas,
  CompilerCompletedEvent,
  createArtifact,
  createAtlas,
  type CompilerCompletedPayload,
} from '@atlas/sdk';

function asOperational(object: KnowledgeObject): KnowledgeObject {
  return Object.freeze({
    ...object,
    governance: GovernanceRecord.create({
      owner: object.governance.owner,
      stewards: object.governance.stewards,
      reviewers: object.governance.reviewers,
      lifecycleState: LifecycleState.Operational,
    }),
  });
}

function createOperationalPolicy(): KnowledgeObject {
  const owner = Identifier.create('owner.platform');
  const context = ContextScope.create({ organizational: 'platform' });

  return asOperational(
    createKnowledgeObject({
      id: 'policy.platform.overview',
      kind: ObjectKind.create('Policy'),
      metadata: ObjectMetadata.create({
        name: 'Platform Overview Policy',
        tags: ['platform', 'overview'],
      }),
      owner,
      contexts: [context],
      statements: [
        createKnowledgeStatement({
          id: 'policy.platform.overview.stmt.1',
          objectId: 'policy.platform.overview',
          content: StatementContent.create({
            assertion: 'Atlas transforms knowledge into compiled intelligence.',
          }),
          context,
          authoredBy: owner,
        }),
      ],
    }),
  );
}

describe('Atlas SDK knowledge integration', () => {
  it('compiles KnowledgeObjects through atlas.compiler.compile without exposing the adapter', async () => {
    const atlas = new Atlas({
      workspace: { name: 'knowledge-integration' },
      compiler: {
        generators: () => [
          {
            id: 'summary-generator',
            supported_formats: ['summary'],
            generate: (graph) => [
              createArtifact({
                id: 'artifact.knowledge-integration',
                kind: 'summary',
                content: { nodes: graph.nodes.length },
                source_graph_id: graph.id,
              }),
            ],
          },
        ],
      },
    });

    const payloads: CompilerCompletedPayload[] = [];

    atlas.events.subscribe(CompilerCompletedEvent, (event) => {
      payloads.push(event.payload);
    });

    const result = await atlas.compiler.compile({
      knowledge: [createOperationalPolicy()],
    });

    expect(result.success).toBe(true);
    expect(result.context.artifacts).toHaveLength(1);
    expect(result.context.units).toHaveLength(1);
    expect(result.context.units[0]?.origin).toBe('knowledge://policy.platform.overview@1.0.0');
    expect(payloads).toHaveLength(1);
    expect(payloads[0]?.unit_count).toBe(1);
  });

  it('merges projected knowledge units with explicit compilation units', async () => {
    const atlas = createAtlas({ workspace: { name: 'mixed-compile' } });

    const result = await atlas.compiler.compile({
      knowledge: [createOperationalPolicy()],
      units: [
        {
          id: 'doc.explicit',
          origin: 'memory://doc.explicit',
          checksum: 'sha256:explicit',
          version: '1.0.0',
          source: { body: 'explicit-unit' },
        },
      ],
    });

    expect(result.success).toBe(true);
    expect(result.context.units).toHaveLength(2);
  });
});
