import type { Command } from 'commander';

import type { Container } from '../application/container.js';
import type { CliCommand } from '../registry/command-registry.js';
import { CliExitError, EXIT_INVALID_ARGUMENTS } from '../output/exit-codes.js';

export class MemoryCommand implements CliCommand {
  readonly name = 'memory';

  register(program: Command, container: Container): void {
    const memory = program.command('memory').description('Store and search memory through Atlas');

    memory
      .command('store')
      .description('Store content in Atlas memory')
      .requiredOption('--content <text>', 'content to remember')
      .option('--json', 'output structured JSON')
      .action(async (options: { content: string; json?: boolean }) => {
        if (options.content.trim().length === 0) {
          throw new CliExitError(EXIT_INVALID_ARGUMENTS, 'Content must not be empty');
        }

        const client = container.atlasService.createMemoryClient();
        const result = await client.memory.storeContent({ content: options.content });

        if (options.json) {
          container.renderer.json({
            command: 'memory store',
            record_id: result.recordId,
            record: result.record,
          });
        } else {
          container.renderer.info(`Stored record: ${result.recordId}`);
        }
      });

    memory
      .command('search')
      .description('Search Atlas memory by content')
      .requiredOption('--query <text>', 'search query')
      .option('--json', 'output structured JSON')
      .action(async (options: { query: string; json?: boolean }) => {
        if (options.query.trim().length === 0) {
          throw new CliExitError(EXIT_INVALID_ARGUMENTS, 'Query must not be empty');
        }

        const client = container.atlasService.createMemoryClient();
        const result = await client.memory.searchContent({ query: options.query });

        if (options.json) {
          container.renderer.json({
            command: 'memory search',
            query: result.query,
            total: result.total,
            records: result.records,
          });
        } else {
          container.renderer.info(`Matches: ${result.total}`);
          for (const record of result.records) {
            container.renderer.info(`- ${record.id}`);
          }
        }
      });
  }
}
