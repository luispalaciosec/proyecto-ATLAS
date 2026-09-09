import { t } from '../../i18n/index.js';
import type { ChatReasoningStepProduct } from '../../presentation/map-chat-response.js';
import { startElapsedTimer } from './format-chat-metrics.js';

export interface UiReasoningStep {
  readonly type: string;
  readonly label: string;
  readonly preview?: string;
  readonly status: 'active' | 'done' | 'pending';
}

const SIMULATED_PHASE_KEYS = [
  'chat.reasoningUnderstand',
  'chat.reasoningSearch',
  'chat.reasoningConnect',
  'chat.reasoningCompose',
] as const;

export function toUiReasoningSteps(
  steps: readonly ChatReasoningStepProduct[],
  activeIndex = steps.length - 1,
): readonly UiReasoningStep[] {
  return steps.map((step, index) => ({
    type: step.type,
    label: step.label,
    preview: step.preview,
    status: index < activeIndex ? 'done' : index === activeIndex ? 'active' : 'pending',
  }));
}

export function renderReasoningPanel(
  steps: readonly UiReasoningStep[],
  options: { live?: boolean; title?: string } = {},
): HTMLElement {
  const panel = document.createElement('section');
  panel.className = `chat-reasoning${options.live ? ' chat-reasoning--live' : ''}`;
  panel.setAttribute('aria-live', options.live ? 'polite' : 'off');

  const heading = document.createElement('div');
  heading.className = 'chat-reasoning__header';

  const title = document.createElement('p');
  title.className = 'chat-reasoning__title';
  title.textContent = options.title ?? t('chat.reasoningTitle');

  const pulse = document.createElement('span');
  pulse.className = 'chat-reasoning__pulse';
  pulse.setAttribute('aria-hidden', 'true');

  heading.append(title, pulse);

  const list = document.createElement('ol');
  list.className = 'chat-reasoning__steps';

  for (const step of steps) {
    list.append(renderReasoningStep(step));
  }

  panel.append(heading, list);
  return panel;
}

function renderReasoningStep(step: UiReasoningStep): HTMLElement {
  const item = document.createElement('li');
  item.className = `chat-reasoning__step chat-reasoning__step--${step.status}`;
  item.dataset.reasoningType = step.type;

  const marker = document.createElement('span');
  marker.className = 'chat-reasoning__marker';
  marker.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'chat-reasoning__label';
  label.textContent = step.label;

  item.append(marker, label);
  return item;
}

export function startSimulatedReasoning(container: HTMLElement, messageId: string): () => void {
  let phaseIndex = 0;
  let stepIndex = 0;
  const simulatedSteps: UiReasoningStep[] = SIMULATED_PHASE_KEYS.map((key, index) => ({
    type: `sim-${index}`,
    label: t(key),
    status: index === 0 ? 'active' : 'pending',
  }));

  const panel = renderReasoningPanel(simulatedSteps, { live: true });
  panel.dataset.reasoningMessageId = messageId;
  container.replaceChildren(panel);

  const stopElapsedTimer = startElapsedTimer(panel);

  const intervalId = window.setInterval(() => {
    const stepsList = container.querySelector('.chat-reasoning__steps');
    const items = stepsList?.querySelectorAll('.chat-reasoning__step');

    if (items === undefined || items.length === 0) {
      return;
    }

    items[stepIndex]?.classList.replace(
      'chat-reasoning__step--active',
      'chat-reasoning__step--done',
    );

    stepIndex = Math.min(stepIndex + 1, items.length - 1);
    items[stepIndex]?.classList.replace(
      'chat-reasoning__step--pending',
      'chat-reasoning__step--active',
    );

    phaseIndex = (phaseIndex + 1) % SIMULATED_PHASE_KEYS.length;

    if (stepIndex >= items.length - 1) {
      const label = items[stepIndex]?.querySelector('.chat-reasoning__label');

      if (label !== null && label !== undefined) {
        label.textContent = t(SIMULATED_PHASE_KEYS[phaseIndex]!);
      }
    }
  }, 1800);

  return () => {
    window.clearInterval(intervalId);
    stopElapsedTimer();
  };
}

export function renderCompletedReasoningSummary(
  steps: readonly ChatReasoningStepProduct[],
): HTMLElement {
  const details = document.createElement('details');
  details.className = 'chat-reasoning-summary';

  const summary = document.createElement('summary');
  summary.className = 'chat-reasoning-summary__toggle';
  summary.textContent = t('chat.reasoningShow');

  const panel = renderReasoningPanel(
    toUiReasoningSteps(steps, steps.length - 1).map((step) => ({
      ...step,
      status: 'done' as const,
    })),
    { title: t('chat.reasoningTitle') },
  );

  details.append(summary, panel);

  details.addEventListener('toggle', () => {
    summary.textContent = details.open ? t('chat.reasoningHide') : t('chat.reasoningShow');
  });

  return details;
}
