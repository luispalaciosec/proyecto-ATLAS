import { formatWorkingContext } from '../lib/brand-context.js';
import { copyTextToClipboard } from '../lib/copy-text.js';
import { appendExpandableDetails } from '../lib/expandable-details.js';
import { t } from '../../i18n/index.js';
import { formatCorrectionStatus, formatUserError } from '../../presentation/format-error.js';
import { mapChatResponse } from '../../presentation/map-chat-response.js';
import { fetchHistory, sendChatMessage, sendCorrection } from '../api/client.js';
import { deriveRecentConversationTitle, mapHistoryMessagesToUi } from '../lib/history.js';
import { renderMarkdown } from '../lib/markdown.js';
import {
  appendChatMessage,
  createMessageId,
  getState,
  patchState,
  removeLastErrorMessage,
  replaceLastLoadingMessage,
  resolveBrandDisplayName,
  setChatMessages,
  type UiChatMessage,
} from '../state/app-state.js';

let boundMain: HTMLElement | null = null;
let lastCorrectableMessageId: string | undefined;

export function renderChat(main: HTMLElement): void {
  boundMain = main;
  const state = getState();
  const workspaceName = resolveBrandDisplayName(state.activeWorkspace);
  const contextLine = formatWorkingContext(state.activeWorkspace, workspaceName);

  main.innerHTML = `
    <section class="page chat-layout">
      <header class="page__header">
        <h1 class="page__title">${t('chat.title')}</h1>
        <p class="page__subtitle">${contextLine}</p>
      </header>
      <div class="banner">${t('workspace.isolationBanner', { name: workspaceName })}</div>
      <div id="chat-thread" class="chat-thread" aria-busy="false"></div>
      <section class="correction-panel" id="correction-panel" hidden aria-labelledby="correction-panel-title">
        <h2 id="correction-panel-title" class="card__title">${t('chat.correctTitle')}</h2>
        <label class="chat-composer__label" for="correction-input">${t('chat.correctLabel')}</label>
        <textarea id="correction-input" class="chat-composer__input" rows="3" placeholder="${t('chat.correctPlaceholder')}"></textarea>
        <div class="actions-row">
          <button type="button" class="btn btn--secondary" id="correction-cancel">${t('common.cancel')}</button>
          <button type="button" class="btn btn--primary" id="correction-submit">${t('chat.correctSubmit')}</button>
        </div>
      </section>
      <form id="chat-form" class="chat-composer">
        <label class="chat-composer__label" for="chat-input">${t('chat.placeholder')}</label>
        <div class="chat-composer__row">
          <textarea id="chat-input" class="chat-composer__input" rows="3" placeholder="${t('chat.placeholder')}"></textarea>
          <button type="submit" class="btn btn--primary" id="chat-send">${t('chat.send')}</button>
        </div>
      </form>
    </section>
  `;

  bindChatEvents(main);

  if (getState().chatHistoryLoadedFor !== state.activeWorkspace) {
    void preloadHistory();
  } else {
    paintMessages();
  }
}

async function preloadHistory(): Promise<void> {
  const workspace = getState().activeWorkspace;

  if (getState().chatHistoryLoading || getState().chatHistoryLoadedFor === workspace) {
    return;
  }

  patchState({ chatHistoryLoading: true, statusText: t('chat.recovering') });
  paintHistoryLoading();

  try {
    const payload = await fetchHistory(workspace);
    const messages = mapHistoryMessagesToUi(payload.messages);
    lastCorrectableMessageId = [...messages]
      .reverse()
      .find((message) => message.kind === 'assistant')?.id;
    setChatMessages(messages, { canCorrect: payload.canCorrect });
  } catch {
    // Fall back to empty chat without breaking the flow.
  } finally {
    patchState({
      chatHistoryLoading: false,
      chatHistoryLoadedFor: workspace,
      statusText: '',
    });
    paintMessages();
  }
}

function paintHistoryLoading(): void {
  if (boundMain === null) {
    return;
  }

  const thread = boundMain.querySelector('#chat-thread') as HTMLElement;
  thread.setAttribute('aria-busy', 'true');
  thread.innerHTML = `
    <div class="chat-empty">
      <p class="chat-empty__body">${t('chat.recovering')}</p>
    </div>
  `;
}

