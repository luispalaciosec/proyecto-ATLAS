# @atlas/cli

## 0.1.0

Sprint 6 — Kernel-connected CLI via `@atlas/sdk`.

### Added

- Commander-based `CliApp` with DI container and command registry
- `atlas compile`, `atlas run`, `atlas doctor`, `atlas version`, `atlas help`
- `AtlasService` SDK adapter (no business logic)
- `WorkspaceLoader` for `atlas.workspace.json`
- Official exit codes (SDK-201 §10)
- Unit tests with coverage thresholds
- Example: `examples/cli-workspace-demo`

### Notes

- Kernel access exclusively through `@atlas/sdk`
- No direct dependency on core, compiler, events, or runtime packages

## 0.0.0

- Bootstrap stub created during Phase 0 monorepo setup.
