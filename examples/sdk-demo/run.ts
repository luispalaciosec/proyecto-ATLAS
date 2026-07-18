import {
  Atlas,
  CompilerCompletedEvent,
  createArtifact,
  type CompilerCompletedPayload,
} from '@atlas/sdk';

function printEvent(payload: CompilerCompletedPayload): void {
  console.log('');
  console.log('Evento recibido por suscriptor:');
  console.log(`  type:    compiler.completed`);
  console.log(`  payload: ${JSON.stringify(payload)}`);
}

function main(): void {
  console.log('Atlas SDK — Demostración Kernel facade');
  console.log('=======================================');
  console.log('');
  console.log('API utilizada: @atlas/sdk únicamente');

  const atlas = new Atlas({
    workspace: { name: 'sdk-demo', environment: 'memory' },
    compiler: {
      generators: () => [
        {
          id: 'summary-generator',
          supported_formats: ['summary'],
          generate: (graph) => [
            createArtifact({
              id: 'artifact.sdk-demo',
              kind: 'summary',
              content: { nodes: graph.nodes.length },
              source_graph_id: graph.id,
            }),
          ],
        },
      ],
    },
  });

  atlas.events.subscribe(CompilerCompletedEvent, (event) => {
    printEvent(event.payload);
  });

  void atlas.compiler
    .compile({
      units: [
        {
          id: 'policy.sdk.demo',
          origin: 'memory://policies/sdk-demo',
          checksum: 'sha256:sdk-demo',
          version: '1.0.0',
          source: { rule: 'SDK is the public face of the Kernel' },
          metadata: { kind: 'DocumentNode' },
        },
      ],
    })
    .then((result) => {
      console.log('');
      console.log('=======================================');
      console.log(`Compilación: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`Artifacts:   ${result.context.artifacts.length}`);
      console.log(`Lifecycle:   ${result.context.lifecycle}`);
    });
}

main();
