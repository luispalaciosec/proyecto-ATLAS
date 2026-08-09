import type { ActivityItemProduct } from '../../presentation/map-activity.js';
import { formatActivityTime } from '../../presentation/map-activity.js';
import { fetchActivity, fetchHistory } from '../api/client.js';
import {
  deriveRecentConversationEntries,
  type RecentConversationEntry,
} from '../lib/history.js';
import { formatWorkingContext } from '../lib/brand-context.js';
import { t } from '../../i18n/index.js';
import {
  getState,
  resolveBrandDisplayName,
  setPendingChatDraft,
  setRoute,
} from '../state/app-state.js';

const EXAMPLE_KEYS = ['home.example1', 'home.example2', 'home.example3', 'home.example4'] as const;

interface HomePageState {
  workspace: string;
  historyLoading: boolean;
  historyError?: string;
  historyItems: readonly RecentConversationEntry[];
  activityLoading: boolean;
  activityError?: string;
  activityItems: readonly ActivityItemProduct[];
}

let boundMain: HTMLElement | null = null;
let homeState: HomePageState = {
  workspace: 'default',
  historyLoading: true,
  historyItems: [],
  activityLoading: true,
  activityItems: [],
};

export function renderHome(main: HTMLElement): void {
  boundMain = main;
  const state = getState();
  const brandName = resolveBrandDisplayName(state.activeWorkspace);
  const contextLine = formatWorkingContext(state.activeWorkspace, brandName);

  if (homeState.workspace !== state.activeWorkspace) {
    homeState = {
      workspace: state.activeWorkspace,
      historyLoading: true,
      historyItems: [],
      activityLoading: true,
      activityItems: [],
    };
  }

  main.innerHTML = `
    <section class="page home-page">
      <header class="page__header home-page__header">
        <p class="home-page__eyebrow">${t('app.name')}</p>
        <h1 class="page__title home-page__title">${t('app.productPhrase')}</h1>
        <p class="home-page__context" aria-live="polite">${contextLine}</p>
      </header>

      <section class="home-primary" aria-labelledby="home-primary-title">
        <div class="home-primary__content">
          <h2 id="home-primary-title" class="home-primary__title">${t('home.primaryTitle')}</h2>
          <p class="home-primary__body">${t('home.primaryBody')}</p>
        </div>
        <button type="button" class="btn btn--primary home-primary__cta" id="home-primary-chat">
          ${t('home.primaryCta')}
        </button>
      </section>

      <nav class="home-secondary" aria-label="${t('home.secondaryNav')}">
        <button type="button" class="home-secondary__action" id="home-action-knowledge">
          ${t('home.secondaryKnowledge')}
        </button>
        <button type="button" class="home-secondary__action" id="home-action-brands">
          ${t('home.secondaryBrand')}
        </button>
        <button type="button" class="home-secondary__action" id="home-action-activity">
          ${t('home.secondaryActivity')}
        </button>
      </nav>

      <section class="home-section" aria-labelledby="home-examples-title">
        <h2 id="home-examples-title" class="home-section__title">${t('home.examplesTitle')}</h2>
        <div class="example-list" id="home-examples"></div>
      </section>

      <section
        class="home-section home-section--continue"
        aria-labelledby="home-continue-title"
        aria-live="polite"
        aria-busy="${homeState.historyLoading ? 'true' : 'false'}"
      >
        <h2 id="home-continue-title" class="home-section__title">${t('home.continueTitle')}</h2>
        <p class="home-section__note">${t('home.historySessionNote')}</p>
        <div id="home-continue" class="home-continue"></div>
      </section>

      <section class="home-section home-section--knowledge" aria-labelledby="home-knowledge-title">
        <article class="home-knowledge">
          <h2 id="home-knowledge-title" class="home-knowledge__title">${t('home.knowledgeTitle')}</h2>
          <p class="home-knowledge__body">${t('home.knowledgeBody')}</p>
          <button type="button" class="btn btn--secondary" id="home-knowledge-cta">
            ${t('home.knowledgeCta')}
          </button>
        </article>
      </section>

      <section
        class="home-section home-section--activity"
        aria-labelledby="home-activity-title"
        aria-live="polite"
        aria-busy="${homeState.activityLoading ? 'true' : 'false'}"
      >
        <h2 id="home-activity-title" class="home-section__title">
          ${t('home.activityTitle')} · ${t('home.activitySessionScope')}
        </h2>
        <p class="home-section__note">${t('workspace.sessionScopeNote')}</p>
        <div id="home-activity" class="home-activity"></div>
      </section>
    </section>
  `;

  const examples = main.querySelector('#home-examples') as HTMLElement;
  for (const key of EXAMPLE_KEYS) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'example-chip';
    button.textContent = t(key);
    button.addEventListener('click', () => {
      setPendingChatDraft(t(key));
      setRoute('/chat');
    });
    examples.append(button);
  }

  main.querySelector('#home-primary-chat')?.addEventListener('click', () => {
    setRoute('/chat');
  });

  main.querySelector('#home-action-knowledge')?.addEventListener('click', () => {
    setRoute('/conocimiento');
  });

  main.querySelector('#home-action-brands')?.addEventListener('click', () => {
    setRoute('/marcas');
  });

  main.querySelector('#home-action-activity')?.addEventListener('click', () => {
    setRoute('/actividad');
  });

  main.querySelector('#home-knowledge-cta')?.addEventListener('click', () => {
    setRoute('/conocimiento');
  });

  paintHistorySection(main);
  paintActivitySection(main);
  void loadHomeData();
}

