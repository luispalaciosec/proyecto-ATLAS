import {
  createAtlasCompiler,
  createArtifact,
  createCompilationContext,
  createCompilationUnit,
  createDefaultCompilerPipeline,
  createDefaultCompilerStages,
} from '@atlas/compiler';
import {
  CompilerCompletedEvent,
  createInMemoryEventBus,
  type CompilerCompletedPayload,
} from '@atlas/events';

function printEvent(event: {
  type: string;
  source: string;
  payload: CompilerCompletedPayload;
}): void {
  console.log('');
  console.log('Evento recibido por suscriptor:');
  console.log(`  type:    ${event.type}`);
  console.log(`  source:  ${event.source}`);
  console.log(`  payload: ${JSON.stringify(event.payload)}`);
}

function main(): void {
  console.log('Atlas Compiler + Events — Demostración in-memory');
  console.log('================================================');

  const bus = createInMemoryEventBus();

  bus.subscribe(CompilerCompletedEvent, (event) => {
    printEvent({
      type: String(event.type),
      source: String(event.source),
      payload: event.payload,
    });
  });

  const unit = createCompilationUnit({
    id: 'policy.demo.event',
    origin: 'memory://policies/demo-event',
    checksum: 'sha256:demo-event',
    version: '1.0.0',
    source: { rule: 'Events decouple Kernel components' },
    metadata: { kind: 'DocumentNode' },
  });

  const pipeline = createDefaultCompilerPipeline({
    stages: createDefaultCompilerStages({
      generators: () => [
        {
          id: 'summary-generator',
          supported_formats: ['summary'],
          generate: (graph) => [
            createArtifact({
              id: 'artifact.event-demo',
              kind: 'summary',
              content: { nodes: graph.nodes.length },
              source_graph_id: graph.id,
            }),
          ],
        },
      ],
    }),
  });

  const compiler = createAtlasCompiler(pipeline, { eventBus: bus });

  void compiler
    .compile(createCompilationContext({ units: [unit], workspace: { name: 'events-demo' } }))
    .then((result) => {
      console.log('');
      console.log('================================================');
      console.log(`Compilación: ${result.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`Artifacts:   ${result.context.artifacts.length}`);
      console.log(
        `Event bus handlers (compiler.completed): ${bus.handlerCount(CompilerCompletedEvent.type)}`,
      );
    });
}

main();
