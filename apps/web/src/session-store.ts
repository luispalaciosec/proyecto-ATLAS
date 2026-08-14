import { writeFileSync } from 'node:fs';

import {
  AtlasService,
  combineBrandContextPrompt,
  createChatSession,
  listWorkspaces,
  loadOrCreateBrandProfile,
  loadRecentFeedbackContext,
  renderProfileAsContext,
  resolveWorkspacePaths,
  type ChatSessionState,
  type WorkspaceProfile,
  type WorkspacePaths,
} from '@atlas/cli';

import {
  mapSessionHistoryToProduct,
  type HistoryResponseProduct,
} from './presentation/map-history.js';
import {
  mapKnowledgeSearchToProduct,
  type KnowledgeSearchResponseProduct,
} from './presentation/map-knowledge.js';
import type { KnowledgeUploadResponseProduct } from './presentation/map-knowledge-upload.js';
import { chunkText } from './lib/knowledge-upload/chunk-text.js';
import {
  EMPTY_EXTRACTION_MESSAGE,
  formatUnsupportedExtensionMessage,
  resolveSupportedExtension,
} from './lib/knowledge-upload/constants.js';
import {
  assertExtractedText,
  extractTextFromBuffer,
} from './lib/knowledge-upload/extract-text.js';
import { KnowledgeUploadError } from './lib/knowledge-upload/upload-errors.js';
import {
  mapActivityEventsToProduct,
  type ActivityItemType,
  type ActivityResponseProduct,
  type RawActivityEvent,
} from './presentation/map-activity.js';
import {
  BrandDuplicateError,
  BrandReservedError,
  BrandValidationError,
} from './presentation/brand-errors.js';
import {
  mapBrandsToProduct,
  mapCreateBrandResponse,
  type BrandsResponseProduct,
  type CreateBrandResponseProduct,
  type RawBrandProfile,
  type RawBrandRecord,
} from './presentation/map-brand.js';

const MAX_BRAND_NAME_LENGTH = 120;

interface ChatActivityPayload {
  readonly mode?: 'llm' | 'deterministic';
  readonly success?: boolean;
  readonly goal?: string;
  readonly llm_turns?: number;
  readonly retrieval?: {
    readonly selected?: number;
    readonly total_candidates?: number;
  };
}

interface CorrectionActivityOutcome {
  readonly status: string;
  readonly recordId?: string;
}

export interface UiHistoryMessage {
  readonly role: 'user' | 'assistant';
  readonly content: string;
}

export class SessionStore {
  readonly #atlasService = new AtlasService();
  readonly #sessions = new Map<string, ChatSessionState>();
  readonly #deterministicHistory = new Map<string, UiHistoryMessage[]>();
  readonly #activityLog = new Map<string, RawActivityEvent[]>();

