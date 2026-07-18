import { Identifier, Metadata } from '@atlas/core';

import type { ExecutionContext, ExecutionContextPatch } from '../contracts/execution-context.js';

export interface CreateExecutionContextParams {
  readonly session_id?: string;
  readonly workspace?: Readonly<Record<string, unknown>>;
  readonly artifacts?: ExecutionContext['artifacts'];
  readonly metadata?: Record<string, unknown>;
}

let sessionCounter = 0;

export function resetExecutionSessionCounter(): void {
  sessionCounter = 0;
}

export function createExecutionContext(
  params: CreateExecutionContextParams = {},
): ExecutionContext {
  sessionCounter += 1;

  return Object.freeze({
    lifecycle: 'create',
    session_id: Identifier.create(params.session_id ?? `session.${sessionCounter}`),
    workspace: Object.freeze({ ...(params.workspace ?? {}) }),
    artifacts: Object.freeze([...(params.artifacts ?? [])]),
    outputs: Object.freeze([]),
    metadata: Metadata.create(params.metadata ?? {}),
    started_at: null,
    completed_at: null,
  });
}

export function updateExecutionContext(
  context: ExecutionContext,
  patch: ExecutionContextPatch,
): ExecutionContext {
  return Object.freeze({
    lifecycle: patch.lifecycle ?? context.lifecycle,
    session_id: context.session_id,
    workspace: context.workspace,
    artifacts: Object.freeze([...(patch.artifacts ?? context.artifacts)]),
    outputs: Object.freeze([...(patch.outputs ?? context.outputs)]),
    metadata: patch.metadata ?? context.metadata,
    started_at: patch.started_at !== undefined ? patch.started_at : context.started_at,
    completed_at: patch.completed_at !== undefined ? patch.completed_at : context.completed_at,
  });
}
