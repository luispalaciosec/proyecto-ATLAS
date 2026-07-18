import { Metadata } from '@atlas/core';
import {
  createArtifact,
  createCompilationContext,
  createCompilationUnit,
  createDefaultCompilerStages,
  updateCompilationContext,
  type CompilationContext,
  type CompilerStage,
  type Generator,
} from '@atlas/compiler';

function printStageSummary(stage: CompilerStage, context: CompilationContext): void {
  const errors = context.diagnostics.filter((d) => d.severity === 'error').length;
  const warnings = context.diagnostics.filter((d) => d.severity === 'warning').length;

  console.log('');
  console.log(`── Etapa: ${stage.name} (${stage.id}) ──`);
  console.log(`   lifecycle:        ${context.lifecycle}`);
  console.log(`   current_stage:    ${context.current_stage ?? 'null'}`);
  console.log(`   units:            ${context.units.length}`);
  console.log(`   hir nodes:        ${context.hir.length}`);
  console.log(`   mir nodes:        ${context.mir?.nodes.length ?? 0}`);
  console.log(`   mir edges:        ${context.mir?.edges.length ?? 0}`);
  console.log(`   artifacts:        ${context.artifacts.length}`);
  console.log(
    `   diagnostics:      ${context.diagnostics.length} (${errors} errors, ${warnings} warnings)`,
  );

  if (context.hir.length > 0) {
    console.log(`   hir kinds:        ${context.hir.map((node) => node.kind).join(', ')}`);
  }

  if (context.artifacts.length > 0) {
    console.log('   artifacts detail:');
    for (const artifact of context.artifacts) {
      console.log(`     - ${artifact.id.toJSON()} [${artifact.kind}]`);
      console.log(`       content: ${JSON.stringify(artifact.content)}`);
    }
  }

  if (context.diagnostics.length > 0) {
    console.log('   diagnostics detail:');
    for (const diagnostic of context.diagnostics) {
      console.log(`     - [${diagnostic.severity}] ${diagnostic.message}`);
    }
  }
}

function createSummaryGenerator(): Generator {
  return {
    id: 'summary-generator',
    supported_formats: ['summary'],
    generate(graph, context) {
      return [
        createArtifact({
          id: 'artifact.workspace-summary',
          kind: 'summary',
          content: {
            graph_id: graph.id.toJSON(),
            node_count: graph.nodes.length,
            edge_count: graph.edges.length,
            node_kinds: graph.nodes.map((node) => node.kind),
            workspace_name: context.workspace.name ?? 'unknown',
          },
          source_graph_id: graph.id,
          metadata: {
            generator: 'summary-generator',
            stage: 'generation',
          },
        }),
      ];
    },
  };
}

function main(): void {
  console.log('Atlas Compiler — Demostración in-memory');
  console.log('========================================');
  console.log('');
  console.log('Restricciones: sin filesystem, YAML, Markdown ni infraestructura externa.');
  console.log('API utilizada: @atlas/compiler + @atlas/core (sin extensiones nuevas).');

  const unit = createCompilationUnit({
    id: 'policy.security.access',
    origin: 'memory://workspace/policies/security-access',
    checksum: 'sha256:demo-access-policy-v1',
    version: '1.0.0',
    source: {
      title: 'Security Access Policy',
      statements: ['All production access requires MFA.', 'Privileged actions must be audited.'],
    },
    metadata: {
      kind: 'DocumentNode',
      domain: 'security',
      owner: 'platform-team',
    },
  });

  console.log('');
  console.log('CompilationUnit creada:');
  console.log(`  id:       ${unit.id.toJSON()}`);
  console.log(`  origin:   ${unit.origin}`);
  console.log(`  version:  ${unit.version.toJSON()}`);
  console.log(`  checksum: ${unit.checksum}`);
  console.log(`  kind:     ${unit.metadata.get('kind')}`);

  const generator = createSummaryGenerator();
  const stages = createDefaultCompilerStages({
    generators: () => [generator],
    publishers: () => [],
  });

  let context = createCompilationContext({
    workspace: Object.freeze({ name: 'atlas-demo-workspace', environment: 'memory' }),
    units: [unit],
    metadata: Metadata.create({ demo: true, sprint: 2 }),
    packages: Object.freeze(['@atlas/core', '@atlas/compiler']),
  });

  console.log('');
  console.log('Estado inicial:');
  printStageSummary(
    {
      id: 'discovery',
      name: 'Initial Context',
      validatePreconditions: () => [],
      execute: (c) => c,
    },
    context,
  );

  for (const stage of stages) {
    context = stage.execute(context);
    printStageSummary(stage, context);
  }

  context = updateCompilationContext(context, {
    lifecycle: 'complete',
    current_stage: null,
  });

  printStageSummary(
    {
      id: 'publishing',
      name: 'Pipeline Complete',
      validatePreconditions: () => [],
      execute: (value) => value,
    },
    context,
  );

  const success =
    context.lifecycle === 'complete' &&
    context.artifacts.length > 0 &&
    context.diagnostics.every((d) => d.severity !== 'error');

  console.log('');
  console.log('========================================');
  console.log(`Resultado final: ${success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`  lifecycle:  ${context.lifecycle}`);
  console.log(`  artifacts:  ${context.artifacts.length}`);
  console.log(`  mir id:     ${context.mir?.id.toJSON() ?? 'null'}`);

  if (!success) {
    process.exitCode = 1;
  }
}

main();
