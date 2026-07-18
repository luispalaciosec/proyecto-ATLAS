import { Command } from 'commander';

import { createContainer, type Container } from './container.js';
import {
  CliExitError,
  EXIT_GENERAL_ERROR,
  EXIT_INVALID_ARGUMENTS,
  EXIT_SUCCESS,
} from '../output/exit-codes.js';
import { readPackageVersion } from '../commands/version-command.js';

export class CliApp {
  readonly container: Container;
  readonly program: Command;

  constructor(container: Container = createContainer()) {
    this.container = container;
    this.program = new Command();

    this.program
      .name('atlas')
      .description('Atlas CLI — primary human interface to the Kernel')
      .version(readPackageVersion(), '-v, --version', 'display CLI version')
      .showHelpAfterError('(use "atlas help" or "atlas <command> --help" for usage)');

    this.program.addHelpCommand('help [command]', 'display help for command');

    this.container.commandRegistry.attachAll(this.program, this.container);
  }

  async run(argv: string[] = process.argv): Promise<number> {
    this.program.exitOverride();

    try {
      await this.program.parseAsync(argv);
      return EXIT_SUCCESS;
    } catch (error) {
      if (error instanceof CliExitError) {
        this.container.renderer.error(error.message);
        return error.code;
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const commanderError = error as { code?: string; message?: string };

        if (
          commanderError.code === 'commander.help' ||
          commanderError.code === 'commander.helpDisplayed'
        ) {
          return EXIT_SUCCESS;
        }

        if (commanderError.code === 'commander.version') {
          return EXIT_SUCCESS;
        }

        if (commanderError.code === 'commander.unknownCommand') {
          this.container.renderer.error(commanderError.message ?? 'Unknown command');
          return EXIT_INVALID_ARGUMENTS;
        }

        if (commanderError.code === 'commander.missingArgument') {
          this.container.renderer.error(commanderError.message ?? 'Missing argument');
          return EXIT_INVALID_ARGUMENTS;
        }
      }

      const message = error instanceof Error ? error.message : 'Unexpected CLI error';
      this.container.renderer.error(message);
      return EXIT_GENERAL_ERROR;
    }
  }
}

export async function runCli(argv: string[] = process.argv): Promise<number> {
  const app = new CliApp();
  return app.run(argv);
}
