import { t } from '../i18n/index.js';
import { loadBrandCatalog } from './lib/brand-catalog.js';
import { bindWorkspaceSwitch, switchWorkspace } from './lib/workspace-switch.js';
import { bindShellEvents, renderShell, updateShellChrome, type ShellElements } from './components/shell.js';
import { renderChat, refreshChatView } from './pages/chat.js';
import { renderHome, refreshHomeView } from './pages/home.js';
import {
  applyPendingChatDraftToComposer,
  renderKnowledge,
  refreshKnowledgeView,
} from './pages/knowledge.js';
import { renderActivity, refreshActivityView } from './pages/activity.js';
import { renderBrands, refreshBrandsView } from './pages/brands.js';
import {
  type AppRoute,
  getState,
  initRouter,
  patchState,
  setRoute,
  subscribe,
} from './state/app-state.js';

import './styles/app.css';

let shellElements: ShellElements | undefined;
let lastRenderedRoute: AppRoute | undefined;
let lastRenderedWorkspace: string | undefined;

function shouldFullRenderRoute(): boolean {
  const state = getState();
  return state.route !== lastRenderedRoute || state.activeWorkspace !== lastRenderedWorkspace;
}

function markRenderedRoute(): void {
  const state = getState();
  lastRenderedRoute = state.route;
  lastRenderedWorkspace = state.activeWorkspace;
}

function refreshCurrentRouteView(): void {
  switch (getState().route) {
    case '/chat':
      refreshChatView();
      break;
    case '/conocimiento':
      refreshKnowledgeView();
      break;
    case '/actividad':
      refreshActivityView();
      break;
    case '/marcas':
      refreshBrandsView();
      break;
    case '/':
      refreshHomeView();
      break;
    default:
      break;
  }
}

export async function mountApp(root: HTMLElement): Promise<void> {
  shellElements = renderShell(root);

  bindWorkspaceSwitch(shellElements, renderCurrentRoute);

  bindShellEvents(shellElements, {
    onToggleSidebar: () => {
      patchState({ sidebarOpen: !getState().sidebarOpen });
    },
    onCloseSidebar: () => {
      patchState({ sidebarOpen: false });
    },
    onBrandSelect: (brandId) => {
      void switchWorkspace(brandId);
    },
    onManageBrands: () => {
      setRoute('/marcas');
    },
  });

  subscribe(() => {
    if (shouldFullRenderRoute()) {
      markRenderedRoute();
      renderCurrentRoute();
    } else {
      refreshCurrentRouteView();
    }

    if (shellElements) {
      updateShellChrome(shellElements, {
        onCloseSidebar: () => {
          patchState({ sidebarOpen: false });
        },
      });
    }
  });

  initRouter(() => {
    renderCurrentRoute();
  });

  try {
    await loadBrandCatalog();
  } catch {
    patchState({ statusText: t('workspace.loadError') });
  }

  renderCurrentRoute();
  markRenderedRoute();
  updateShellChrome(shellElements, {
    onCloseSidebar: () => {
      patchState({ sidebarOpen: false });
    },
  });
}

function renderCurrentRoute(): void {
  if (shellElements === undefined) {
    return;
  }

  const route = getState().route;

  switch (route) {
    case '/chat':
      renderChat(shellElements.main);
      refreshChatView();
      applyPendingChatDraftToComposer();
      break;
    case '/conocimiento':
      renderKnowledge(shellElements.main);
      refreshKnowledgeView();
      break;
    case '/actividad':
      renderActivity(shellElements.main);
      refreshActivityView();
      break;
    case '/marcas':
      renderBrands(shellElements.main);
      refreshBrandsView();
      break;
    case '/configuracion':
      renderSettingsPlaceholder(shellElements.main);
      break;
    default:
      renderHome(shellElements.main);
      break;
  }
}

function renderSettingsPlaceholder(main: HTMLElement): void {
  main.innerHTML = `
    <section class="page">
      <header class="page__header">
        <h1 class="page__title">${t('pages.settingsTitle')}</h1>
      </header>
      <article class="card">
        <h2 class="card__title">${t('common.comingSoon')}</h2>
        <p class="card__body">${t('common.comingSoonBody')}</p>
        <div class="actions-row">
          <button type="button" class="btn btn--primary" id="placeholder-go-chat">${t('home.startChat')}</button>
        </div>
      </article>
    </section>
  `;

  main.querySelector('#placeholder-go-chat')?.addEventListener('click', () => {
    setRoute('/chat');
  });
}

export { switchWorkspace };
