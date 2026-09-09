import * as readline from 'node:readline/promises';

import type { Atlas } from '@atlas/sdk';

import type { Container } from '../application/container.js';
import { CliExitError, EXIT_INVALID_ARGUMENTS } from '../output/exit-codes.js';
import { createChatSession, type ChatSessionState } from './chat-session.js';
import { applyCorrection, executeChatTurn, type ChatTurnPayload } from './chat-turn.js';
import { parseCorrectCommand } from './feedback.js';

export type { ChatTurnPayload } from './chat-turn.js';

export interface ChatLineReader {
  readLine(prompt: string): Promise<string | null>;
  close(): Promise<void>;
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

  return (
    normalized === '/exit' ||
    normalized === '/quit' ||
    normalized === 'exit' ||
    normalized === 'quit'
  );
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
  const outcome = await applyCorrection(session, correctionText);
  renderFeedbackNotice(container, json, outcome.message, outcome.recordId);
}

export async function runChatRepl(
  container: Container,
  options: RunChatReplOptions = {},
): Promise<void> {
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
        const payload = await executeChatTurn(container.atlasService, session, goal);
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
