import {
  Atlas,
  CompilerCompletedEvent,
  RuntimeCompletedEvent,
  RuntimeStartedEvent,
  createArtifact,
  type CompilerCompletedPayload,
  type RuntimeCompletedPayload,
  type RuntimeStartedPayload,
} from '@atlas/sdk';

function printRuntimeStarted(payload: RuntimeStartedPayload): void {
  console.log('');
  console.log('RuntimeStartedEvent:');
  console.log(`  session_id:     ${payload.session_id}`);
  console.log(`  lifecycle:      ${payload.lifecycle}`);
  console.log(`  artifact_count: ${payload.artifact_count}`);
}

function printRuntimeCompleted(payload: RuntimeCompletedPayload): void {
  console.log('');
  console.log('RuntimeCompletedEvent:');
  console.log(`  success:        ${payload.success}`);
  console.log(`  session_id:     ${payload.session_id}`);
  console.log(`  lifecycle:      ${payload.lifecycle}`);
  console.log(`  output_count:   ${payload.output_count}`);
}

function printCompilerCompleted(payload: CompilerCompletedPayload): void {
  console.log('');
  console.log('CompilerCompletedEvent:');
  console.log(`  success:         ${payload.success}`);
  console.log(`  artifact_count:  ${payload.artifact_count}`);
}

function main(): void {
  console.log('Atlas Kernel — Compile → Execute (SDK only)');
  console.log('============================================');
  console.log('');
  console.log('API utilizada: @atlas/sdk únicamente');

  const atlas = new Atlas({
    workspace: { name: 'runtime-demo', environment: 'memory' },
    compiler: {
      generators: () => [
        {
          id: 'summary-generator',
          supported_formats: ['summary'],
          generate: (graph) => [
            createArtifact({
              id: 'artifact.runtime-demo',
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
    printCompilerCompleted(event.payload);
  });

  atlas.events.subscribe(RuntimeStartedEvent, (event) => {
    printRuntimeStarted(event.payload);
  });

  atlas.events.subscribe(RuntimeCompletedEvent, (event) => {
    printRuntimeCompleted(event.payload);
  });

  void atlas.compiler
    .compile({
      units: [
        {
          id: 'policy.runtime.demo',
          origin: 'memory://policies/runtime-demo',
          checksum: 'sha256:runtime-demo',
          version: '1.0.0',
          source: { rule: 'Runtime executes compiled artifacts' },
          metadata: { kind: 'DocumentNode' },
        },
      ],
    })
    .then(async (compileResult) => {
      console.log('');
      console.log('── Compilación ──');
      console.log(`Resultado:  ${compileResult.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`Artifacts:  ${compileResult.context.artifacts.length}`);

      const executionResult = await atlas.runtime.execute({
        artifacts: compileResult.context.artifacts,
      });

      console.log('');
      console.log('── Ejecución ──');
      console.log(`Resultado:  ${executionResult.success ? 'SUCCESS' : 'FAILED'}`);
      console.log(`Lifecycle:  ${executionResult.context.lifecycle}`);
      console.log(`Outputs:    ${executionResult.context.outputs.length}`);

      if (executionResult.context.outputs[0]) {
        console.log(`Output:     ${JSON.stringify(executionResult.context.outputs[0].result)}`);
      }

      console.log('');
      console.log('============================================');
    });
}

main();
