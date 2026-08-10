import type { ActivityItemProduct } from '../../presentation/map-activity.js';
import { formatActivityTime } from '../../presentation/map-activity.js';
import logoUrl from '../../../design-system/assets/logo.svg?url';
import { fetchActivity, fetchHistory } from '../api/client.js';
import {
  deriveRecentConversationEntries,
  type RecentConversationEntry,
} from '../lib/history.js';
import { formatWorkingContext } from '../lib/brand-context.js';
import { createActionIcon, createActivityIcon } from '../lib/icons.js';
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
      <section class="home-hero home-primary" aria-labelledby="home-hero-title">
        <div class="home-hero__content">
          <p class="home-page__context" aria-live="polite">${contextLine}</p>
          <h1 id="home-hero-title" class="home-hero__title">${t('home.heroTitle')}</h1>
          <p class="home-hero__subtitle">${t('home.heroSubtitle')}</p>
          <p class="home-hero__description">${t('home.heroDescription')}</p>
          <p class="home-hero__product-note">${t('app.productPhrase')}</p>
        </div>
        <div class="home-hero__visual" aria-hidden="true">
          <div class="home-rocket">
            <div class="home-rocket__glow"></div>
            <div class="home-rocket__horizon"></div>
            <img class="home-rocket__logo" src="${logoUrl}" alt="" width="100" height="100" decoding="async" />
          </div>
        </div>
      </section>

      <section class="home-section home-actions" aria-labelledby="home-actions-title">
        <h2 id="home-actions-title" class="home-section__heading">${t('home.actionsTitle')}</h2>
        <div class="home-action-grid home-secondary" id="home-action-grid"></div>
      </section>

      <div class="home-columns">
        <section
          class="home-section home-section--continue"
          aria-labelledby="home-continue-title"
          aria-live="polite"
          aria-busy="${homeState.historyLoading ? 'true' : 'false'}"
        >
          <h2 id="home-continue-title" class="home-section__heading">${t('home.continueTitle')}</h2>
          <p class="home-section__note">${t('home.historySessionNote')}</p>
          <article class="card home-panel">
            <div id="home-continue" class="home-continue"></div>
          </article>
        </section>

        <section class="home-section home-section--examples" aria-labelledby="home-examples-title">
          <h2 id="home-examples-title" class="home-section__heading">${t('home.examplesTitle')}</h2>
          <article class="card home-panel">
            <div class="example-list" id="home-examples"></div>
          </article>
        </section>
      </div>

      <section
        class="home-section home-section--activity"
        aria-labelledby="home-activity-title"
        aria-live="polite"
        aria-busy="${homeState.activityLoading ? 'true' : 'false'}"
      >
        <h2 id="home-activity-title" class="home-section__heading">
          ${t('home.activityTitle')} · ${t('home.activitySessionScope')}
        </h2>
        <p class="home-section__note">${t('workspace.sessionScopeNote')}</p>
        <article class="card home-panel">
          <div id="home-activity" class="home-activity"></div>
        </article>
      </section>

      <aside class="home-alert" role="note">
        <span class="home-alert__marker" aria-hidden="true"></span>
        <p class="home-alert__text">${t('home.isolationAlert')}</p>
      </aside>
    </section>
  `;

  const actionGrid = main.querySelector('#home-action-grid') as HTMLElement;
  actionGrid.append(
    createActionCard({
      buttonId: 'home-primary-chat',
      icon: 'chat',
      tone: 'primary',
      title: t('home.actionChatTitle'),
      description: t('home.actionChatBody'),
      cta: t('home.actionChatCta'),
      onClick: () => {
        setRoute('/chat');
      },
    }),
    createActionCard({
      cardId: 'home-action-knowledge',
      buttonId: 'home-knowledge-cta',
      icon: 'knowledge',
      tone: 'cyan',
      title: t('home.actionKnowledgeTitle'),
      description: t('home.actionKnowledgeBody'),
      cta: t('home.actionKnowledgeCta'),
      onClick: () => {
        setRoute('/conocimiento');
      },
    }),
    createActionCard({
      cardId: 'home-action-brands',
      icon: 'brands',
      tone: 'primary',
      title: t('home.actionBrandTitle'),
      description: t('home.actionBrandBody'),
      cta: t('home.actionBrandCta'),
      onClick: () => {
        setRoute('/marcas');
      },
    }),
    createActionCard({
      cardId: 'home-action-activity',
      icon: 'activity',
      tone: 'warning',
      title: t('home.actionActivityTitle'),
      description: t('home.actionActivityBody'),
      cta: t('home.actionActivityCta'),
      onClick: () => {
        setRoute('/actividad');
      },
    }),
  );

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

  paintHistorySection(main);
  paintActivitySection(main);
  void loadHomeData();
}

interface ActionCardOptions {
  readonly buttonId?: string;
  readonly cardId?: string;
  readonly icon: 'chat' | 'knowledge' | 'brands' | 'activity';
  readonly tone: 'primary' | 'cyan' | 'warning';
  readonly title: string;
  readonly description: string;
  readonly cta: string;
  readonly onClick: () => void;
}

function createActionCard(options: ActionCardOptions): HTMLElement {
  const card = document.createElement('article');
  card.className = `action-card action-card--${options.tone}`;

  if (options.cardId !== undefined) {
    card.id = options.cardId;
  }

  const iconWrap = document.createElement('div');
  iconWrap.className = 'action-card__icon';
  iconWrap.append(createActionIcon(options.icon));

  const title = document.createElement('h3');
  title.className = 'action-card__title';
  title.textContent = options.title;

  const description = document.createElement('p');
  description.className = 'action-card__body';
  description.textContent = options.description;

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'action-card__cta';
  if (options.buttonId !== undefined) {
    button.id = options.buttonId;
  }
  button.textContent = options.cta;
  button.addEventListener('click', options.onClick);

  card.append(iconWrap, title, description, button);
  return card;
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
    list.append(createActivityPreviewItem(item));
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
  row.className = 'home-continue-item history-item';

  const content = document.createElement('div');
  content.className = 'history-item__content';

  const title = document.createElement('p');
  title.className = 'history-item__question';
  title.textContent = item.title;

  const meta = document.createElement('p');
  meta.className = 'history-item__meta';
  meta.textContent = item.brandName;

  content.append(title, meta);

  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'btn btn--secondary history-item__action home-continue-item__action';
  action.textContent = t('home.continueAction');
  action.addEventListener('click', () => {
    setRoute('/chat');
  });

  row.append(content, action);
  return row;
}

function createActivityPreviewItem(item: ActivityItemProduct): HTMLElement {
  const row = document.createElement('div');
  row.className = `activity-item activity-item--${item.type}`;

  const main = document.createElement('div');
  main.className = 'activity-item__main';

  const iconWrap = document.createElement('span');
  iconWrap.className = 'activity-item__icon';
  iconWrap.append(createActivityIcon(item.type === 'error' ? 'error' : item.type));

  const text = document.createElement('span');
  text.className = 'activity-item__text';
  text.textContent = item.quote ?? item.title;

  main.append(iconWrap, text);

  const time = document.createElement('span');
  time.className = 'activity-item__time';
  time.textContent = formatActivityTime(item.occurredAt);

  row.append(main, time);
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
