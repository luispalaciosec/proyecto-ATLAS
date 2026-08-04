/**
 * @atlas/retrieval — Capability Retrieval (ADR-0005 D8 MVP)
 */

export type {
  RetrievalContext,
  RetrievalRequest,
  RetrievalResult,
  RetrievedMemoryItem,
} from './retrieval-pipeline.js';

export { runRetrievalPipeline } from './retrieval-pipeline.js';
