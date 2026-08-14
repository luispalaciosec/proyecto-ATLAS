export type ChatReasoningStepType =
  | 'inferencing'
  | 'memory_search'
  | 'memory_store'
  | 'plan_and_execute'
  | 'composing';

export interface ChatReasoningStepPayload {
  readonly type: ChatReasoningStepType;
  readonly preview?: string;
}

interface ReasoningTranscriptMessage {
  readonly role: string;
  readonly content: string;
  readonly toolCalls?: readonly {
    readonly name: string;
    readonly arguments: Readonly<Record<string, unknown>>;
  }[];
}

function truncate(value: string, max: number): string {
  const trimmed = value.trim();

  if (trimmed.length <= max) {
    return trimmed;
  }

  return `${trimmed.slice(0, max - 1)}…`;
}

function summarizeToolPreview(name: string, args: Readonly<Record<string, unknown>>): string | undefined {
  if (name === 'memory_search' && typeof args.query === 'string') {
    return truncate(args.query, 80);
  }

  if (name === 'memory_store' && typeof args.content === 'string') {
    return truncate(args.content, 80);
  }

  if (name === 'plan_and_execute' && typeof args.goal === 'string') {
    return truncate(args.goal, 80);
  }

  return undefined;
}

function isKnownToolType(name: string): name is Exclude<ChatReasoningStepType, 'inferencing' | 'composing'> {
  return name === 'memory_search' || name === 'memory_store' || name === 'plan_and_execute';
}

export function mapTranscriptToReasoningSteps(
  transcript: readonly ReasoningTranscriptMessage[],
): readonly ChatReasoningStepPayload[] {
  const steps: ChatReasoningStepPayload[] = [];

  for (const message of transcript) {
    if (message.role !== 'assistant') {
      continue;
    }

    const toolCalls = message.toolCalls ?? [];

    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        if (isKnownToolType(toolCall.name)) {
          steps.push({
            type: toolCall.name,
            preview: summarizeToolPreview(toolCall.name, toolCall.arguments),
          });
        } else {
          steps.push({ type: 'inferencing', preview: toolCall.name });
        }
      }

      continue;
    }

    const content = message.content.trim();

    if (content.length > 0 && steps.every((step) => step.type !== 'inferencing')) {
      steps.unshift({ type: 'inferencing', preview: truncate(content, 120) });
    }
  }

  if (steps.length === 0) {
    steps.push({ type: 'inferencing' });
  }

  if (steps[steps.length - 1]?.type !== 'composing') {
    steps.push({ type: 'composing' });
  }

  return Object.freeze(steps);
}
