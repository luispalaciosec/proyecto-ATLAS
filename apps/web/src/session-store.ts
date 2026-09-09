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
import {
  mapKnowledgeDocumentsToProduct,
  type KnowledgeDocumentsResponseProduct,
} from './presentation/map-knowledge-documents.js';
import {
  mapKnowledgeFoldersToProduct,
  type KnowledgeFoldersResponseProduct,
} from './presentation/map-knowledge-folders.js';
import { resolveKnowledgeFolder } from './lib/knowledge-upload/folder.js';
import {
  createStoredKnowledgeFolder,
  listStoredKnowledgeFolders,
  mergeKnowledgeFolderLists,
  registerKnowledgeFolderIfMissing,
} from './lib/knowledge-upload/knowledge-folders-store.js';
import { chunkText } from './lib/knowledge-upload/chunk-text.js';
import { chunkExcelWorkbook } from './lib/knowledge-upload/chunk-excel.js';
import {
  EMPTY_EXTRACTION_MESSAGE,
  formatUnsupportedExtensionMessage,
  resolveSupportedExtension,
} from './lib/knowledge-upload/constants.js';
import { extractExcelWorkbook, isExcelExtension } from './lib/knowledge-upload/extract-excel.js';
import { assertExtractedText, extractTextFromBuffer } from './lib/knowledge-upload/extract-text.js';
import { KnowledgeUploadError } from './lib/knowledge-upload/upload-errors.js';
import {
  prepareIngestedDocumentKnowledge,
  storeIngestedDocumentChunk,
  storeIngestedDocumentKnowledgeObject,
} from '@atlas/sdk';
import {
  mapActivityEventsToProduct,
  type ActivityItemType,
  type ActivityResponseProduct,
  type RawActivityEvent,
} from './presentation/map-activity.js';
import {
  createInitialConversationMetadata,
  readPersistedConversation,
  writePersistedConversation,
} from './lib/web-persistence/conversation-store.js';
import {
  readPersistedActivity,
  writePersistedActivity,
} from './lib/web-persistence/activity-store.js';
import { deriveGovernanceActivityEvents } from './lib/web-persistence/governance-activity.js';
import type { UiHistoryMessage } from './lib/web-persistence/types.js';
import { resolveWebWorkspacesRoot } from './lib/web-persistence/workspace-storage-paths.js';
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

export type { UiHistoryMessage };

const MAX_BRAND_NAME_LENGTH = 120;

