import type { Command } from 'commander';

import type { Container } from '../application/container.js';
import type { CliCommand } from '../registry/command-registry.js';
import {
  CliExitError,
  EXIT_CONFIGURATION_ERROR,
  EXIT_INVALID_ARGUMENTS,
} from '../output/exit-codes.js';

export class AskCommand implements CliCommand {
  readonly name = 'ask';

  register(program: Command, container: Container): void {
    program
      .command('ask')
      .description('Ask Atlas using the configured LLM with certified tool-calling capabilities')
      .requiredOption('--goal <text>', 'goal or question for the LLM')
      .option('--json', 'output structured JSON')
      .action(async (options: { goal: string; json?: boolean }) => {
        if (options.goal.trim().length === 0) {
          throw new CliExitError(EXIT_INVALID_ARGUMENTS, 'Goal must not be empty');
        }

        try {
          const client = container.atlasService.createMemoryClient();
          const result = await client.llm.ask(options.goal);

          if (options.json) {
            container.renderer.json({
              command: 'ask',
              success: result.success,
              goal: options.goal,
              final_message: result.finalMessage,
              turns: result.turns,
              usage: result.usage,
              budget_exceeded: result.budgetExceeded,
            });
          } else {
            container.renderer.info(`Goal:    ${options.goal}`);
            container.renderer.info(`Turns:   ${result.turns}`);
            container.renderer.info(`Budget:  ${result.budgetExceeded ? 'EXCEEDED' : 'OK'}`);
            container.renderer.info('');
            container.renderer.info(result.finalMessage);
          }
        } catch (error) {
          if (error instanceof Error) {
            if (
              error.message.includes('ATLAS_LLM_API_KEY') ||
              error.message.includes('ATLAS_LLM_MODEL')
            ) {
              throw new CliExitError(EXIT_CONFIGURATION_ERROR, error.message);
            }
          }

          throw error;
        }
      });
  }
}
