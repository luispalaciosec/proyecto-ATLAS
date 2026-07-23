import type { WorkflowDefinition } from '@atlas/workflow';

/**
 * Planning model — ATLAS-INTELLIGENCE-006
 * Definition and transformation only; no execution.
 */

export interface PlanningMetadata {
  readonly name?: string;
  readonly description?: string;
  readonly tags?: readonly string[];
  readonly custom?: Readonly<Record<string, unknown>>;
}

export interface PlanningGoal {
  readonly goal_id: string;
  readonly objective: string;
  readonly constraints?: readonly string[];
  readonly variables?: Readonly<Record<string, unknown>>;
  readonly metadata?: PlanningMetadata;
}

export interface PlanningContext {
  readonly context_id: string;
  readonly domain?: string;
  readonly variables?: Readonly<Record<string, unknown>>;
  readonly rules?: readonly PlanningRule[];
  readonly metadata?: PlanningMetadata;
}

export interface PlanningRule {
  readonly rule_id: string;
  readonly condition: string;
  readonly action: 'select_strategy' | 'append_step' | 'append_branch';
  readonly parameters?: Readonly<Record<string, unknown>>;
}

export type PlanningStrategyType = 'sequential' | 'conditional' | 'branch' | 'composite';

export interface PlanningStrategy {
  readonly strategy_id: string;
  readonly strategy_type: PlanningStrategyType;

  plan(
    goal: PlanningGoal,
    context: PlanningContext,
    rules: readonly PlanningRule[],
  ): WorkflowDefinition;
}

export interface PlanningValidationIssue {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
}

export interface PlanningValidationResult {
  readonly valid: boolean;
  readonly issues: readonly PlanningValidationIssue[];
}

export interface PlanningResult {
  readonly success: boolean;
  readonly goal: PlanningGoal;
  readonly strategy_id: string;
  readonly workflow: WorkflowDefinition | null;
  readonly metadata: PlanningMetadata;
  readonly errors: readonly PlanningValidationIssue[];
}

export interface PlanningCompilationResult {
  readonly success: boolean;
  readonly workflow: WorkflowDefinition | null;
  readonly workflow_compatible: boolean;
  readonly errors: readonly PlanningValidationIssue[];
}

export interface PlanRequest {
  readonly goal: unknown;
  readonly context?: PlanningContext;
  readonly strategy_id?: string;
}
