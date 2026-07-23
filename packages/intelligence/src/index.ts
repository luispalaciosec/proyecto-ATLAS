/**
 * @atlas/intelligence — Cognitive Planning Engine (Sprint 10F)
 * @see ATLAS-INTELLIGENCE-006
 * @see ATLAS-INTELLIGENCE-CONTRACT-005
 */

export type {
  PlanRequest,
  PlanningCompilationResult,
  PlanningContext,
  PlanningGoal,
  PlanningMetadata,
  PlanningResult,
  PlanningRule,
  PlanningStrategy,
  PlanningStrategyType,
  PlanningValidationIssue,
  PlanningValidationResult,
} from './planning-model.js';

export {
  PLANNING_GOAL_EMPTY_OBJECTIVE,
  PLANNING_GOAL_INVALID,
  PLANNING_RULE_INVALID,
  PLANNING_STRATEGY_INVALID,
  PLANNING_STRATEGY_NOT_FOUND,
  PLANNING_WORKFLOW_COMPILER_INCOMPATIBLE,
  PLANNING_WORKFLOW_INVALID,
  createPlanningIssue,
} from './planning-errors.js';

export { createGoalNormalizer, type GoalNormalizer } from './goal-normalizer.js';

export {
  connectNodes,
  createEntryNode,
  createExitNode,
  createStageNode,
  createWorkflowBuilder,
  createWorkflowEdge,
  createWorkflowNode,
  type WorkflowBuilder,
} from './workflow-builder.js';

export {
  createBranchStrategy,
  createCompositeStrategy,
  createConditionalStrategy,
  createDefaultPlanningStrategies,
  createSequentialStrategy,
} from './planning-strategies.js';

export { createPlanningRegistry, type PlanningRegistry } from './planning-registry.js';

export {
  createPlanningValidator,
  validatePlanningContext,
  validatePlanningGoal,
  type PlanningValidator,
} from './planning-validator.js';

export {
  compilePlanningResult,
  createPlanningCompiler,
  type PlanningCompiler,
} from './planning-compiler.js';

export { createPlanningEngine, type CreatePlanningEngineOptions, type PlanningEngine } from './planning-engine.js';
