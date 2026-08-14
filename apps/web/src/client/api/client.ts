import type { ChatApiPayload } from '../../presentation/map-chat-response.js';
import type { ActivityItemType, ActivityResponseProduct } from '../../presentation/map-activity.js';
import type {
  BrandsResponseProduct,
  CreateBrandResponseProduct,
} from '../../presentation/map-brand.js';
import type { HistoryResponseProduct } from '../../presentation/map-history.js';
import type { KnowledgeSearchResponseProduct } from '../../presentation/map-knowledge.js';
import type { KnowledgeDocumentsResponseProduct } from '../../presentation/map-knowledge-documents.js';
import type { KnowledgeFoldersResponseProduct } from '../../presentation/map-knowledge-folders.js';
import { extractApiErrorMessage } from '../../lib/format-atlas-error.js';
import type { KnowledgeUploadResponseProduct } from '../../presentation/map-knowledge-upload.js';
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

export async function fetchKnowledgeFolders(slug: string): Promise<KnowledgeFoldersResponseProduct> {
  const params = new URLSearchParams();

  if (slug !== 'default') {
    params.set('workspace', slug);
  }

  const query = params.toString();
  const response = await fetch(
    query.length > 0 ? `/api/knowledge/folders?${query}` : '/api/knowledge/folders',
  );
  const payload = (await response.json()) as KnowledgeFoldersResponseProduct & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Knowledge folders request failed');
  }

  return payload;
}

export async function createKnowledgeFolder(
  slug: string,
  name: string,
): Promise<KnowledgeFoldersResponseProduct> {
  const response = await fetch('/api/knowledge/folders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(slug !== 'default' ? { workspace: slug } : {}),
      name,
    }),
  });
  const payload = (await response.json()) as KnowledgeFoldersResponseProduct & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Knowledge folder create failed');
  }

  return payload;
}

export async function fetchKnowledgeDocuments(
  slug: string,
  folder?: string,
): Promise<KnowledgeDocumentsResponseProduct> {
  const params = new URLSearchParams();

  if (slug !== 'default') {
    params.set('workspace', slug);
  }

  if (folder !== undefined && folder !== 'all') {
    params.set('folder', folder);
  }

  const query = params.toString();
  const response = await fetch(
    query.length > 0 ? `/api/knowledge/documents?${query}` : '/api/knowledge/documents',
  );
  const payload = (await response.json()) as KnowledgeDocumentsResponseProduct & { error?: string };

  if (!response.ok) {
    throw new Error(payload.error ?? 'Knowledge documents request failed');
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

export type KnowledgeUploadPhase = 'uploading' | 'reading' | 'indexing' | 'available' | 'error';

export interface KnowledgeUploadProgress {
  readonly phase: KnowledgeUploadPhase;
  readonly progress: number;
  readonly fileName: string;
}

export async function uploadKnowledgeDocument(
  slug: string,
  file: File,
  onProgress?: (progress: KnowledgeUploadProgress) => void,
  folder?: string,
): Promise<KnowledgeUploadResponseProduct> {
  const formData = new FormData();
  formData.append('file', file);

  if (slug !== 'default') {
    formData.append('workspace', slug);
  }

  if (folder !== undefined && folder.trim().length > 0) {
    formData.append('folder', folder.trim());
  }

  const report = (phase: KnowledgeUploadPhase, progress: number): void => {
    onProgress?.({ phase, progress, fileName: file.name });
  };

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    let readingTimer: ReturnType<typeof setTimeout> | undefined;
    let indexingTimer: ReturnType<typeof setTimeout> | undefined;

    const clearTimers = (): void => {
      if (readingTimer !== undefined) {
        clearTimeout(readingTimer);
        readingTimer = undefined;
      }

      if (indexingTimer !== undefined) {
        clearTimeout(indexingTimer);
        indexingTimer = undefined;
      }
    };

    report('uploading', 2);

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && event.total > 0) {
        const uploadPercent = Math.round((event.loaded / event.total) * 45);
        report('uploading', Math.max(5, uploadPercent));
      }
    });

    xhr.upload.addEventListener('load', () => {
      report('reading', 52);
      readingTimer = setTimeout(() => {
        report('indexing', 68);
      }, 350);
      indexingTimer = setTimeout(() => {
        report('indexing', 82);
      }, 1100);
    });

    xhr.addEventListener('load', () => {
      clearTimers();

      let payload: KnowledgeUploadResponseProduct & { error?: string };

      try {
        payload = JSON.parse(xhr.responseText) as KnowledgeUploadResponseProduct & { error?: string };
      } catch {
        report('error', 0);
        reject(new Error('Knowledge upload failed'));
        return;
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        report('available', 100);
        resolve(payload);
        return;
      }

      report('error', 0);
      reject(new Error(extractApiErrorMessage(payload, 'Knowledge upload failed')));
    });

    xhr.addEventListener('error', () => {
      clearTimers();
      report('error', 0);
      reject(new Error('Knowledge upload failed'));
    });

    xhr.addEventListener('abort', () => {
      clearTimers();
      report('error', 0);
      reject(new Error('Knowledge upload failed'));
    });

    xhr.open('POST', '/api/knowledge/upload');
    xhr.send(formData);
  });
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
    throw new Error(extractApiErrorMessage(payload, 'Chat request failed'));
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
    throw new Error(extractApiErrorMessage(payload, 'Correction request failed'));
  }

  return payload;
}
