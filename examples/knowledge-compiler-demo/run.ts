import { Identifier } from '@atlas/core';
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
import { Atlas, createArtifact } from '@atlas/sdk';

function asOperational(object: KnowledgeObject): KnowledgeObject {
  return Object.freeze({
    ...object,
    governance: GovernanceRecord.create({
      owner: object.governance.owner,
      lifecycleState: LifecycleState.Operational,
    }),
  });
}

function buildKnowledgeObjects(): KnowledgeObject[] {
  const owner = Identifier.create('owner.security');
  const context = ContextScope.create({ organizational: 'security' });

  return [
    asOperational(
      createKnowledgeObject({
        id: 'policy.security.access-control',
        kind: ObjectKind.create('Policy'),
        metadata: ObjectMetadata.create({
          name: 'Access Control Policy',
          tags: ['policy', 'access', 'mfa'],
        }),
        owner,
        contexts: [context],
        statements: [
          createKnowledgeStatement({
            id: 'policy.security.access-control.stmt.1',
            objectId: 'policy.security.access-control',
            content: StatementContent.create({
              assertion: 'All production access requires multi-factor authentication.',
            }),
            context,
            authoredBy: owner,
          }),
          createKnowledgeStatement({
            id: 'policy.security.access-control.stmt.2',
            objectId: 'policy.security.access-control',
            content: StatementContent.create({
              assertion: 'Privileged actions must be audited and traceable.',
            }),
            context,
            authoredBy: owner,
          }),
        ],
      }),
    ),
    asOperational(
      createKnowledgeObject({
        id: 'concept.platform.overview',
        kind: ObjectKind.create('Concept'),
        metadata: ObjectMetadata.create({
          name: 'Atlas Platform Overview',
          tags: ['concept', 'overview'],
        }),
        owner: Identifier.create('owner.platform'),
        contexts: [ContextScope.create({ organizational: 'platform' })],
        statements: [
          createKnowledgeStatement({
            id: 'concept.platform.overview.stmt.1',
            objectId: 'concept.platform.overview',
            content: StatementContent.create({
              assertion:
                'Atlas transforms knowledge into compiled, executable intelligence through a deterministic Kernel.',
            }),
            context: ContextScope.create({ organizational: 'platform' }),
            authoredBy: Identifier.create('owner.platform'),
          }),
        ],
      }),
    ),
  ];
}

async function main(): Promise<void> {
  console.log('Atlas Sprint 9 — Knowledge → Compiler Integration');
  console.log('=================================================');
  console.log('');
  console.log('Flujo: KnowledgeObject[] → projection → CompilationUnit[] → Compiler → Artifact');
  console.log('API pública: atlas.compiler.compile({ knowledge: [...] })');

  const atlas = new Atlas({
    workspace: { name: 'knowledge-compiler-demo', environment: 'memory' },
    compiler: {
      generators: () => [
        {
          id: 'summary-generator',
          supported_formats: ['summary'],
          generate: (graph) => [
            createArtifact({
              id: 'artifact.knowledge-compiler-demo',
              kind: 'summary',
              content: {
                nodes: graph.nodes.length,
                projection: 'knowledge-projection-adapter',
              },
              source_graph_id: graph.id,
            }),
          ],
        },
      ],
    },
  });

  const knowledgeObjects = buildKnowledgeObjects();

  console.log('');
  console.log(`KnowledgeObjects: ${knowledgeObjects.length}`);

  const result = await atlas.compiler.compile({ knowledge: knowledgeObjects });

  console.log('');
  console.log('=================================================');
  console.log(`Compilación: ${result.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Units:       ${result.context.units.length}`);
  console.log(`Artifacts:   ${result.context.artifacts.length}`);
  console.log(`Lifecycle:   ${result.context.lifecycle}`);

  for (const unit of result.context.units) {
    console.log(`  - ${unit.id.toString()} (${unit.origin})`);
  }
}

void main();