export function refreshHomeView(): void {
  if (boundMain === null) {
    return;
  }

  void loadHomeData();
}

async function loadHomeData(): Promise<void> {
  if (boundMain === null) {
    return;
  }

  const workspace = getState().activeWorkspace;
  const brandName = resolveBrandDisplayName(workspace);
  const showLoading =
    homeState.workspace !== workspace ||
    (homeState.historyItems.length === 0 &&
      homeState.activityItems.length === 0 &&
      homeState.historyError === undefined &&
      homeState.activityError === undefined);

  if (showLoading) {
    homeState = {
      ...homeState,
      workspace,
      historyLoading: true,
      historyError: undefined,
      activityLoading: true,
      activityError: undefined,
    };

    if (boundMain !== null) {
      paintHistorySection(boundMain);
      paintActivitySection(boundMain);
    }
  } else {
    homeState = { ...homeState, workspace };
  }

  const [historyResult, activityResult] = await Promise.allSettled([
    fetchHistory(workspace),
    fetchActivity(workspace, { limit: 3 }),
  ]);

  if (boundMain === null || getState().activeWorkspace !== workspace) {
    return;
  }

  if (historyResult.status === 'fulfilled') {
    homeState = {
      ...homeState,
      historyLoading: false,
      historyItems: deriveRecentConversationEntries(historyResult.value.messages, brandName),
    };
  } else {
    homeState = {
      ...homeState,
      historyLoading: false,
      historyItems: [],
      historyError: t('home.historyError'),
    };
  }

  if (activityResult.status === 'fulfilled') {
    homeState = {
      ...homeState,
      activityLoading: false,
      activityItems: activityResult.value.items,
    };
  } else {
    homeState = {
      ...homeState,
      activityLoading: false,
      activityItems: [],
      activityError: t('home.activityError'),
    };
  }

  paintHistorySection(boundMain);
  paintActivitySection(boundMain);
}

function paintHistorySection(main: HTMLElement): void {
  const container = main.querySelector('#home-continue') as HTMLElement;
  const section = main.querySelector('.home-section--continue') as HTMLElement;
  section.setAttribute('aria-busy', String(homeState.historyLoading));
  container.replaceChildren();

  if (homeState.historyLoading) {
    container.append(createLoadingMessage(t('home.historyLoading')));
    return;
  }

  if (homeState.historyError !== undefined) {
    container.append(createErrorPanel(homeState.historyError, () => {
      homeState = { ...homeState, historyLoading: true, historyError: undefined };
      void loadHomeData();
    }));
    return;
  }

  if (homeState.historyItems.length === 0) {
    container.append(createEmptyPanel(
      t('home.continueEmptyTitle'),
      t('home.continueEmptyBody'),
      t('home.primaryCta'),
      () => {
        setRoute('/chat');
      },
    ));
    return;
  }

  const list = document.createElement('ul');
  list.className = 'home-continue-list';

  for (const item of homeState.historyItems) {
    list.append(createContinueItem(item));
  }

  container.append(list);
}

