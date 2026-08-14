import { t } from '../../i18n/index.js';

export interface ChatMetricsDisplay {
  readonly elapsedMs: number;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
}

function formatSeconds(elapsedMs: number): string {
  const seconds = elapsedMs / 1000;

  if (seconds < 10) {
    return seconds.toFixed(1);
  }

  return Math.round(seconds).toString();
}

function formatTokenCount(value: number): string {
  return new Intl.NumberFormat('es-ES').format(value);
}

export function formatChatMetrics(metrics: ChatMetricsDisplay): string {
  const elapsed = t('chat.metricsElapsed', { seconds: formatSeconds(metrics.elapsedMs) });

  if (metrics.inputTokens === undefined && metrics.outputTokens === undefined) {
    return elapsed;
  }

  const inputTokens = metrics.inputTokens ?? 0;
  const outputTokens = metrics.outputTokens ?? 0;
  const totalTokens = inputTokens + outputTokens;

  if (totalTokens <= 0) {
    return elapsed;
  }

  return t('chat.metricsSummary', {
    elapsed,
    total: formatTokenCount(totalTokens),
    input: formatTokenCount(inputTokens),
    output: formatTokenCount(outputTokens),
  });
}

export function startElapsedTimer(host: HTMLElement): () => void {
  const startedAt = performance.now();
  const elapsed = document.createElement('p');
  elapsed.className = 'chat-reasoning__elapsed';
  elapsed.setAttribute('aria-live', 'polite');

  const header = host.querySelector('.chat-reasoning__header');

  if (header !== null) {
    header.append(elapsed);
  } else {
    host.append(elapsed);
  }

  const tick = (): void => {
    elapsed.textContent = formatChatMetrics({
      elapsedMs: performance.now() - startedAt,
    });
  };

  tick();
  const intervalId = window.setInterval(tick, 100);

  return () => {
    window.clearInterval(intervalId);
  };
}

export function renderMessageMetrics(metrics: ChatMetricsDisplay): HTMLElement {
  const footer = document.createElement('p');
  footer.className = 'message__metrics';
  footer.textContent = formatChatMetrics(metrics);
  return footer;
}
