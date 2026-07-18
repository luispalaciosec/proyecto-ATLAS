import type { Command } from 'commander';

import type { Container } from '../application/container.js';

export interface CliCommand {
  readonly name: string;
  register(program: Command, container: Container): void;
}

export class CommandRegistry {
  readonly #commands: CliCommand[] = [];

  register(command: CliCommand): void {
    this.#commands.push(command);
  }

  attachAll(program: Command, container: Container): void {
    for (const command of this.#commands) {
      command.register(program, container);
    }
  }

  list(): readonly CliCommand[] {
    return Object.freeze([...this.#commands]);
  }
}
