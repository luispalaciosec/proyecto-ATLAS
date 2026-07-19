# @atlas/knowledge

## 0.2.0 — Sprint 9

### Added

- `KnowledgeProjectionAdapter` — one-way projection from `KnowledgeObject` to `CreateCompilationUnitParams`
- Public export `@atlas/knowledge/compiler-adapter`
- Canonical source serialization with deterministic SHA-256 checksums
- Lifecycle guard for compilable objects (`operational`, `observed`)
- Unit tests for projection layer

### Notes

- Depends on `@atlas/compiler` for projection target types only
- Compiler package remains unaware of Knowledge (AR-009-03)
- No repository interfaces, memory, retrieval, or workflow changes

## 0.1.0 — Sprint 8

### Added

- Knowledge Metamodel with AG-001 reflective semantic descriptors (`@atlas/knowledge/metamodel`)
- Value Objects aligned to KNOWLEDGE-002/003
- Entities: `KnowledgeStatement`, `KnowledgeRelationship`
- Aggregate: `KnowledgeObject`
- Factories and validators for domain core
- Unit tests with coverage gate (≥85%)

### Notes

- No repository interfaces (AMD-002)
- No engine facade, store, graph aggregate, or operations (Sprint 9+)