  #createActivityId(): string {
    return `activity.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  }

  #appendActivity(workspaceKey: string | undefined, event: RawActivityEvent): void {
    const key = workspaceKey?.trim() || 'default';
    const existing = this.#activityLog.get(key) ?? [];
    this.#activityLog.set(key, [event, ...existing].slice(0, 200));
  }

  recordConversationActivity(
    workspaceKey: string | undefined,
    payload: ChatActivityPayload,
  ): void {
    const workspace = workspaceKey?.trim() || 'default';
    const success = payload.success !== false;
    const status: RawActivityEvent['status'] = success ? 'success' : 'warning';

    this.#appendActivity(workspaceKey, {
      id: this.#createActivityId(),
      kind: 'conversation',
      workspace,
      occurredAt: new Date().toISOString(),
      status,
      goal: payload.goal,
      mode: payload.mode,
      success,
      llmTurns: payload.llm_turns,
      retrievalSelected: payload.retrieval?.selected,
      retrievalTotal: payload.retrieval?.total_candidates,
    });
  }

  recordConversationError(
    workspaceKey: string | undefined,
    goal: string,
    errorMessage: string,
  ): void {
    const workspace = workspaceKey?.trim() || 'default';

    this.#appendActivity(workspaceKey, {
      id: this.#createActivityId(),
      kind: 'error',
      workspace,
      occurredAt: new Date().toISOString(),
      status: 'error',
      goal,
      errorMessage,
    });
  }

  recordKnowledgeActivity(
    workspaceKey: string | undefined,
    query: string,
    resultsTotal: number,
  ): void {
    const trimmed = query.trim();

    if (trimmed.length === 0) {
      return;
    }

    const workspace = workspaceKey?.trim() || 'default';

    this.#appendActivity(workspaceKey, {
      id: this.#createActivityId(),
      kind: 'knowledge',
      workspace,
      occurredAt: new Date().toISOString(),
      status: resultsTotal > 0 ? 'success' : 'info',
      query: trimmed,
      resultsTotal,
    });
  }

  recordCorrectionActivity(
    workspaceKey: string | undefined,
    correction: string,
    outcome: CorrectionActivityOutcome,
    relatedGoal?: string,
  ): void {
    const workspace = workspaceKey?.trim() || 'default';

    if (outcome.status === 'recorded') {
      this.#appendActivity(workspaceKey, {
        id: this.#createActivityId(),
        kind: 'correction',
        workspace,
        occurredAt: new Date().toISOString(),
        status: 'success',
        correction,
        goal: relatedGoal,
        correctionStatus: outcome.status,
        recordId: outcome.recordId,
      });
      return;
    }

    if (outcome.status === 'no_prior_turn' || outcome.status === 'llm_required') {
      this.#appendActivity(workspaceKey, {
        id: this.#createActivityId(),
        kind: 'error',
        workspace,
        occurredAt: new Date().toISOString(),
        status: 'warning',
        correction,
        goal: relatedGoal,
        correctionStatus: outcome.status,
        errorMessage: outcome.status,
      });
    }
  }

  getActivity(
    workspaceKey: string | undefined,
    options?: { limit?: number; type?: ActivityItemType },
  ): ActivityResponseProduct {
    const key = workspaceKey?.trim() || 'default';
    const events = this.#activityLog.get(key) ?? [];

    return mapActivityEventsToProduct(key, events, options);
  }

  async getOrCreate(workspaceKey: string | undefined): Promise<ChatSessionState> {
    const key = workspaceKey?.trim() || 'default';

    const existing = this.#sessions.get(key);

    if (existing !== undefined) {
      return existing;
    }

    const client =
      key === 'default'
        ? this.#atlasService.createMemoryClient()
        : await this.#buildBrandClient(key);

    const session = createChatSession(client);
    this.#sessions.set(key, session);

    return session;
  }

  async #buildBrandClient(slug: string) {
    const paths = resolveWorkspacePaths(slug);
    const profile = loadOrCreateBrandProfile(paths, slug);
    const feedbackContext = await loadRecentFeedbackContext(paths.memoryFilePath);
    const contextPrompt = combineBrandContextPrompt(
      renderProfileAsContext(profile),
      feedbackContext,
    );

    return this.#atlasService.createBrandClient(paths, contextPrompt);
  }

  get atlasService(): AtlasService {
    return this.#atlasService;
  }

  recordDeterministicExchange(
    workspaceKey: string | undefined,
    userContent: string,
    assistantContent: string,
  ): void {
    const key = workspaceKey?.trim() || 'default';
    const existing = this.#deterministicHistory.get(key) ?? [];

    this.#deterministicHistory.set(key, [
      ...existing,
      { role: 'user', content: userContent.trim() },
      { role: 'assistant', content: assistantContent.trim() },
    ]);
  }

  getConversationHistory(
    session: ChatSessionState,
    workspaceKey: string | undefined,
  ): HistoryResponseProduct {
    const key = workspaceKey?.trim() || 'default';
    const fromSession = session.history.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    if (fromSession.some((message) => message.content.trim().length > 0)) {
      return mapSessionHistoryToProduct(
        key,
        fromSession,
        session.lastTurn !== undefined && session.client.llm.isConfigured(),
      );
    }

    const deterministic = this.#deterministicHistory.get(key) ?? [];

    return mapSessionHistoryToProduct(key, deterministic, false);
  }

  async searchKnowledge(
    workspaceKey: string | undefined,
    query: string,
  ): Promise<KnowledgeSearchResponseProduct> {
    const key = workspaceKey?.trim() || 'default';
    const trimmedQuery = query.trim();

    if (trimmedQuery.length === 0) {
      return mapKnowledgeSearchToProduct(key, {
        query: trimmedQuery,
        total: 0,
        records: Object.freeze([]),
      });
    }

    const session = await this.getOrCreate(workspaceKey);
    const result = await session.client.memory.searchContent({ query: trimmedQuery });

    return mapKnowledgeSearchToProduct(key, result);
  }

  async uploadKnowledgeDocument(
    workspaceKey: string | undefined,
    fileName: string,
    buffer: Buffer,
  ): Promise<KnowledgeUploadResponseProduct> {
    const extension = resolveSupportedExtension(fileName);

    if (extension === undefined) {
      const invalidExtension = fileName.includes('.')
        ? fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()
        : fileName.toLowerCase();

      throw new KnowledgeUploadError(400, formatUnsupportedExtensionMessage(invalidExtension));
    }

    const extracted = assertExtractedText(await extractTextFromBuffer(buffer, extension, fileName));
    const chunks = chunkText(extracted);
    const session = await this.getOrCreate(workspaceKey);
    const recordIds: string[] = [];
    const uploadedAt = new Date().toISOString();

    for (let index = 0; index < chunks.length; index += 1) {
      const chunkTextValue = chunks[index];

      if (chunkTextValue === undefined || chunkTextValue.length === 0) {
        continue;
      }

      const stored = await session.client.memory.storeContent({
        content: chunkTextValue,
        recordType: 'document',
        metadata: Object.freeze({
          source: 'upload',
          fileName,
          fileType: extension,
          chunkIndex: index,
          totalChunks: chunks.length,
          uploadedAt,
        }),
      });

      recordIds.push(stored.recordId);
    }

    if (recordIds.length === 0) {
      throw new KnowledgeUploadError(422, EMPTY_EXTRACTION_MESSAGE);
    }

    this.recordKnowledgeUploadActivity(workspaceKey, fileName, recordIds.length);

    return Object.freeze({
      fileName,
      chunks: recordIds.length,
      recordIds: Object.freeze([...recordIds]),
    });
  }

  recordKnowledgeUploadActivity(
    workspaceKey: string | undefined,
    fileName: string,
    chunks: number,
  ): void {
    const workspace = workspaceKey?.trim() || 'default';

    this.#appendActivity(workspaceKey, {
      id: this.#createActivityId(),
      kind: 'knowledge',
      workspace,
      occurredAt: new Date().toISOString(),
      status: 'success',
      query: `upload:${fileName}`,
      resultsTotal: chunks,
    });
  }

  #normalizeBrandId(workspaceKey: string | undefined): string {
    return workspaceKey?.trim() || 'default';
  }

  #toRawBrandProfile(profile: WorkspaceProfile): RawBrandProfile {
    return {
      name: profile.name,
      purpose: profile.purpose,
      tone: profile.tone,
      processes: profile.processes,
      clients: profile.clients,
      rules: profile.rules,
    };
  }

  #validateBrandName(name: string): string {
    const trimmed = name.trim();

    if (trimmed.length === 0) {
      throw new BrandValidationError('El nombre de la marca es obligatorio.');
    }

    if (trimmed.length > MAX_BRAND_NAME_LENGTH) {
      throw new BrandValidationError('El nombre es demasiado largo.');
    }

    return trimmed;
  }

  async #buildBrandRecord(id: string): Promise<RawBrandRecord> {
    let profile: RawBrandProfile;

    if (id === 'default') {
      profile = {
        name: 'General',
        purpose: '',
        tone: '',
        processes: [],
        clients: [],
        rules: [],
      };
    } else {
      const paths = resolveWorkspacePaths(id);
      profile = this.#toRawBrandProfile(loadOrCreateBrandProfile(paths, id));
    }

    const workspaceKey = id === 'default' ? undefined : id;
    let knowledgeCount: number | undefined;

    try {
      const session = await this.getOrCreate(workspaceKey);
      const result = await session.client.memory.searchContent({ query: '' });
      knowledgeCount = result.total;
    } catch {
      knowledgeCount = undefined;
    }

    const activity = this.getActivity(workspaceKey, { limit: 3 });
    const recentActivity = activity.items.length > 0 ? activity.items : undefined;

    return {
      id,
      profile,
      ...(knowledgeCount !== undefined ? { knowledgeCount } : {}),
      ...(recentActivity !== undefined ? { recentActivity } : {}),
    };
  }

  async listBrands(activeBrandId?: string): Promise<BrandsResponseProduct> {
    const active = this.#normalizeBrandId(activeBrandId);
    const records: RawBrandRecord[] = [await this.#buildBrandRecord('default')];

    for (const slug of listWorkspaces()) {
      records.push(await this.#buildBrandRecord(slug));
    }

    return mapBrandsToProduct(records, active);
  }

  async createBrand(
    name: string,
    purpose?: string,
    activeBrandId?: string,
  ): Promise<CreateBrandResponseProduct> {
    const trimmedName = this.#validateBrandName(name);

    let paths: WorkspacePaths;

    try {
      paths = resolveWorkspacePaths(trimmedName);
    } catch {
      throw new BrandValidationError('Revisa el nombre e inténtalo nuevamente.');
    }

    const slug = paths.slug;

    if (slug === 'default') {
      throw new BrandReservedError();
    }

    if (listWorkspaces().includes(slug)) {
      throw new BrandDuplicateError();
    }

    let profile = loadOrCreateBrandProfile(paths, trimmedName);
    const trimmedPurpose = purpose?.trim() ?? '';

    if (trimmedPurpose.length > 0) {
      profile = {
        ...profile,
        purpose: trimmedPurpose,
      };
      writeFileSync(paths.profilePath, `${JSON.stringify(profile, null, 2)}\n`, 'utf8');
    }

    const record = await this.#buildBrandRecord(slug);
    return mapCreateBrandResponse(record, this.#normalizeBrandId(activeBrandId));
  }
}
