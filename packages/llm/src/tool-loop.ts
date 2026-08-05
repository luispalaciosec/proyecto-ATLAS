import { createBudgetTracker, type LlmBudget } from './budget.js';
import type {
  LlmMessage,
  LlmProvider,
  LlmToolDefinition,
  LlmUsage,
} from './provider.js';

export interface ToolExecutor {
  readonly definition: LlmToolDefinition;
  execute(args: Readonly<Record<string, unknown>>): Promise<string>;
}

export interface RunToolLoopOptions {
  readonly provider: LlmProvider;
  readonly systemPrompt: string;
  readonly userMessage: string;
  readonly tools: readonly ToolExecutor[];
  readonly budget?: LlmBudget;
  readonly history?: readonly LlmMessage[];
}

export interface ToolLoopResult {
  readonly success: boolean;
  readonly finalMessage: string;
  readonly turns: number;
  readonly usage: LlmUsage;
  readonly budgetExceeded: boolean;
  readonly transcript: readonly LlmMessage[];
}

function extractAssistantText(message: LlmMessage): string {
  return message.content.trim();
}

function findLastAssistantText(transcript: readonly LlmMessage[]): string {
  for (let index = transcript.length - 1; index >= 0; index -= 1) {
    const message = transcript[index];

    if (message?.role === 'assistant') {
      return extractAssistantText(message);
    }
  }

  return '';
}

export async function runToolLoop(options: RunToolLoopOptions): Promise<ToolLoopResult> {
  const budget = options.budget ?? { maxTurns: 6 };
  const tracker = createBudgetTracker(budget);
  const transcript: LlmMessage[] = [];
  const messages: LlmMessage[] = [
    ...(options.history ?? []),
    { role: 'user', content: options.userMessage },
  ];
  const systemMessage: LlmMessage = { role: 'system', content: options.systemPrompt };
  const toolDefinitions = Object.freeze(options.tools.map((tool) => tool.definition));
  const toolMap = new Map(options.tools.map((tool) => [tool.definition.name, tool]));

  let totalUsage: LlmUsage = Object.freeze({ inputTokens: 0, outputTokens: 0 });
  let turns = 0;
  let budgetExceeded = false;

  while (true) {
    if (tracker.turns >= budget.maxTurns) {
      budgetExceeded = true;
      break;
    }

    const result = await options.provider.complete({
      messages: [systemMessage, ...messages],
      ...(toolDefinitions.length > 0 ? { tools: toolDefinitions } : {}),
    });

    turns += 1;
    totalUsage = Object.freeze({
      inputTokens: totalUsage.inputTokens + result.usage.inputTokens,
      outputTokens: totalUsage.outputTokens + result.usage.outputTokens,
    });

    transcript.push(result.message);
    messages.push(result.message);

    const budgetResult = tracker.consume(result.usage);

    if (budgetResult.exceeded) {
      budgetExceeded = true;
      break;
    }

    const toolCalls = result.message.toolCalls ?? [];

    if (
      (result.stopReason === 'tool_use' || toolCalls.length > 0) &&
      toolCalls.length > 0
    ) {
      for (const toolCall of toolCalls) {
        const executor = toolMap.get(toolCall.name);
        let toolResult: string;

        try {
          if (executor === undefined) {
            toolResult = JSON.stringify({ error: `Unknown tool: ${toolCall.name}` });
          } else {
            toolResult = await executor.execute(toolCall.arguments);
          }
        } catch (error) {
          toolResult = JSON.stringify({
            error: error instanceof Error ? error.message : String(error),
          });
        }

        const toolMessage: LlmMessage = Object.freeze({
          role: 'tool',
          content: toolResult,
          toolCallId: toolCall.id,
        });

        messages.push(toolMessage);
        transcript.push(toolMessage);
      }

      continue;
    }

    return Object.freeze({
      success: true,
      finalMessage: extractAssistantText(result.message),
      turns,
      usage: totalUsage,
      budgetExceeded: false,
      transcript: Object.freeze([...transcript]),
    });
  }

  return Object.freeze({
    success: false,
    finalMessage: findLastAssistantText(transcript),
    turns,
    usage: totalUsage,
    budgetExceeded,
    transcript: Object.freeze([...transcript]),
  });
}
