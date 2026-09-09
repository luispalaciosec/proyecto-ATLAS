import type { BrandProduct } from '../../presentation/map-brand.js';
import { t } from '../../i18n/index.js';

const STORAGE_KEY = 'atlas.activeWorkspace';

export type AppRoute =
  '/' | '/chat' | '/conocimiento' | '/memoria' | '/actividad' | '/marcas' | '/configuracion';

export type ChatMessageKind = 'user' | 'assistant' | 'system' | 'error' | 'loading';

export interface UiChatReasoningStep {
  readonly type: string;
  readonly label: string;
  readonly preview?: string;
}

export interface UiChatMetrics {
  readonly elapsedMs: number;
  readonly inputTokens?: number;
  readonly outputTokens?: number;
}

export interface UiChatMessage {
  readonly id: string;
  readonly kind: ChatMessageKind;
  readonly text: string;
  readonly markdown?: boolean;
  readonly technicalDetails?: string;
  readonly reasoningSteps?: readonly UiChatReasoningStep[];
  readonly metrics?: UiChatMetrics;
}

export interface AppState {
  route: AppRoute;
  activeWorkspace: string;
  workspaces: string[];
  brands: readonly BrandProduct[];
  brandsLoaded: boolean;
  sidebarOpen: boolean;
  statusText: string;
  chatMessages: UiChatMessage[];
  chatLoading: boolean;
  chatHistoryLoading: boolean;
  chatHistoryLoadedFor?: string;
  canCorrect: boolean;
  lastFailedGoal?: string;
  pendingChatDraft?: string;
  pendingKnowledgeQuery?: string;
}

let state: AppState = {
  route: normalizeRoute(window.location.pathname),
  activeWorkspace: readStoredWorkspace(),
  workspaces: ['default'],
  brands: [],
  brandsLoaded: false,
  sidebarOpen: false,
  statusText: '',
  chatMessages: [],
  chatLoading: false,
  chatHistoryLoading: false,
  canCorrect: false,
};

type Listener = () => void;
const listeners = new Set<Listener>();

function readStoredWorkspace(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || 'default';
  } catch {
    return 'default';
  }
}

function persistWorkspace(slug: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // ignore storage failures
  }
}

export function normalizeRoute(pathname: string): AppRoute {
  if (pathname === '/chat') return '/chat';
  if (pathname === '/conocimiento' || pathname === '/memoria') return '/conocimiento';
  if (pathname === '/actividad') return '/actividad';
  if (pathname === '/marcas') return '/marcas';
  if (pathname === '/configuracion') return '/configuracion';
  return '/';
}

export function routeToPath(route: AppRoute): string {
  return route === '/' ? '/' : route;
}

export function getState(): AppState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  for (const listener of listeners) {
    listener();
  }
}

export function patchState(partial: Partial<AppState>): void {
  state = { ...state, ...partial };
  emit();
}

export function setRoute(route: AppRoute): void {
  if (route === state.route) {
    return;
  }

  patchState({ route, sidebarOpen: false });
  window.history.pushState({ route }, '', routeToPath(route));
}

export function setActiveWorkspace(slug: string, options?: { resetChat?: boolean }): void {
  const trimmed = slug.trim();
  persistWorkspace(trimmed);
  patchState({
    activeWorkspace: trimmed,
    chatMessages: options?.resetChat === false ? state.chatMessages : [],
    chatHistoryLoadedFor: options?.resetChat === false ? state.chatHistoryLoadedFor : undefined,
    canCorrect: options?.resetChat === false ? state.canCorrect : false,
    lastFailedGoal: undefined,
  });
}

export function setWorkspaces(workspaces: readonly string[]): void {
  patchState({ workspaces: [...workspaces] });
}

export function applyBrandCatalog(payload: {
  readonly brands: readonly BrandProduct[];
  readonly activeBrandId: string;
}): void {
  const brandIds = payload.brands.map((brand) => brand.id);
  const nextActive = brandIds.includes(state.activeWorkspace) ? state.activeWorkspace : 'default';

  if (nextActive !== state.activeWorkspace) {
    persistWorkspace(nextActive);
  }

  patchState({
    brands: payload.brands,
    brandsLoaded: true,
    workspaces: brandIds,
    activeWorkspace: nextActive,
  });
}

export function resolveBrandDisplayName(brandId: string): string {
  const brand = state.brands.find((entry) => entry.id === brandId);

  if (brand !== undefined) {
    return brand.name;
  }

  if (brandId === 'default') {
    return t('workspace.general');
  }

  return t('brands.loadingName');
}

export function setChatMessages(
  messages: UiChatMessage[],
  options?: { canCorrect?: boolean },
): void {
  patchState({
    chatMessages: messages,
    canCorrect: options?.canCorrect ?? false,
    lastFailedGoal: undefined,
  });
}

export function appendChatMessage(message: UiChatMessage): void {
  patchState({ chatMessages: [...state.chatMessages, message] });
}

export function replaceLastLoadingMessage(message: UiChatMessage): void {
  const next = [...state.chatMessages];
  const last = next.at(-1);

  if (last?.kind === 'loading') {
    next.pop();
  }

  next.push(message);
  patchState({ chatMessages: next });
}

export function removeLastErrorMessage(): void {
  const next = [...state.chatMessages];
  const last = next.at(-1);

  if (last?.kind === 'error') {
    next.pop();
    patchState({ chatMessages: next });
  }
}

export function clearChatMessages(): void {
  patchState({
    chatMessages: [],
    canCorrect: false,
    lastFailedGoal: undefined,
    chatHistoryLoadedFor: undefined,
  });
}

export function createMessageId(): string {
  return `msg.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
}

export function setPendingChatDraft(text: string | undefined): void {
  patchState({ pendingChatDraft: text });
}

export function consumePendingChatDraft(): string | undefined {
  const draft = state.pendingChatDraft;

  if (draft !== undefined) {
    patchState({ pendingChatDraft: undefined });
  }

  return draft;
}

export function setPendingKnowledgeQuery(text: string | undefined): void {
  patchState({ pendingKnowledgeQuery: text });
}

export function consumePendingKnowledgeQuery(): string | undefined {
  const query = state.pendingKnowledgeQuery;
  patchState({ pendingKnowledgeQuery: undefined });
  return query;
}

export function initRouter(onRouteChange: () => void): void {
  if (window.location.pathname === '/memoria') {
    window.history.replaceState({ route: '/conocimiento' }, '', '/conocimiento');
    patchState({ route: '/conocimiento' });
  }

  window.addEventListener('popstate', () => {
    const pathname = window.location.pathname;
    if (pathname === '/memoria') {
      window.history.replaceState({ route: '/conocimiento' }, '', '/conocimiento');
    }
    patchState({ route: normalizeRoute(window.location.pathname), sidebarOpen: false });
    onRouteChange();
  });

  window.history.replaceState({ route: state.route }, '', routeToPath(state.route));
}
