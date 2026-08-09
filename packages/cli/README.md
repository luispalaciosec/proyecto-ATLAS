# @atlas/cli

Official command-line interface for Atlas — SDK-201.

Consumes the Kernel **exclusively** through `@atlas/sdk`. Contains no business logic.

## Specifications

- `../../spec/sdk/ATLAS-201-SDK_CLI.md`
- `../../spec/sdk/ATLAS-202-SDK_TYPESCRIPT.md` (SDK as Kernel facade)

## Architecture

```text
Developer → CLI (Commander) → Command Registry → AtlasService → @atlas/sdk → Kernel
```

| Layer | Responsibility |
|-------|----------------|
| `CliApp` | Commander program + exit handling |
| `CommandRegistry` | Registers compile/run/doctor/version |
| `Container` | Dependency injection wiring |
| `AtlasService` | Thin SDK adapter (no domain logic) |
| `WorkspaceLoader` | Loads `atlas.workspace.json` |

## Commands (Sprint 6)

| Command | Description |
|---------|-------------|
| `atlas compile` | Compile workspace units |
| `atlas run` | Compile and execute artifacts |
| `atlas doctor` | Validate CLI wiring and workspace |
| `atlas version` | Show CLI version |
| `atlas help` | Show help (Commander) |

## Workspace format

`atlas.workspace.json`:

```json
{
  "name": "my-workspace",
  "environment": "memory",
  "units": [
    {
      "id": "doc.example",
      "origin": "memory://doc.example",
      "checksum": "sha256:example",
      "version": "1.0.0",
      "source": { "body": "example" }
    }
  ]
}
```

## Usage

From the ATLAS repository root (after `pnpm install` and `pnpm build`):

```bash
pnpm atlas doctor --workspace .
pnpm atlas compile --workspace .
pnpm atlas run --workspace .
pnpm atlas version
pnpm atlas --help
```

Equivalent direct invocation:

```bash
node packages/cli/dist/atlas.js doctor
```

Optional global install (not required for development):

```bash
pnpm setup
pnpm link --global ./packages/cli
atlas doctor
```

## Dependencies

| Package | Relationship |
|---------|--------------|
| `@atlas/sdk` | **Only** Kernel entry point |
| `commander` | CLI parser |

The CLI MUST NOT depend directly on `@atlas/core`, `@atlas/compiler`, `@atlas/events`, or `@atlas/runtime`.

## Exit codes

Official codes from SDK-201 §10: `0` success, `2` invalid arguments, `4` configuration, `5` compilation, `6` runtime.