function createChatSessionId(): string {
  return `chat.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
}

export class SessionStore {
  readonly #atlasService = new AtlasService();
  readonly #sessions = new Map<string, ChatSessionState>();
  readonly #deterministicHistory = new Map<string, UiHistoryMessage[]>();
  readonly #activityLog = new Map<string, RawActivityEvent[]>();
  readonly #historyTimestamps = new Map<string, Map<number, string>>();
  readonly #conversationMeta = new Map<
    string,
    { readonly conversationId: string; readonly createdAt: string }
  >();
  readonly #bootstrappedWorkspaces = new Set<string>();

  #createActivityId(): string {
    return `activity.${Date.now()}.${Math.random().toString(36).slice(2, 8)}`;
  }

  #appendActivity(workspaceKey: string | undefined, event: RawActivityEvent): void {
    const key = workspaceKey?.trim() || 'default';
    const existing = this.#activityLog.get(key) ?? [];
    const merged = [event, ...existing.filter((entry) => entry.id !== event.id)].slice(0, 200);
    this.#activityLog.set(key, merged);
    writePersistedActivity(key, merged);
  }

  #bootstrapWorkspace(workspaceKey: string | undefined): void {
    const key = workspaceKey?.trim() || 'default';

    if (this.#bootstrappedWorkspaces.has(key)) {
      return;
    }

    const persistedConversation = readPersistedConversation(key);

    if (persistedConversation !== undefined) {
      this.#conversationMeta.set(key, {
        conversationId: persistedConversation.conversationId,
        createdAt: persistedConversation.createdAt,
      });

      if (persistedConversation.deterministicHistory.length > 0) {
        this.#deterministicHistory.set(
          key,
          persistedConversation.deterministicHistory.map((message) =>
            Object.freeze({
              role: message.role,
              content: message.content,
            }),
          ),
        );
      }
    } else {
      this.#conversationMeta.set(key, createInitialConversationMetadata(key));
    }

    const persistedActivity = readPersistedActivity(key);
    this.#activityLog.set(key, [...persistedActivity]);

    this.#bootstrappedWorkspaces.add(key);
  }

  #applyPersistedConversation(
    session: ChatSessionState,
    persisted: NonNullable<ReturnType<typeof readPersistedConversation>>,
  ): void {
    session.turnCount = persisted.turnCount;
    session.history.splice(0, session.history.length, ...persisted.history);
    session.turnBoundaries.splice(0, session.turnBoundaries.length, ...persisted.turnBoundaries);
    session.lastTurn = persisted.lastTurn;
    session.lastMemorySessionId = persisted.lastMemorySessionId;

    const stamps = new Map<number, string>();

    for (const [index, message] of persisted.deterministicHistory.entries()) {
      stamps.set(index, message.createdAt);
    }

    for (let index = 0; index < persisted.history.length; index += 1) {
      const message = persisted.history[index];

      if (message === undefined || (message.role !== 'user' && message.role !== 'assistant')) {
        continue;
      }

      const persistedMessage = persisted.deterministicHistory.find(
        (entry) => entry.role === message.role && entry.content.trim() === message.content.trim(),
      );

      if (persistedMessage !== undefined) {
        stamps.set(index, persistedMessage.createdAt);
      }
    }

    this.#historyTimestamps.set(persisted.workspace, stamps);
  }

  persistSession(workspaceKey: string | undefined, session: ChatSessionState): void {
    const key = workspaceKey?.trim() || 'default';
    this.#bootstrapWorkspace(key);

    const meta = this.#conversationMeta.get(key) ?? createInitialConversationMetadata(key);
    this.#conversationMeta.set(key, meta);

    const stamps = this.#historyTimestamps.get(key) ?? new Map<number, string>();
    const now = new Date().toISOString();

    for (let index = 0; index < session.history.length; index += 1) {
      if (!stamps.has(index)) {
        stamps.set(index, now);
      }
    }

    this.#historyTimestamps.set(key, stamps);

    writePersistedConversation({
      workspaceKey: key,
      brand: key === 'default' ? undefined : key,
      conversationId: meta.conversationId,
      createdAt: meta.createdAt,
      sessionId: session.sessionId,
      turnCount: session.turnCount,
      ...(session.lastMemorySessionId !== undefined
        ? { lastMemorySessionId: session.lastMemorySessionId }
        : {}),
      history: session.history,
      turnBoundaries: session.turnBoundaries,
      ...(session.lastTurn !== undefined ? { lastTurn: session.lastTurn } : {}),
      deterministicHistory: this.#deterministicHistory.get(key) ?? [],
      historyTimestamps: stamps,
    });
  }

  #persistDeterministicConversation(workspaceKey: string | undefined): void {
    const key = workspaceKey?.trim() || 'default';
    const session = this.#sessions.get(key);

    if (session === undefined) {
      const meta = this.#conversationMeta.get(key) ?? createInitialConversationMetadata(key);
      writePersistedConversation({
        workspaceKey: key,
        brand: key === 'default' ? undefined : key,
        conversationId: meta.conversationId,
        createdAt: meta.createdAt,
        sessionId: createChatSessionId(),
        turnCount: 0,
        history: Object.freeze([]),
        turnBoundaries: Object.freeze([]),
        deterministicHistory: this.#deterministicHistory.get(key) ?? [],
        historyTimestamps: new Map<number, string>(),
      });
      return;
    }

    this.persistSession(workspaceKey, session);
  }

  async #mergeGovernanceActivity(workspaceKey: string | undefined): Promise<void> {
    const key = workspaceKey?.trim() || 'default';
    const session = await this.getOrCreate(workspaceKey);
    const derived = await deriveGovernanceActivityEvents(session.client, key);
    const existing = this.#activityLog.get(key) ?? [];
    const merged = [...derived, ...existing];
    const byId = new Map<string, RawActivityEvent>();

    for (const event of merged) {
      byId.set(event.id, event);
    }

    this.#activityLog.set(
      key,
      [...byId.values()].sort(
        (left, right) => Date.parse(right.occurredAt) - Date.parse(left.occurredAt),
      ),
    );
  }

  recordConversationActivity(workspaceKey: string | undefined, payload: ChatActivityPayload): void {
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
    this.#bootstrapWorkspace(key);

    const events = this.#activityLog.get(key) ?? [];

    return mapActivityEventsToProduct(key, events, options);
  }

  async getActivityWithGovernance(
    workspaceKey: string | undefined,
    options?: { limit?: number; type?: ActivityItemType },
  ): Promise<ActivityResponseProduct> {
    this.#bootstrapWorkspace(workspaceKey);
    await this.#mergeGovernanceActivity(workspaceKey);

    return this.getActivity(workspaceKey, options);
  }

  async getOrCreate(workspaceKey: string | undefined): Promise<ChatSessionState> {
    const key = workspaceKey?.trim() || 'default';
    this.#bootstrapWorkspace(key);

    const existing = this.#sessions.get(key);

    if (existing !== undefined) {
      return existing;
    }

    const client =
      key === 'default'
        ? this.#atlasService.createMemoryClient()
        : await this.#buildBrandClient(key);

    const persisted = readPersistedConversation(key);
    const session = createChatSession(client, persisted?.sessionId ?? createChatSessionId());

    if (persisted !== undefined) {
      this.#applyPersistedConversation(session, persisted);
    }

    this.#sessions.set(key, session);

    return session;
  }

  async #buildBrandClient(slug: string) {
    const paths = resolveWorkspacePaths(slug, resolveWebWorkspacesRoot());
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

    this.#persistDeterministicConversation(workspaceKey);
  }

  getConversationHistory(
    session: ChatSessionState,
    workspaceKey: string | undefined,
  ): HistoryResponseProduct {
    const key = workspaceKey?.trim() || 'default';
    this.#bootstrapWorkspace(key);
    const stamps = this.#historyTimestamps.get(key) ?? new Map<number, string>();

    const fromSession = session.history
      .map((message, index) =>
        Object.freeze({
          role: message.role,
          content: message.content,
          ...(stamps.has(index) ? { createdAt: stamps.get(index) } : {}),
        }),
      )
      .filter(
        (message) =>
          (message.role === 'user' || message.role === 'assistant') &&
          message.content.trim().length > 0,
      );

    if (fromSession.length > 0) {
      return mapSessionHistoryToProduct(
        key,
        fromSession,
        session.lastTurn !== undefined && session.client.llm.isConfigured(),
      );
    }

    const persisted = readPersistedConversation(key);
    const deterministic =
      persisted?.deterministicHistory ??
      (this.#deterministicHistory.get(key) ?? []).map((message, index) =>
        Object.freeze({
          role: message.role,
          content: message.content,
          createdAt: new Date(Date.parse('2026-01-01T00:00:00.000Z') + index * 1000).toISOString(),
        }),
      );

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
    const result = await session.client.retrieval.searchContent({ query: trimmedQuery });

    return mapKnowledgeSearchToProduct(key, result);
  }

  async listKnowledgeDocuments(
    workspaceKey: string | undefined,
    folderFilter?: string,
  ): Promise<KnowledgeDocumentsResponseProduct> {
    const key = workspaceKey?.trim() || 'default';
    const session = await this.getOrCreate(workspaceKey);
    const result = await session.client.memory.listRecords({ recordType: 'document' });
    const mapped = mapKnowledgeDocumentsToProduct(key, result.records, folderFilter);
    const folders = mergeKnowledgeFolderLists(
      listStoredKnowledgeFolders(workspaceKey),
      mapped.folders,
    );

    return Object.freeze({
      ...mapped,
      folders,
    });
  }

  listKnowledgeFolders(workspaceKey: string | undefined): KnowledgeFoldersResponseProduct {
    const key = workspaceKey?.trim() || 'default';
    const stored = listStoredKnowledgeFolders(workspaceKey);

    return mapKnowledgeFoldersToProduct(key, stored);
  }

  createKnowledgeFolder(
    workspaceKey: string | undefined,
    folderInput: string,
  ): KnowledgeFoldersResponseProduct {
    const key = workspaceKey?.trim() || 'default';
    const folders = createStoredKnowledgeFolder(workspaceKey, folderInput);

    return mapKnowledgeFoldersToProduct(key, folders);
  }

  #createKnowledgeDocumentId(): string {
    return `doc.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;
  }

  async uploadKnowledgeDocument(
    workspaceKey: string | undefined,
    fileName: string,
    buffer: Buffer,
    folderInput?: string,
  ): Promise<KnowledgeUploadResponseProduct> {
    const extension = resolveSupportedExtension(fileName);

    if (extension === undefined) {
      const invalidExtension = fileName.includes('.')
        ? fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase()
        : fileName.toLowerCase();

      throw new KnowledgeUploadError(400, formatUnsupportedExtensionMessage(invalidExtension));
    }

    const session = await this.getOrCreate(workspaceKey);
    const recordIds: string[] = [];
    const uploadedAt = new Date().toISOString();
    const folder = resolveKnowledgeFolder(folderInput);
    const documentId = this.#createKnowledgeDocumentId();
    registerKnowledgeFolderIfMissing(workspaceKey, folder);
    const workspace = workspaceKey?.trim() || 'default';
    const ingest = prepareIngestedDocumentKnowledge({
      documentId,
      fileName,
      fileType: extension,
      folder,
      workspace,
      uploadedAt,
    });

    await storeIngestedDocumentKnowledgeObject(session.client.memory, ingest);

    if (isExcelExtension(extension)) {
      const workbook = extractExcelWorkbook(buffer, fileName);
      const excelChunks = chunkExcelWorkbook(workbook);

      if (excelChunks.length === 0) {
        throw new KnowledgeUploadError(422, EMPTY_EXTRACTION_MESSAGE);
      }

      for (let index = 0; index < excelChunks.length; index += 1) {
        const excelChunk = excelChunks[index];

        if (excelChunk === undefined || excelChunk.content.length === 0) {
          continue;
        }

        const stored = await storeIngestedDocumentChunk(session.client.memory, {
          ingest,
          content: excelChunk.content,
          chunk: {
            chunkIndex: index,
            totalChunks: excelChunks.length,
            sheetName: excelChunk.sheetName,
            sheetIndex: excelChunk.sheetIndex,
            totalSheets: excelChunk.totalSheets,
            rowStart: excelChunk.rowStart,
            rowEnd: excelChunk.rowEnd,
          },
        });

        recordIds.push(stored.recordId);
      }

      if (recordIds.length === 0) {
        throw new KnowledgeUploadError(422, EMPTY_EXTRACTION_MESSAGE);
      }

      this.recordKnowledgeUploadActivity(workspaceKey, fileName, recordIds.length);

      return Object.freeze({
        documentId,
        fileName,
        folder,
        chunks: recordIds.length,
        sheetCount: workbook.sheets.length,
        recordIds: Object.freeze([...recordIds]),
      });
    }

    const extracted = assertExtractedText(await extractTextFromBuffer(buffer, extension, fileName));
    const chunks = chunkText(extracted);

    for (let index = 0; index < chunks.length; index += 1) {
      const chunkTextValue = chunks[index];

      if (chunkTextValue === undefined || chunkTextValue.length === 0) {
        continue;
      }

      const stored = await storeIngestedDocumentChunk(session.client.memory, {
        ingest,
        content: chunkTextValue,
        chunk: {
          chunkIndex: index,
          totalChunks: chunks.length,
        },
      });

      recordIds.push(stored.recordId);
    }

    if (recordIds.length === 0) {
      throw new KnowledgeUploadError(422, EMPTY_EXTRACTION_MESSAGE);
    }

    this.recordKnowledgeUploadActivity(workspaceKey, fileName, recordIds.length);

    return Object.freeze({
      documentId,
      fileName,
      folder,
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
      const paths = resolveWorkspacePaths(id, resolveWebWorkspacesRoot());
      profile = this.#toRawBrandProfile(loadOrCreateBrandProfile(paths, id));
    }

    const workspaceKey = id === 'default' ? undefined : id;
    let knowledgeCount: number | undefined;

    try {
      const session = await this.getOrCreate(workspaceKey);
      const result = await session.client.memory.listRecords();
      knowledgeCount = result.records.filter((record) => record.type !== 'KnowledgeObject').length;
    } catch {
      knowledgeCount = undefined;
    }

    const activity = await this.getActivityWithGovernance(workspaceKey, { limit: 3 });
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

    for (const slug of listWorkspaces(resolveWebWorkspacesRoot())) {
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
      paths = resolveWorkspacePaths(trimmedName, resolveWebWorkspacesRoot());
    } catch {
      throw new BrandValidationError('Revisa el nombre e inténtalo nuevamente.');
    }

    const slug = paths.slug;
    const workspacesRoot = resolveWebWorkspacesRoot();

    if (slug === 'default') {
      throw new BrandReservedError();
    }

    if (listWorkspaces(workspacesRoot).includes(slug)) {
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
