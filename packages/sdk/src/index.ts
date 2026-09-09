// Facade — SDK-202 §7
export { Atlas, createAtlas } from './atlas/atlas.js';
export type {
  AtlasCompilerOptions,
  AtlasLlmOptions,
  AtlasMemoryOptions,
  AtlasOptions,
  AtlasPlanningOptions,
  AtlasRetrievalOptions,
  AtlasRuntimeOptions,
  AtlasWorkflowOptions,
  AtlasWorkspaceOptions,
} from './atlas/options.js';

// Modules
export type { CompileOptions } from './modules/compiler-module.js';
export type { ExecuteOptions } from './modules/runtime-module.js';
export type {
  ListMemoryRecordsOptions,
  ListMemoryRecordsResult,
  SearchMemoryContentOptions,
  SearchMemoryContentResult,
  StoreMemoryContentOptions,
  StoreMemoryContentResult,
  StorePlanExecutionOptions,
  StoreStructuredRecordOptions,
} from './modules/memory-module.js';
export { matchesContentQuery } from './modules/memory-module.js';
export {
  isDocumentChunkRecord,
  isKnowledgeObjectRecord,
  prepareIngestedDocumentKnowledge,
  readKnowledgeObjectId,
  storeIngestedDocumentChunk,
  storeIngestedDocumentKnowledgeObject,
  type StoreIngestedDocumentChunkOptions,
  type StoreIngestedDocumentKnowledgeResult,
} from './knowledge/ingest-document.js';
export type { PlanFromGoalOptions } from './modules/planning-module.js';
export type { RetrieveForGoalOptions, SearchContentOptions } from './modules/retrieval-module.js';
export type { AskOptions } from './modules/llm-module.js';
export {
  AtlasContextBuilder,
  combineBrandContextPrompt,
  CONTEXT_SYSTEM_PROMPT_MAX_LENGTH,
  KNOWLEDGE_CONTEXT_RECORD_LIMIT,
  KNOWLEDGE_CONTEXT_SNIPPET_MAX_LENGTH,
  type AtlasContextBuildOptions,
  type AtlasContextPackage,
  type AtlasContextRetrievalSummary,
  type ContextSource,
  type ContextSourceKind,
} from './context/index.js';
export type { LlmBudget, LlmMessage, LlmProvider, ToolLoopResult } from './modules/llm-module.js';
export type {
  RetrievalContext,
  RetrievalResult,
  RetrievedMemoryItem,
} from './modules/retrieval-module.js';
export { planExecuteAndRemember } from './plan/plan-execution-memory.js';
export type { PlanExecuteAndRememberResult } from './plan/plan-execution-memory.js';
export {
  ATLAS_ORG_TOOL_NAMES,
  createOrgLlmToolExecutors,
  listAtlasOrgToolNames,
  type AtlasOrgToolName,
} from './org/org-llm-tools.js';
export {
  GOVERNANCE_RECORD_TYPE_APPROVED_DISCOUNT,
  GOVERNANCE_RECORD_TYPE_ACTION_OPERATIONAL_RESULT,
  INTERNAL_ACTION_RECORD_APPROVED_DISCOUNT,
} from './governance/constants.js';
export {
  buildBlockedOperationalResult,
  buildExecutedOperationalResult,
  buildOperationalResultSearchText,
  parseActionOperationalResultFromRecord,
  persistActionOperationalResult,
  type ActionOperationalAuthorizationSnapshot,
  type ActionOperationalResultPayload,
  type ActionOperationalResultStatus,
  type PersistedActionOperationalResult,
} from './governance/action-operational-result.js';
export {
  GovernanceActionBlockedEvent,
  GovernanceActionExecutedEvent,
  GOVERNANCE_ACTION_BLOCKED_EVENT_TYPE,
  GOVERNANCE_ACTION_EXECUTED_EVENT_TYPE,
  type GovernanceActionBlockedPayload,
  type GovernanceActionExecutedPayload,
} from './governance/governance-events.js';
export type {
  GovernanceAuthorizationResult,
  InternalActionExecutionResult,
  InternalActionRequest,
  InternalActionResult,
  RecordApprovedDiscountActionRequest,
} from './governance/governance-types.js';
export { GovernanceModule } from './modules/governance-module.js';
export { createAtlasToolExecutors, listAtlasToolNames } from './tools/atlas-tool-registry.js';
export {
  DEFAULT_WARRANTY_ENTITY_ID,
  DEFAULT_WARRANTY_POLICY_CODE,
  FEEDBACK_RECORD_TYPE,
  FEEDBACK_SOURCE_ATLAS_CORRECT,
  parseWarrantyCorrectionDays,
  readCurrentWarrantyDays,
  readHistoricalWarrantyDays,
  recordFeedbackCorrection,
  type FeedbackLastTurn,
  type RecordFeedbackCorrectionOptions,
  type RecordFeedbackCorrectionResult,
  type StructuredFeedbackCorrection,
} from './feedback/index.js';

// Kernel re-exports for stable public API (passthrough, no duplication)
export type {
  Artifact,
  CompilationResult,
  CreateCompilationUnitParams,
  Generator,
} from '@atlas/compiler';
export { createArtifact } from '@atlas/compiler';

export type {
  CompilerCompletedPayload,
  DomainEvent,
  EventHandler,
  Unsubscribe,
} from '@atlas/events';
export { CompilerCompletedEvent } from '@atlas/events';

export type {
  ExecutionContext,
  ExecutionResult,
  RuntimeCompletedPayload,
  RuntimeLifecycle,
  RuntimeStartedPayload,
} from '@atlas/runtime';
export { RuntimeCompletedEvent, RuntimeStartedEvent } from '@atlas/runtime';

export { Metadata } from '@atlas/core';