function bindChatEvents(main: HTMLElement): void {
  const form = main.querySelector('#chat-form') as HTMLFormElement;
  const input = main.querySelector('#chat-input') as HTMLTextAreaElement;
  const correctionPanel = main.querySelector('#correction-panel') as HTMLElement;
  const correctionInput = main.querySelector('#correction-input') as HTMLTextAreaElement;

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const message = input.value.trim();

    if (message.length === 0) {
      patchState({ statusText: t('errors.emptyMessage') });
      return;
    }

    await submitChatMessage(message);
    input.value = '';
  });

  main.querySelector('#correction-cancel')?.addEventListener('click', () => {
    correctionPanel.hidden = true;
    correctionInput.value = '';
  });

  main.querySelector('#correction-submit')?.addEventListener('click', async () => {
    const correction = correctionInput.value.trim();

    if (correction.length === 0) {
      patchState({ statusText: t('errors.emptyCorrection') });
      return;
    }

    await submitCorrection(correction);
    correctionPanel.hidden = true;
    correctionInput.value = '';
  });
}

function paintMessages(): void {
  if (boundMain === null) {
    return;
  }

  const thread = boundMain.querySelector('#chat-thread') as HTMLElement;
  const state = getState();
  thread.setAttribute('aria-busy', String(state.chatLoading || state.chatHistoryLoading));

  if (state.chatHistoryLoading) {
    paintHistoryLoading();
    return;
  }

  if (state.chatMessages.length === 0) {
    thread.innerHTML = `
      <div class="chat-empty">
        <h2 class="chat-empty__title">${t('chat.emptyTitle')}</h2>
        <p class="chat-empty__body">${t('chat.emptyBody')}</p>
        <p class="chat-empty__hint">${t('chat.emptyHint')}</p>
      </div>
    `;
    return;
  }

  thread.replaceChildren();

  for (const message of state.chatMessages) {
    thread.append(renderMessageElement(message));
  }

  thread.scrollTop = thread.scrollHeight;
}

function renderMessageElement(message: UiChatMessage): HTMLElement {
  const element = document.createElement('article');
  element.className = `message message--${message.kind}`;
  element.dataset.messageId = message.id;

  if (message.markdown) {
    const content = document.createElement('div');
    content.className = 'message__markdown';
    content.innerHTML = renderMarkdown(message.text);
    element.append(content);
  } else {
    element.textContent = message.text;
  }

  if (message.kind === 'assistant' && message.id === lastCorrectableMessageId && getState().canCorrect) {
    const actions = document.createElement('div');
    actions.className = 'message__actions';

    const copyButton = document.createElement('button');
    copyButton.type = 'button';
    copyButton.className = 'btn btn--ghost';
    copyButton.textContent = t('common.copy');
    copyButton.addEventListener('click', async (event) => {
      event.preventDefault();
      event.stopPropagation();

      const originalLabel = copyButton.textContent ?? t('common.copy');
      const copied = await copyTextToClipboard(message.text);

      if (copied) {
        copyButton.textContent = t('common.copied');
        copyButton.classList.add('message__action--success');
        patchState({ statusText: t('common.copied') });
        window.setTimeout(() => {
          copyButton.textContent = originalLabel;
          copyButton.classList.remove('message__action--success');
        }, 2000);
        return;
      }

      patchState({ statusText: t('errors.copyFailed') });
    });

    const correctButton = document.createElement('button');
    correctButton.type = 'button';
    correctButton.className = 'btn btn--ghost';
    correctButton.textContent = t('chat.correct');
    correctButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      const panel = boundMain?.querySelector('#correction-panel') as HTMLElement | null;
      const correctionInput = boundMain?.querySelector('#correction-input') as HTMLTextAreaElement | null;

      if (panel !== null) {
        panel.hidden = false;
        panel.scrollIntoView?.({ behavior: 'smooth', block: 'nearest' });
        correctionInput?.focus();
      }
    });

    actions.append(copyButton, correctButton);
    element.append(actions);
  }

  if (message.kind === 'error') {
    const panel = document.createElement('div');
    panel.className = 'error-panel';

    const failedGoal = getState().lastFailedGoal;

    if (failedGoal !== undefined && failedGoal.length > 0) {
      const actions = document.createElement('div');
      actions.className = 'error-panel__actions';

      const retryButton = document.createElement('button');
      retryButton.type = 'button';
      retryButton.className = 'btn btn--primary';
      retryButton.textContent = t('common.retry');
      retryButton.addEventListener('click', () => {
        void retryFailedMessage(failedGoal);
      });

      actions.append(retryButton);
      panel.append(actions);
    }

    if (message.technicalDetails !== undefined) {
      appendExpandableDetails(panel, message.technicalDetails);
    }

    element.append(panel);
  }

  return element;
}

