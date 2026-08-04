import { WorkspaceLoader } from '../configuration/workspace-loader.js';
import { CompileCommand } from '../commands/compile-command.js';
import { DoctorCommand } from '../commands/doctor-command.js';
import { MemoryCommand } from '../commands/memory-command.js';
import { RunCommand } from '../commands/run-command.js';
import { VersionCommand } from '../commands/version-command.js';
import { OutputRenderer } from '../output/renderer.js';
import { CommandRegistry } from '../registry/command-registry.js';
import { AtlasService } from '../services/atlas-service.js';

export interface Container {
  readonly atlasService: AtlasService;
  readonly workspaceLoader: WorkspaceLoader;
  readonly renderer: OutputRenderer;
  readonly commandRegistry: CommandRegistry;
}

export function createContainer(): Container {
  const commandRegistry = new CommandRegistry();

  commandRegistry.register(new CompileCommand());
  commandRegistry.register(new RunCommand());
  commandRegistry.register(new MemoryCommand());
  commandRegistry.register(new DoctorCommand());
  commandRegistry.register(new VersionCommand());

  return Object.freeze({
    atlasService: new AtlasService(),
    workspaceLoader: new WorkspaceLoader(),
    renderer: new OutputRenderer(),
    commandRegistry,
  });
}
