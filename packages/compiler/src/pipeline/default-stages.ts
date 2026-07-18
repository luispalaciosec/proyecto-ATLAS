import type { CompilationContext } from '../contracts/compilation-context.js';
import type { CompilerStage } from '../contracts/compiler-stage.js';
import type { Generator } from '../contracts/generator.js';
import type { Publisher } from '../contracts/publisher.js';
import { createDiagnostic } from '../context/diagnostic.js';
import { createKnowledgeGraph, createKnowledgeNode } from '../context/knowledge.js';
import { defineCompilerStage } from './define-stage.js';

function readUnitKind(context: CompilationContext, unitId: string): string {
  const fromMetadata = context.units
    .find((unit) => unit.id.toJSON() === unitId)
    ?.metadata.get('kind');

  return typeof fromMetadata === 'string' && fromMetadata.length > 0
    ? fromMetadata
    : 'KnowledgeNode';
}

export function createDiscoveryStage(): CompilerStage {
  return defineCompilerStage({
    id: 'discovery',
    name: 'Discovery Stage',
    lifecycle: 'discover',
    transform: (context) => context,
  });
}

export function createIngestionStage(): CompilerStage {
  return defineCompilerStage({
    id: 'ingestion',
    name: 'Ingestion Stage',
    lifecycle: 'create_units',
    validatePreconditions: (context) => {
      if (context.units.length === 0) {
        return [
          createDiagnostic({
            severity: 'warning',
            message: 'No compilation units were provided for ingestion',
          }),
        ];
      }

      return [];
    },
    transform: (context) => context,
  });
}

export function createLoweringStage(): CompilerStage {
  return defineCompilerStage({
    id: 'lowering',
    name: 'Lowering Stage',
    lifecycle: 'lower',
    transform: (context) => {
      const hir = context.units.map((unit) =>
        createKnowledgeNode({
          id: `hir.${unit.id.toJSON()}`,
          kind: readUnitKind(context, unit.id.toJSON()),
          unit_id: unit.id,
          payload: unit.source,
          metadata: unit.metadata.toJSON(),
        }),
      );

      return {
        ...context,
        hir,
      };
    },
  });
}

export function createResolutionStage(): CompilerStage {
  return defineCompilerStage({
    id: 'resolution',
    name: 'Resolution Stage',
    lifecycle: 'resolve',
    validatePreconditions: (context) => {
      if (context.hir.length === 0) {
        return [
          createDiagnostic({
            severity: 'error',
            message: 'Lowering stage did not produce HIR nodes',
          }),
        ];
      }

      return [];
    },
    transform: (context) => context,
  });
}

export function createGraphConstructionStage(): CompilerStage {
  return defineCompilerStage({
    id: 'graph_construction',
    name: 'Graph Construction Stage',
    lifecycle: 'resolve',
    transform: (context) => ({
      ...context,
      mir: createKnowledgeGraph({
        id: 'mir.workspace',
        nodes: context.hir,
        metadata: context.metadata.toJSON(),
      }),
    }),
  });
}

export function createValidationStage(): CompilerStage {
  return defineCompilerStage({
    id: 'validation',
    name: 'Validation Stage',
    lifecycle: 'validate',
    validatePreconditions: (context) => {
      if (!context.mir) {
        return [
          createDiagnostic({
            severity: 'error',
            message: 'Graph construction did not produce a Knowledge Graph',
          }),
        ];
      }

      return [];
    },
    transform: (context) => {
      if (!context.mir) {
        return context;
      }

      const structuralDiagnostics = context.mir.nodes.flatMap((node) => {
        if (node.kind.trim() === '') {
          return [
            createDiagnostic({
              severity: 'error',
              message: 'Knowledge node kind must not be empty',
              location: { unit_id: node.unit_id.toJSON() },
            }),
          ];
        }

        return [];
      });

      return {
        ...context,
        diagnostics: [...context.diagnostics, ...structuralDiagnostics],
      };
    },
  });
}

export function createGenerationStage(
  resolveGenerators: () => readonly Generator[],
): CompilerStage {
  return defineCompilerStage({
    id: 'generation',
    name: 'Generation Stage',
    lifecycle: 'generate',
    transform: (context) => {
      if (!context.mir) {
        return context;
      }

      const artifacts = resolveGenerators().flatMap((generator) =>
        generator.generate(context.mir!, context),
      );

      return {
        ...context,
        artifacts: [...context.artifacts, ...artifacts],
      };
    },
  });
}

export function createPublishingStage(
  resolvePublishers: () => readonly Publisher[],
): CompilerStage {
  return defineCompilerStage({
    id: 'publishing',
    name: 'Publishing Stage',
    lifecycle: 'publish',
    transform: (context) => {
      const publishDiagnostics = resolvePublishers().flatMap((publisher) =>
        publisher.publish(context.artifacts, context),
      );

      return {
        ...context,
        diagnostics: [...context.diagnostics, ...publishDiagnostics],
      };
    },
  });
}

export function createDefaultCompilerStages(
  options: {
    readonly generators?: () => readonly Generator[];
    readonly publishers?: () => readonly Publisher[];
  } = {},
): readonly CompilerStage[] {
  const resolveGenerators = options.generators ?? (() => []);
  const resolvePublishers = options.publishers ?? (() => []);

  return Object.freeze([
    createDiscoveryStage(),
    createIngestionStage(),
    createLoweringStage(),
    createResolutionStage(),
    createGraphConstructionStage(),
    createValidationStage(),
    createGenerationStage(resolveGenerators),
    createPublishingStage(resolvePublishers),
  ]);
}
