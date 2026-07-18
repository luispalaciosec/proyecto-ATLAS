#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "Atlas Milestone 1 — First Workspace Demo"
echo "======================================="
echo ""
echo "Workspace: $(pwd)"
echo ""

echo "→ atlas doctor"
pnpm exec atlas doctor --workspace .
echo ""

echo "→ atlas compile"
pnpm exec atlas compile --workspace .
echo ""

echo "→ atlas run"
pnpm exec atlas run --workspace .
echo ""

echo "======================================="
echo "Demo completada."
