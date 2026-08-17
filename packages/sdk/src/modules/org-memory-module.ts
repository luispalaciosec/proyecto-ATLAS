import type { Atlas } from '../atlas/atlas.js';
import { storeEntity, storeEntityVersion, upsertEntity } from '../org/entity-store.js';
import { getEntityHistory, resolveEntity, resolveEntityById } from '../org/entity-resolver.js';
import { getRelated } from '../org/graph-traversal.js';
import {
  formatCurrentWarrantyPolicy,
  formatDiscountEvaluation,
  formatWarrantyPolicyHistory,
} from '../org/policy-answer.js';
import { evaluateDiscountRequest, type DiscountEvaluation } from '../org/policy-evaluator.js';
import { linkEntities } from '../org/relationship-store.js';
import type { WarrantyPolicy } from '../org/schemas/warranty-policy.js';
import {
  resolveCurrentPolicy,
  resolveCurrentWarrantyByCode,
  resolvePolicyHistory,
  type ResolvedPolicy,
} from '../org/version-resolver.js';

export class OrgMemoryModule {
  readonly #atlas: Atlas;

  constructor(atlas: Atlas) {
    this.#atlas = atlas;
  }

  storeEntity(
    recordType: string,
    id: string,
    content: unknown,
    metadata?: Readonly<Record<string, unknown>>,
  ) {
    return storeEntity(this.#atlas, recordType, id, content, metadata);
  }

  storeEntityVersion(
    recordId: string,
    previousContent: unknown,
    revision: number,
    author: string,
  ) {
    return storeEntityVersion(this.#atlas, recordId, previousContent, revision, author);
  }

  upsertEntity(
    recordType: string,
    entityId: string,
    content: unknown,
    author?: string,
  ) {
    return upsertEntity(this.#atlas, recordType, entityId, content, author);
  }

  resolveEntity(recordType: string, matcher: Readonly<Record<string, unknown>>) {
    return resolveEntity(this.#atlas, recordType, matcher);
  }

  resolveEntityById(entityId: string) {
    return resolveEntityById(this.#atlas, entityId);
  }

  getEntityHistory(recordId: string) {
    return getEntityHistory(this.#atlas, recordId);
  }

  linkEntities(
    sourceId: string,
    targetId: string,
    relationshipType: string,
    metadata?: Readonly<Record<string, unknown>>,
  ) {
    return linkEntities(this.#atlas, sourceId, targetId, relationshipType, metadata);
  }

  getRelated(recordId: string, relationshipType?: string) {
    return getRelated(this.#atlas, recordId, relationshipType);
  }

  evaluateDiscountRequest(
    clientLegalName: string,
    requestedPercent: number,
  ): Promise<DiscountEvaluation> {
    return evaluateDiscountRequest(this.#atlas, clientLegalName, requestedPercent);
  }

  formatDiscountEvaluation(evaluation: DiscountEvaluation): string {
    return formatDiscountEvaluation(evaluation);
  }

  resolveCurrentPolicy(recordType: string, policyCode: string) {
    return resolveCurrentPolicy(this.#atlas, recordType, policyCode);
  }

  resolveCurrentWarrantyByCode(policyCode: string): Promise<ResolvedPolicy<WarrantyPolicy>> {
    return resolveCurrentWarrantyByCode(this.#atlas, policyCode);
  }

  resolvePolicyHistory(recordId: string) {
    return resolvePolicyHistory(this.#atlas, recordId);
  }

  formatCurrentWarrantyPolicy(resolved: ResolvedPolicy<WarrantyPolicy>): string {
    return formatCurrentWarrantyPolicy(resolved);
  }

  async formatWarrantyWithHistory(policyCode: string): Promise<string> {
    const current = await resolveCurrentWarrantyByCode(this.#atlas, policyCode);
    const history = await resolvePolicyHistory(this.#atlas, current.entityId);

    return formatWarrantyPolicyHistory(current, history);
  }
}