interface SubmitChatOptions {
  readonly skipUserMessage?: boolean;
}

async function submitChatMessage(message: string, options?: SubmitChatOptions): Promise<void> {
  const state = getState();
  patchState({ chatLoading: true, statusText: t('chat.thinking'), lastFailedGoal: undefined });
  removeLastErrorMessage();

  if (options?.skipUserMessage !== true) {
    appendChatMessage({ id: createMessageId(), kind: 'user', text: message });
  }

  appendChatMessage({ id: createMessageId(), kind: 'loading', text: t('chat.thinking') });
  paintMessages();
  setComposerDisabled(true);

  try {
    const payload = await sendChatMessage(state.activeWorkspace, message);
    const view = mapChatResponse(payload);
    const assistantId = createMessageId();
    lastCorrectableMessageId = assistantId;
    replaceLastLoadingMessage({
      id: assistantId,
      kind: 'assistant',
      text: view.assistantMessage,
      markdown: true,
      technicalDetails: view.technicalDetails,
    });
    patchState({
      chatLoading: false,
      canCorrect: view.canCorrect,
      statusText: view.activityMessage,
      chatHistoryLoadedFor: state.activeWorkspace,
    });
  } catch (error) {
    const formatted = formatUserError(error instanceof Error ? error.message : String(error));
    replaceLastLoadingMessage({
      id: createMessageId(),
      kind: 'error',
      text: formatted.message,
      technicalDetails: formatted.technical,
    });
    patchState({
      chatLoading: false,
      canCorrect: false,
      statusText: formatted.message,
      lastFailedGoal: message,
    });
  } finally {
    setComposerDisabled(false);
    paintMessages();
  }
}

async function retryFailedMessage(message: string): Promise<void> {
  await submitChatMessage(message, { skipUserMessage: true });
}

async function submitCorrection(correction: string): Promise<void> {
  patchState({ statusText: t('chat.correcting') });

  try {
    const payload = await sendCorrection(getState().activeWorkspace, correction);
    const formatted = formatCorrectionStatus(payload.status, payload.message);
    appendChatMessage({
      id: createMessageId(),
      kind: 'system',
      text: formatted.message,
    });
    patchState({ statusText: formatted.message, canCorrect: false });
  } catch (error) {
    const formatted = formatUserError(error instanceof Error ? error.message : String(error));
    appendChatMessage({
      id: createMessageId(),
      kind: 'error',
      text: formatted.message,
      technicalDetails: formatted.technical,
    });
    patchState({ statusText: formatted.message });
  }

  paintMessages();
}

function setComposerDisabled(disabled: boolean): void {
  if (boundMain === null) {
    return;
  }

  const input = boundMain.querySelector('#chat-input') as HTMLTextAreaElement | null;
  const send = boundMain.querySelector('#chat-send') as HTMLButtonElement | null;
  if (input) input.disabled = disabled;
  if (send) send.disabled = disabled;
}

export function refreshChatView(): void {
  paintMessages();
}

export async function reloadChatHistory(): Promise<void> {
  patchState({ chatHistoryLoadedFor: undefined });
  if (boundMain !== null) {
    await preloadHistory();
  }
}

export { deriveRecentConversationTitle };
