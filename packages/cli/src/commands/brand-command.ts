import type { Command } from 'commander';

import type { Container } from '../application/container.js';
import { runChatRepl } from '../chat/chat-repl.js';
import type { CliCommand } from '../registry/command-registry.js';
import { CliExitError, EXIT_INVALID_ARGUMENTS } from '../output/exit-codes.js';
import {
  loadOrCreateBrandProfile,
  renderProfileAsContext,
  resolveWorkspacePaths,
} from '../workspace/brand-profile.js';
import {
  combineBrandContextPrompt,
  loadRecentFeedbackContext,
} from '../workspace/feedback-context.js';

export class BrandCommand implements CliCommand {
  readonly name = 'brand';

  register(program: Command, container: Container): void {
    program
      .command('brand <name>')
      .description('Open a brand-scoped conversation with isolated memory and context')
      .option('--json', 'output structured JSON')
      .action(async (name: string, options: { json?: boolean }) => {
        if (name.trim().length === 0) {
          throw new CliExitError(EXIT_INVALID_ARGUMENTS, 'Brand name must not be empty');
        }

        try {
          const paths = resolveWorkspacePaths(name);
          const profile = loadOrCreateBrandProfile(paths, name.trim());
          const profileContext = renderProfileAsContext(profile);
          const feedbackContext = await loadRecentFeedbackContext(paths.memoryFilePath);
          const contextPrompt = combineBrandContextPrompt(profileContext, feedbackContext);
          const client = container.atlasService.createBrandClient(paths, contextPrompt);

          if (!options.json) {
            container.renderer.info(`Atlas Brand — ${profile.name} (${paths.slug})`);
            container.renderer.info(`Memory: ${paths.memoryFilePath}`);
          }

          await runChatRepl(container, {
            client,
            ...(options.json ? { json: true } : {}),
          });
        } catch (error) {
          if (error instanceof CliExitError) {
            throw error;
          }

          const message = error instanceof Error ? error.message : String(error);

          if (message.includes('Brand name') || message.includes('Invalid brand name')) {
            throw new CliExitError(EXIT_INVALID_ARGUMENTS, message);
          }

          throw error;
        }
      });
  }
}
