import type { Command } from 'commander';

import { runChatRepl } from '../chat/chat-repl.js';
import type { Container } from '../application/container.js';
import type { CliCommand } from '../registry/command-registry.js';

export class ChatCommand implements CliCommand {
  readonly name = 'chat';

  register(program: Command, container: Container): void {
    program
      .command('chat')
      .description('Interactive multi-turn chat — plan goals with shared memory and retrieval')
      .option('--json', 'output structured JSON per turn')
      .action(async (options: { json?: boolean }) => {
        await runChatRepl(container, { json: options.json });
      });
  }
}
