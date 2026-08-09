import type { ChatApiPayload } from '../../presentation/map-chat-response.js';
import type { ActivityItemType, ActivityResponseProduct } from '../../presentation/map-activity.js';
import type {
  BrandsResponseProduct,
  CreateBrandResponseProduct,
} from '../../presentation/map-brand.js';
import type { HistoryResponseProduct } from '../../presentation/map-history.js';
import type { KnowledgeSearchResponseProduct } from '../../presentation/map-knowledge.js';
import { getState } from '../state/app-state.js';

export interface CorrectionApiPayload {
  readonly status: 'recorded' | 'usage' | 'llm_required' | 'no_prior_turn';
  readonly message: string;
  readonly recordId?: string;
}

export interface WorkspacesResponse {
  readonly workspaces: readonly string[];
}

function workspaceBody(slug: string): { workspace?: string } {
  return slug === 'default' ? {} : { workspace: slug };
}

export async function fetchWorkspaces(): Promise<WorkspacesResponse> {
  const response = await fetch('/api/workspaces');

  if (!response.ok) {
    throw new Error('Unable to load workspaces');
  }

  return response.json() as Promise<WorkspacesResponse>;
}

function brandsQuery(activeWorkspace: string): string {
  const params = new URLSearchParams();
  params.set('activeWorkspace', activeWorkspace);
  return `?${params.toString()}`;
}

export async function fetchBrands(activeWorkspace: string): Promise<BrandsResponseProduct> {
  const response = await fetch(`/api/brands${brandsQuery(activeWorkspace)}`);
  const payload = (await response.json()) as BrandsResponseProduct & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Unable to load brands');
  }

  return payload;
}

export class BrandApiError extends Error {
  readonly status: number;
  readonly technical?: string;

  constructor(message: string, status: number, technical?: string) {
    super(message);
    this.name = 'BrandApiError';
    this.status = status;
    this.technical = technical;
  }
}

export async function createBrand(
  name: string,
  purpose?: string,
): Promise<CreateBrandResponseProduct> {
  const response = await fetch('/api/brands', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      name,
      ...(purpose !== undefined ? { purpose } : {}),
      activeWorkspace: getState().activeWorkspace,
    }),
  });

  const payload = (await response.json()) as CreateBrandResponseProduct & {
    error?: string;
    technical?: string;
  };

  if (!response.ok) {
    throw new BrandApiError(payload.error ?? 'Unable to create brand', response.status, payload.technical);
  }

  return payload;
}

function historyQuery(slug: string): string {
  return slug === 'default' ? '' : `?workspace=${encodeURIComponent(slug)}`;
}

export async function fetchHistory(slug: string): Promise<HistoryResponseProduct> {
  const response = await fetch(`/api/history${historyQuery(slug)}`);

  if (!response.ok) {
    throw new Error('Unable to load history');
  }

  return response.json() as Promise<HistoryResponseProduct>;
}

export async function searchKnowledge(
  slug: string,
  query: string,
): Promise<KnowledgeSearchResponseProduct> {
  const params = new URLSearchParams();

  if (slug !== 'default') {
    params.set('workspace', slug);
  }

  params.set('query', query);

  const response = await fetch(`/api/knowledge/search?${params.toString()}`);
  const payload = (await response.json()) as KnowledgeSearchResponseProduct & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Knowledge search failed');
  }

  return payload;
}

function activityQuery(
  slug: string,
  options?: { limit?: number; type?: ActivityItemType },
): string {
  const params = new URLSearchParams();

  if (slug !== 'default') {
    params.set('workspace', slug);
  }

  if (options?.limit !== undefined) {
    params.set('limit', String(options.limit));
  }

  if (options?.type !== undefined) {
    params.set('type', options.type);
  }

  const query = params.toString();
  return query.length > 0 ? `?${query}` : '';
}

export async function fetchActivity(
  slug: string,
  options?: { limit?: number; type?: ActivityItemType },
): Promise<ActivityResponseProduct> {
  const response = await fetch(`/api/activity${activityQuery(slug, options)}`);
  const payload = (await response.json()) as ActivityResponseProduct & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Activity request failed');
  }

  return payload;
}

export async function sendChatMessage(
  slug: string,
  goal: string,
): Promise<ChatApiPayload> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ goal, ...workspaceBody(slug) }),
  });

  const payload = (await response.json()) as ChatApiPayload & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Chat request failed');
  }

  return payload;
}

export async function sendCorrection(
  slug: string,
  correction: string,
): Promise<CorrectionApiPayload> {
  const response = await fetch('/api/correct', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ correction, ...workspaceBody(slug) }),
  });

  const payload = (await response.json()) as CorrectionApiPayload & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Correction request failed');
  }

  return payload;
}
