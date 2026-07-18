#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGES=(
  # Phase 2 Kernel order
  core
  compiler
  events
  runtime
  knowledge
  context
  memory
  retrieval
  prompt
  workflow
  agent
  plugin
  publisher
  # Domain / Architecture / Engine / SDK
  ontology
  graph
  search
  validation
  context-planner
  cli
  sdk
)

for pkg in "${PACKAGES[@]}"; do
  PKG_DIR="$ROOT/packages/$pkg"
  mkdir -p "$PKG_DIR/src/internal" "$PKG_DIR/src/contracts" "$PKG_DIR/tests" "$PKG_DIR/docs"

  cat > "$PKG_DIR/src/index.ts" <<EOF
/**
 * @atlas/${pkg} — bootstrap stub
 * Implementation pending authorization.
 */
export {};
EOF

  cat > "$PKG_DIR/tests/smoke.test.ts" <<EOF
import { describe, expect, it } from 'vitest';

describe('@atlas/${pkg}', () => {
  it('bootstrap stub is loadable', () => {
    expect(true).toBe(true);
  });
});
EOF

  cat > "$PKG_DIR/vitest.config.ts" <<'EOF'
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    passWithNoTests: false,
  },
});
EOF

  cat > "$PKG_DIR/package.json" <<EOF
{
  "name": "@atlas/${pkg}",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "description": "Atlas ${pkg} package — bootstrap stub",
  "license": "UNLICENSED",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm --dts --clean --sourcemap",
    "test": "vitest run",
    "lint": "eslint src tests",
    "typecheck": "tsc --noEmit"
  }
}
EOF

  cat > "$PKG_DIR/tsconfig.json" <<EOF
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "rootDir": ".",
    "outDir": "dist"
  },
  "include": ["src/**/*", "tests/**/*"]
}
EOF

  cat > "$PKG_DIR/README.md" <<EOF
# @atlas/${pkg}

Bootstrap stub for the Atlas \`${pkg}\` package.

This package contains no business logic. Implementation will begin after Phase 0 review and explicit authorization.

See \`Architecture/ATLAS-ARCH-002 — PACKAGE_ARCHITECTURE.md\`.
EOF

  cat > "$PKG_DIR/CHANGELOG.md" <<EOF
# @atlas/${pkg}

## 0.0.0

- Bootstrap stub created during Phase 0 monorepo setup.
EOF

  cat > "$PKG_DIR/docs/.gitkeep" <<EOF
EOF

  cat > "$PKG_DIR/src/internal/.gitkeep" <<EOF
EOF

  cat > "$PKG_DIR/src/contracts/.gitkeep" <<EOF
EOF

  echo "Created packages/${pkg}"
done

echo "Done. Created ${#PACKAGES[@]} packages."