function paintActivitySection(main: HTMLElement): void {
  const container = main.querySelector('#home-activity') as HTMLElement;
  const section = main.querySelector('.home-section--activity') as HTMLElement;
  section.setAttribute('aria-busy', String(homeState.activityLoading));
  container.replaceChildren();

  if (homeState.activityLoading) {
    container.append(createLoadingMessage(t('home.activityLoading')));
    return;
  }

  if (homeState.activityError !== undefined) {
    container.append(createErrorPanel(homeState.activityError, () => {
      homeState = { ...homeState, activityLoading: true, activityError: undefined };
      void loadHomeData();
    }));
    return;
  }

  if (homeState.activityItems.length === 0) {
    container.append(createEmptyPanel(
      t('home.activityEmptyTitle'),
      t('home.activityEmptyBody'),
      t('home.activityEmptyCta'),
      () => {
        setRoute('/actividad');
      },
    ));
    return;
  }

  const list = document.createElement('div');
  list.className = 'home-activity-list';

  for (const item of homeState.activityItems.slice(0, 3)) {
    const card = document.createElement('article');
    card.className = 'home-activity-item';

    const title = document.createElement('p');
    title.className = 'home-activity-item__title';
    title.textContent = item.title;

    const meta = document.createElement('p');
    meta.className = 'home-activity-item__meta';
    meta.textContent = item.quote ?? formatActivityTime(item.occurredAt);

    card.append(title, meta);
    list.append(card);
  }

  const actions = document.createElement('div');
  actions.className = 'home-section__actions';

  const viewAll = document.createElement('button');
  viewAll.type = 'button';
  viewAll.className = 'btn btn--secondary';
  viewAll.textContent = t('home.activityEmptyCta');
  viewAll.addEventListener('click', () => {
    setRoute('/actividad');
  });

  actions.append(viewAll);
  container.append(list, actions);
}

function createContinueItem(item: RecentConversationEntry): HTMLLIElement {
  const row = document.createElement('li');
  row.className = 'home-continue-item';

  const content = document.createElement('div');
  content.className = 'home-continue-item__content';

  const title = document.createElement('p');
  title.className = 'home-continue-item__title';
  title.textContent = item.title;

  const meta = document.createElement('p');
  meta.className = 'home-continue-item__meta';
  meta.textContent = item.brandName;

  content.append(title, meta);

  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'btn btn--secondary home-continue-item__action';
  action.textContent = t('home.continueAction');
  action.addEventListener('click', () => {
    setRoute('/chat');
  });

  row.append(content, action);
  return row;
}

function createLoadingMessage(text: string): HTMLElement {
  const message = document.createElement('p');
  message.className = 'home-state-message';
  message.textContent = text;
  return message;
}

function createEmptyPanel(
  titleText: string,
  bodyText: string,
  actionLabel: string,
  onAction: () => void,
): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'home-empty';

  const title = document.createElement('h3');
  title.className = 'home-empty__title';
  title.textContent = titleText;

  const body = document.createElement('p');
  body.className = 'home-empty__body';
  body.textContent = bodyText;

  const actions = document.createElement('div');
  actions.className = 'home-section__actions';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'btn btn--secondary';
  button.textContent = actionLabel;
  button.addEventListener('click', onAction);

  actions.append(button);
  panel.append(title, body, actions);
  return panel;
}

function createErrorPanel(message: string, onRetry: () => void): HTMLElement {
  const panel = document.createElement('section');
  panel.className = 'home-error error-panel';

  const text = document.createElement('p');
  text.textContent = message;

  const actions = document.createElement('div');
  actions.className = 'error-panel__actions';

  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'btn btn--primary';
  retry.textContent = t('common.retry');
  retry.addEventListener('click', onRetry);

  actions.append(retry);
  panel.append(text, actions);
  return panel;
}

export function renderPlaceholder(main: HTMLElement, titleKey: string): void {
  main.innerHTML = `
    <section class="page">
      <header class="page__header">
        <h1 class="page__title">${t(titleKey)}</h1>
      </header>
      <article class="card">
        <h2 class="card__title">${t('common.comingSoon')}</h2>
        <p class="card__body">${t('common.comingSoonBody')}</p>
        <div class="actions-row">
          <button type="button" class="btn btn--primary" id="placeholder-go-chat">${t('home.primaryCta')}</button>
        </div>
      </article>
    </section>
  `;

  main.querySelector('#placeholder-go-chat')?.addEventListener('click', () => {
    setRoute('/chat');
  });
}
