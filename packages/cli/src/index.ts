export { CliApp, runCli } from './application/cli-app.js';
export { createContainer, type Container } from './application/container.js';
export { CommandRegistry, type CliCommand } from './registry/command-registry.js';
export { WorkspaceLoader, WORKSPACE_FILE_NAME } from './configuration/workspace-loader.js';
export { parseWorkspaceConfig, type WorkspaceConfig } from './configuration/workspace-config.js';
export { AtlasService } from './services/atlas-service.js';
export {
  CliExitError,
  EXIT_COMPILATION_ERROR,
  EXIT_CONFIGURATION_ERROR,
  EXIT_GENERAL_ERROR,
  EXIT_INVALID_ARGUMENTS,
  EXIT_RUNTIME_ERROR,
  EXIT_SUCCESS,
  EXIT_VALIDATION_ERROR,
} from './output/exit-codes.js';
export {
  createChatSession,
  createChatSessionId,
  type ChatSessionState,
} from './chat/chat-session.js';
export {
  executeChatTurn,
  applyCorrection,
  type CorrectionOutcome,
  type ChatTurnPayload,
} from './chat/chat-turn.js';
export type { ChatLineReader, RunChatReplOptions } from './chat/chat-repl.js';
export { runChatRepl } from './chat/chat-repl.js';
export {
  resolveWorkspacePaths,
  loadOrCreateBrandProfile,
  renderProfileAsContext,
  listWorkspaces,
  type WorkspaceProfile,
  type WorkspacePaths,
} from './workspace/brand-profile.js';
export {
  loadRecentFeedbackContext,
  combineBrandContextPrompt,
} from './workspace/feedback-context.js';
