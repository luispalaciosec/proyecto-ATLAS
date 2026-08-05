import * as readline from 'node:readline/promises';

import type { Atlas } from '@atlas/sdk';

import type { Container } from '../application/container.js';
import { CliExitError, EXIT_INVALID_ARGUMENTS } from '../output/exit-codes.js';
import {
  captureLastMemorySessionId,
  createChatSession,
  type ChatSessionState,
} from './chat-session.js';
import { parseCorrectCommand, recordFeedback } from './feedback.js';

export interface ChatLineReader {
  readLine(prompt: string): Promise<string | null>;
  close(): Promise<void>;
}

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

export interface RunChatReplOptions {
  readonly json?: boolean;
  readonly reader?: ChatLineReader;
  readonly onTurn?: (payload: ChatTurnPayload) => void;
  readonly client?: Atlas;
}

function createReadlineReader(
  input: NodeJS.ReadableStream = process.stdin,
  output: NodeJS.WritableStream = process.stdout,
): ChatLineReader {
  const interface_ = readline.createInterface({ input, output });

  return {
    readLine: (prompt) => interface_.question(prompt),
    close: async () => {
      interface_.close();
    },
  };
}

function isExitCommand(line: string): boolean {
  const normalized = line.trim().toLowerCase();

  return normalized === '/exit' || normalized === '/quit' || normalized === 'exit' || normalized === 'quit';
}

function renderTurn(container: Container, payload: ChatTurnPayload, json: boolean): void {
  if (json) {
    container.renderer.json(payload);
    return;
  }

  container.renderer.info(`Session:     ${payload.session_id}`);
  container.renderer.info(`Turn:        ${payload.turn}`);
  container.renderer.info(`Goal:        ${payload.goal}`);

  if (payload.mode === 'llm') {
    container.renderer.info(`Mode:        LLM`);
    container.renderer.info(`LLM turns:   ${payload.llm_turns ?? 0}`);
    container.renderer.info(`Budget:      ${payload.budget_exceeded ? 'EXCEEDED' : 'OK'}`);
    container.renderer.info('');
    container.renderer.info(payload.llm_message ?? '');
    return;
  }

  container.renderer.info(
    `Retrieval:   ${payload.retrieval.selected} memory item(s) from ${payload.retrieval.total_candidates} candidate(s)`,
  );

  if (payload.retrieval.prior_goals.length > 0) {
    container.renderer.info(`Prior:       ${payload.retrieval.prior_goals.join(' | ')}`);
  }

  container.renderer.info(`Workflow:    ${payload.workflow_id ?? 'n/a'}`);
  container.renderer.info(`Execution:   ${payload.success ? 'SUCCESS' : 'FAILED'}`);
  container.renderer.info(`Runtime:     ${payload.execution.session_id}`);
}

async function executeDeterministicChatTurn(
  container: Container,
  session: ChatSessionState,
  goal: string,
): Promise<ChatTurnPayload> {
  session.turnCount += 1;

  const result = await container.atlasService.planAndExecute(session.client, goal);
  const memorySessionId = captureLastMemorySessionId(session);

  return Object.freeze({
    command: 'chat',
    session_id: session.sessionId,
    turn: session.turnCount,
    goal,
    success: result.execute.success,
    mode: 'deterministic',
    workflow_id: result.planning.workflow?.identity.workflow_id,
    ...(memorySessionId !== undefined ? { memory_session_id: memorySessionId } : {}),
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

  const result = await session.client.llm.ask(goal, { history: session.history });

  session.history.push(Object.freeze({ role: 'user', content: goal }));
  session.history.push(...result.transcript);

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

async function executeChatTurn(
  container: Container,
  session: ChatSessionState,
  goal: string,
): Promise<ChatTurnPayload> {
  if (session.client.llm.isConfigured()) {
    return executeLlmChatTurn(session, goal);
  }

  return executeDeterministicChatTurn(container, session, goal);
}

function renderFeedbackNotice(
  container: Container,
  json: boolean,
  message: string,
  recordId?: string,
): void {
  if (json) {
    container.renderer.json(
      Object.freeze({
        command: 'chat',
        event: recordId !== undefined ? 'feedback_recorded' : 'feedback_skipped',
        message,
        ...(recordId !== undefined ? { record_id: recordId } : {}),
      }),
    );
    return;
  }

  container.renderer.info(message);
}

async function handleCorrectCommand(
  container: Container,
  session: ChatSessionState,
  correctionText: string,
  json: boolean,
): Promise<void> {
  if (correctionText.length === 0) {
    renderFeedbackNotice(container, json, 'Usage: /correct <what should have been different>');
    return;
  }

  if (!session.client.llm.isConfigured()) {
    renderFeedbackNotice(
      container,
      json,
      'Correction requires LLM mode (set ATLAS_LLM_API_KEY and ATLAS_LLM_MODEL).',
    );
    return;
  }

  if (session.lastTurn === undefined) {
    renderFeedbackNotice(container, json, 'Nothing to correct yet — ask something first.');
    return;
  }

  const result = await recordFeedback(session.client, session.lastTurn, correctionText);
  renderFeedbackNotice(
    container,
    json,
    `Feedback recorded (${result.recordId}).`,
    result.recordId,
  );
}

export async function runChatRepl(container: Container, options: RunChatReplOptions = {}): Promise<void> {
  const client = options.client ?? container.atlasService.createMemoryClient();
  const session = createChatSession(client);
  const reader = options.reader ?? createReadlineReader();
  const json = options.json ?? false;

  if (!json) {
    container.renderer.info(`Atlas Chat — session ${session.sessionId}`);
    container.renderer.info('Enter goals (/exit to quit)');
  } else {
    container.renderer.json({
      command: 'chat',
      event: 'session_started',
      session_id: session.sessionId,
    });
  }

  try {
    while (true) {
      const line = await reader.readLine(json ? '' : 'goal> ');

      if (line === null) {
        break;
      }

      const goal = line.trim();

      if (goal.length === 0) {
        continue;
      }

      if (isExitCommand(goal)) {
        break;
      }

      const correctionText = parseCorrectCommand(goal);

      if (correctionText !== null) {
        try {
          await handleCorrectCommand(container, session, correctionText, json);
        } catch (error) {
          if (error instanceof CliExitError) {
            throw error;
          }

          const message = error instanceof Error ? error.message : String(error);
          throw new CliExitError(EXIT_INVALID_ARGUMENTS, message);
        }

        continue;
      }

      try {
        const payload = await executeChatTurn(container, session, goal);
        options.onTurn?.(payload);
        renderTurn(container, payload, json);
      } catch (error) {
        if (error instanceof CliExitError) {
          throw error;
        }

        const message = error instanceof Error ? error.message : String(error);
        throw new CliExitError(EXIT_INVALID_ARGUMENTS, message);
      }
    }
  } finally {
    await reader.close();
  }

  if (json) {
    container.renderer.json({
      command: 'chat',
      event: 'session_ended',
      session_id: session.sessionId,
      turns: session.turnCount,
    });
  }
}
