// Contracts — ATLAS-ARCH-003 §12
export type {
  Artifact,
  CompilationContext,
  CompilationContextPatch,
  CompilationLifecycle,
  CompilationResult,
  CompilationUnit,
  Compiler,
  CompilerPipeline,
  CompilerStage,
  CompilerStageId,
  Diagnostic,
  DiagnosticLocation,
  DiagnosticSeverity,
  Generator,
  KnowledgeGraph,
  KnowledgeGraphEdge,
  KnowledgeNode,
  Publisher,
} from './contracts/index.js';
export {
  COMPILATION_LIFECYCLE_STATES,
  COMPILER_STAGE_IDS,
  DIAGNOSTIC_SEVERITIES,
  isCompilationLifecycle,
  isCompilerStageId,
  isDiagnosticSeverity,
} from './contracts/index.js';

// Context factories
export {
  appendDiagnostics,
  createCompilationContext,
  updateCompilationContext,
  type CreateCompilationContextParams,
} from './context/compilation-context.js';
export { createArtifact, type CreateArtifactParams } from './context/artifact.js';
export {
  createCompilationUnit,
  type CreateCompilationUnitParams,
} from './context/compilation-unit.js';
export { createDiagnostic, type CreateDiagnosticParams } from './context/diagnostic.js';
export {
  createKnowledgeGraph,
  createKnowledgeGraphEdge,
  createKnowledgeNode,
  type CreateKnowledgeGraphEdgeParams,
  type CreateKnowledgeGraphParams,
  type CreateKnowledgeNodeParams,
} from './context/knowledge.js';

// Pipeline — ATLAS-ARCH-003 §17–18, ARCH-006 §6
export {
  AtlasCompiler,
  createAtlasCompiler,
  type AtlasCompilerOptions,
} from './compiler/atlas-compiler.js';
export {
  createDefaultCompilerPipeline,
  DefaultCompilerPipeline,
  type DefaultCompilerPipelineOptions,
} from './pipeline/default-pipeline.js';
export { createDefaultCompilerStages } from './pipeline/default-stages.js';
export { defineCompilerStage, type DefineStageParams } from './pipeline/define-stage.js';

// Registries — ATLAS-ARCH-003 §26–28
export { createGeneratorRegistry, GeneratorRegistry } from './registries/generator-registry.js';
export { createPublisherRegistry, PublisherRegistry } from './registries/publisher-registry.js';
