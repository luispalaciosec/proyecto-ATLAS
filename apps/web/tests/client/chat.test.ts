/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderChat } from '../../src/client/pages/chat.js';
import { getState, setActiveWorkspace } from '../../src/client/state/app-state.js';

const sendChatMessage = vi.fn();
const fetchHistory = vi.fn();
const sendCorrection = vi.fn();

vi.mock('../../src/client/api/client.js', () => ({
  fetchHistory: (...args: unknown[]) => fetchHistory(...args),
  sendChatMessage: (...args: unknown[]) => sendChatMessage(...args),
  sendCorrection: (...args: unknown[]) => sendCorrection(...args),
}));

async function flushUi(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('renderChat', () => {
  beforeEach(() => {
    document.body.innerHTML = '<main id="main"></main>';
    setActiveWorkspace('default', { resetChat: true });
    fetchHistory.mockReset();
    sendChatMessage.mockReset();
    fetchHistory.mockResolvedValue({
      workspace: 'default',
      messages: [],
      canCorrect: false,
    });
  });

  it('preloads history and paints messages', async () => {
    fetchHistory.mockResolvedValue({
      workspace: 'default',
      messages: [
        {
          id: 'hist.default.0.user',
          role: 'user',
          content: 'Hola ATLAS',
          createdAt: '2026-01-01T00:00:00.000Z',
        },
        {
          id: 'hist.default.1.assistant',
          role: 'assistant',
          content: 'Respuesta previa',
          createdAt: '2026-01-01T00:00:01.000Z',
        },
      ],
      canCorrect: false,
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderChat(main);
    await flushUi();

    expect(getState().chatMessages).toHaveLength(2);
    expect(main.textContent).toContain('Hola ATLAS');
    expect(main.textContent).toContain('Respuesta previa');
  });

  it('shows empty state when history is empty', async () => {
    const main = document.querySelector('#main') as HTMLElement;
    renderChat(main);
    await flushUi();

    expect(main.textContent).toContain('Empieza una conversación con ATLAS');
  });

  it('shows retry button after failure', async () => {
    sendChatMessage.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const main = document.querySelector('#main') as HTMLElement;
    renderChat(main);
    await flushUi();

    const input = main.querySelector('#chat-input') as HTMLTextAreaElement;
    input.value = 'Mi solicitud original';
    (main.querySelector('#chat-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    expect(getState().lastFailedGoal).toBe('Mi solicitud original');
    expect(main.textContent).toContain('Intentar de nuevo');
    const errorMessage = main.querySelector('.message--error');
    expect(errorMessage?.textContent).toContain('No hay conexión con ATLAS');
    const details = main.querySelector('.error-panel__details') as HTMLElement | null;
    expect(details?.hidden).toBe(true);
    expect(details?.textContent).toContain('ECONNREFUSED');
  });

  it('retry reuses the original message without duplicating the user turn', async () => {
    sendChatMessage
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ mode: 'deterministic', success: true });

    const main = document.querySelector('#main') as HTMLElement;
    renderChat(main);
    await flushUi();

    const input = main.querySelector('#chat-input') as HTMLTextAreaElement;
    input.value = 'Mi solicitud original';
    (main.querySelector('#chat-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    const userMessagesBeforeRetry = getState().chatMessages.filter((message) => message.kind === 'user');
    expect(userMessagesBeforeRetry).toHaveLength(1);

    const retryButton = main.querySelector('.error-panel .btn--primary') as HTMLButtonElement;
    retryButton.click();
    await flushUi();
    await flushUi();

    const userMessagesAfterRetry = getState().chatMessages.filter((message) => message.kind === 'user');
    expect(userMessagesAfterRetry).toHaveLength(1);
    expect(sendChatMessage).toHaveBeenLastCalledWith('default', 'Mi solicitud original');
    expect(getState().chatMessages.some((message) => message.kind === 'assistant')).toBe(true);
    expect(getState().lastFailedGoal).toBeUndefined();
  });

  it('shows a friendly error when retry fails again', async () => {
    sendChatMessage
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('429 rate limit'));

    const main = document.querySelector('#main') as HTMLElement;
    renderChat(main);
    await flushUi();

    const input = main.querySelector('#chat-input') as HTMLTextAreaElement;
    input.value = 'Mi solicitud original';
    (main.querySelector('#chat-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    const retryButton = main.querySelector('.error-panel .btn--primary') as HTMLButtonElement;
    retryButton.click();
    await flushUi();
    await flushUi();

    expect(getState().lastFailedGoal).toBe('Mi solicitud original');
    expect(main.textContent).toContain('Intentar de nuevo');
    const errorMessage = main.querySelector('.message--error');
    expect(errorMessage?.textContent).toContain('temporalmente ocupado');
    const details = main.querySelector('.error-panel__details') as HTMLElement | null;
    expect(details?.hidden).toBe(true);
    expect(details?.textContent).toContain('429');
  });

  it('copies assistant text and shows inline confirmation', async () => {
    const writeText = vi.fn(async () => undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    sendChatMessage.mockResolvedValueOnce({
      mode: 'llm',
      success: true,
      llm_message: 'Respuesta copiable',
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderChat(main);
    await flushUi();

    const input = main.querySelector('#chat-input') as HTMLTextAreaElement;
    input.value = 'Hola';
    (main.querySelector('#chat-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    const copyButton = main.querySelector('.message__actions .btn--ghost') as HTMLButtonElement;
    copyButton.click();
    await flushUi();

    expect(writeText).toHaveBeenCalledWith('Respuesta copiable');
    expect(copyButton.textContent).toBe('Copiado');
    expect(getState().statusText).toBe('Copiado');
  });

  it('opens correction panel above composer when correcting', async () => {
    sendChatMessage.mockResolvedValueOnce({
      mode: 'llm',
      success: true,
      llm_message: 'Respuesta corregible',
    });

    const main = document.querySelector('#main') as HTMLElement;
    renderChat(main);
    await flushUi();

    const input = main.querySelector('#chat-input') as HTMLTextAreaElement;
    input.value = 'Hola';
    (main.querySelector('#chat-form') as HTMLFormElement).requestSubmit();
    await flushUi();
    await flushUi();

    const panel = main.querySelector('#correction-panel') as HTMLElement;
    const form = main.querySelector('#chat-form') as HTMLFormElement;
    const buttons = main.querySelectorAll('.message__actions .btn--ghost');
    const correctButton = buttons[buttons.length - 1] as HTMLButtonElement;

    expect(panel.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();

    correctButton.click();

    expect(panel.hidden).toBe(false);
    expect(main.querySelector('#correction-input')).not.toBeNull();
  });

  it('shows live reasoning panel while waiting for assistant response', async () => {
    let resolveChat!: (value: Record<string, unknown>) => void;
    const chatPromise = new Promise<Record<string, unknown>>((resolve) => {
      resolveChat = resolve;
    });

    sendChatMessage.mockReturnValue(chatPromise);

    const main = document.querySelector('#main') as HTMLElement;
    renderChat(main);
    await flushUi();

    const input = main.querySelector('#chat-input') as HTMLTextAreaElement;
    input.value = 'Plan semanal de contenido';
    (main.querySelector('#chat-form') as HTMLFormElement).requestSubmit();
    await flushUi();

    expect(main.textContent).toContain('Razonamiento');
    expect(main.textContent).toContain('Analizando tu solicitud');
    expect(main.querySelector('.chat-composer__send--loading')).not.toBeNull();

    resolveChat({
      mode: 'llm',
      success: true,
      llm_message: 'Plan listo',
      llm_turns: 2,
      llm_elapsed_ms: 4200,
      llm_usage: { input_tokens: 300, output_tokens: 180 },
      llm_reasoning_steps: [
        { type: 'memory_search', preview: 'contenido' },
        { type: 'composing' },
      ],
    });

    await flushUi();
    await flushUi();

    expect(main.textContent).toContain('Plan listo');
    expect(main.textContent).toContain('Ver razonamiento');
    expect(main.textContent).toMatch(/tokens/);
  });
});
