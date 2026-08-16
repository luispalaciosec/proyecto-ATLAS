import type { AtlasService } from '../services/atlas-service.js';
import {
  captureLastMemorySessionId,
  recordTurnMessages,
  selectRecentTurns,
  type ChatSessionState,
} from './chat-session.js';
import { mapTranscriptToReasoningSteps, type ChatReasoningStepPayload } from './map-reasoning-steps.js';
import { recordFeedback } from './feedback.js';

export interface ChatTurnPayload {
  readonly command: 'chat';
  readonly session_id: string;
  readonly turn: number;
  readonly goal: string;
  readonly success: boolean;
  readonly workflow_id?: string;
  readonly memory_session_id?: string;
  readonly mode?: 'llm' | 'deterministic';
  readonly llm_message?: string;
  readonly llm_turns?: number;
  readonly llm_reasoning_steps?: readonly ChatReasoningStepPayload[];
  readonly llm_elapsed_ms?: number;
  readonly llm_usage?: {
    readonly input_tokens: number;
    readonly output_tokens: number;
  };
  readonly budget_exceeded?: boolean;
  readonly retrieval: {
    readonly selected: number;
    readonly total_candidates: number;
    readonly prior_goals: readonly string[];
  };
  readonly execution: {
    readonly lifecycle: string;
    readonly outputs: number;
    readonly session_id: string;
  };
}

export interface CorrectionOutcome {
  readonly status: 'recorded' | 'usage' | 'llm_required' | 'no_prior_turn';
  readonly message: string;
  readonly recordId?: string;
}

async function executeDeterministicChatTurn(
  atlasService: AtlasService,
  session: ChatSessionState,
  goal: string,
): Promise<ChatTurnPayload> {
  session.turnCount += 1;
  const startedAt = performance.now();

  const result = await atlasService.planAndExecute(session.client, goal);
  const memorySessionId = captureLastMemorySessionId(session);
  const elapsedMs = Math.round(performance.now() - startedAt);

  return Object.freeze({
    command: 'chat',
    session_id: session.sessionId,
    turn: session.turnCount,
    goal,
    success: result.execute.success,
    mode: 'deterministic',
    workflow_id: result.planning.workflow?.identity.workflow_id,
    ...(memorySessionId !== undefined ? { memory_session_id: memorySessionId } : {}),
    llm_elapsed_ms: elapsedMs,
    retrieval: Object.freeze({
      selected: result.retrieval.context.items.length,
      total_candidates: result.retrieval.context.totalCandidates,
      prior_goals: Object.freeze(result.retrieval.context.items.map((item) => item.text)),
    }),
    execution: Object.freeze({
      lifecycle: result.execute.context.lifecycle,
      outputs: result.execute.context.outputs.length,
      session_id: result.execute.context.session_id.toJSON(),
    }),
  });
}

async function executeLlmChatTurn(
  session: ChatSessionState,
  goal: string,
): Promise<ChatTurnPayload> {
  session.turnCount += 1;
  const startedAt = performance.now();

  const result = await session.client.llm.ask(goal, { history: selectRecentTurns(session) });
  const elapsedMs = Math.round(performance.now() - startedAt);

  recordTurnMessages(session, [
    Object.freeze({ role: 'user' as const, content: goal }),
    ...result.transcript,
  ]);

  session.lastTurn = Object.freeze({
    goal,
    output: result.finalMessage,
  });

  return Object.freeze({
    command: 'chat',
    session_id: session.sessionId,
    turn: session.turnCount,
    goal,
    success: result.success,
    mode: 'llm',
    llm_message: result.finalMessage,
    llm_turns: result.turns,
    llm_reasoning_steps: mapTranscriptToReasoningSteps(result.transcript),
    llm_elapsed_ms: elapsedMs,
    llm_usage: Object.freeze({
      input_tokens: result.usage.inputTokens,
      output_tokens: result.usage.outputTokens,
    }),
    budget_exceeded: result.budgetExceeded,
    retrieval: Object.freeze({
      selected: 0,
      total_candidates: 0,
      prior_goals: Object.freeze([]),
    }),
    execution: Object.freeze({
      lifecycle: result.success ? 'complete' : 'failed',
      outputs: 0,
      session_id: session.sessionId,
    }),
  });
}

export async function executeChatTurn(
  atlasService: AtlasService,
  session: ChatSessionState,
  goal: string,
): Promise<ChatTurnPayload> {
  if (session.client.llm.isConfigured()) {
    return executeLlmChatTurn(session, goal);
  }

  return executeDeterministicChatTurn(atlasService, session, goal);
}

export async function applyCorrection(
  session: ChatSessionState,
  correctionText: string,
): Promise<CorrectionOutcome> {
  if (correctionText.length === 0) {
    return Object.freeze({
      status: 'usage',
      message: 'Usage: /correct <what should have been different>',
    });
  }

  if (!session.client.llm.isConfigured()) {
    return Object.freeze({
      status: 'llm_required',
      message: 'Correction requires LLM mode (set ATLAS_LLM_API_KEY and ATLAS_LLM_MODEL).',
    });
  }

  if (session.lastTurn === undefined) {
    return Object.freeze({
      status: 'no_prior_turn',
      message: 'Nothing to correct yet — ask something first.',
    });
  }

  const result = await recordFeedback(session.client, session.lastTurn, correctionText);

  return Object.freeze({
    status: 'recorded',
    message: `Feedback recorded (${result.recordId}).`,
    recordId: result.recordId,
  });
}
