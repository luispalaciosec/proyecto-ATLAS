import {
  AtlasService,
  combineBrandContextPrompt,
  createChatSession,
  loadOrCreateBrandProfile,
  loadRecentFeedbackContext,
  renderProfileAsContext,
  resolveWorkspacePaths,
  type ChatSessionState,
} from '@atlas/cli';

export class SessionStore {
  readonly #atlasService = new AtlasService();
  readonly #sessions = new Map<string, ChatSessionState>();

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
}
