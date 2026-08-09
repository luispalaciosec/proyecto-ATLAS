# @atlas/llm

LLM adapter for ATLAS Phase 2 — provider abstraction, tool-calling loop, and conversation history support.

## Architecture boundary

```
ATLAS (SDK LlmModule / CLI)
  → LlmProvider.complete()
    → Provider implementation (@atlas/llm)
      → External LLM API (fetch)
```

Concrete vendors (Anthropic, Qwen, etc.) stay inside provider implementations. Core, Runtime, Memory, Retrieval, and Planning never depend on a specific LLM vendor.

## LlmProvider contract

Defined in `src/provider.ts`:

- `LlmMessage` roles: `system`, `user`, `assistant`, `tool`
- `LlmToolDefinition`, `LlmToolCall`
- `LlmCompletionRequest` / `LlmCompletionResult`
- `LlmStopReason`: `end_turn`, `tool_use`, `max_tokens`

Providers implement a single method: `complete(request)`.

## Providers

| Factory | `id` | Transport |
|---------|------|-----------|
| `createAnthropicProvider` | `anthropic` | Anthropic Messages API |
| `createOpenAICompatibleProvider` | `openai-compatible` | OpenAI Chat Completions API |
| `createFakeLlmProvider` | `fake` | Tests only |

### OpenAI-compatible

For APIs that follow OpenAI Chat Completions semantics (tools, tool_calls, tool role messages).

**First validated target:** Qwen Cloud compatible mode.

**Default base URL (when `baseUrl` omitted):**

```text
https://dashscope.aliyuncs.com/compatible-mode/v1
```

**Endpoint constructed:** `{normalizedBaseUrl}/chat/completions`

**Auth:** `Authorization: Bearer {apiKey}`

Supports: system/user/assistant/tool messages, tool definitions, tool calls, multi-turn tool calling, stop reasons, usage mapping. Uses native `fetch` — no vendor SDK.

## Tool-calling loop

`runToolLoop()` in `src/tool-loop.ts` drives multi-turn tool execution against any `LlmProvider`. Budget guardrails via `createBudgetTracker()`.

## Environment variables (via CLI / SDK)

| Variable | Required | Default |
|----------|----------|---------|
| `ATLAS_LLM_PROVIDER` | No | `anthropic` |
| `ATLAS_LLM_API_KEY` | Yes (for `atlas ask`) | — |
| `ATLAS_LLM_MODEL` | Yes (for `atlas ask`) | — |
| `ATLAS_LLM_BASE_URL` | No | Qwen compatible-mode URL when provider is `openai-compatible` |

Supported `ATLAS_LLM_PROVIDER` values: `anthropic`, `openai-compatible`. Unknown values throw an explicit error.

## Tests

All automated tests use `FakeLlmProvider` or mocked `fetchImpl` — no real network calls in `pnpm test`.

```bash
pnpm --filter @atlas/llm test
```

## References

- P2.1 plan: `../../releases/P2_1_LLM_ADAPTER_IMPLEMENTATION_PLAN.md`
- Closure record: `../../VERSION.md` (P2.1 Extension — OpenAI-Compatible Provider)
