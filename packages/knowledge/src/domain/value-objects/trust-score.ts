import { MetaConceptId } from '../../metamodel/meta-concept-id.js';
import { createKnowledgeError } from '../../errors/create-knowledge-error.js';

export interface TrustSignal {
  readonly name: string;
  readonly weight: number;
}

export class TrustScore {
  readonly metaConcept = MetaConceptId.Trust;

  readonly level: number;
  readonly signals: readonly TrustSignal[];

  private constructor(level: number, signals: readonly TrustSignal[]) {
    this.level = level;
    this.signals = Object.freeze([...signals]);
  }

  static create(level: number, signals: readonly TrustSignal[] = []): TrustScore {
    if (level < 0 || level > 1) {
      throw createKnowledgeError('KNOWLEDGE_INVALID_TRUST', 'Trust level must be between 0 and 1');
    }

    for (const signal of signals) {
      if (signal.weight < 0 || signal.weight > 1) {
        throw createKnowledgeError(
          'KNOWLEDGE_INVALID_TRUST',
          `Trust signal "${signal.name}" weight must be between 0 and 1`,
        );
      }
    }

    return new TrustScore(level, signals);
  }

  static initial(): TrustScore {
    return TrustScore.create(0, []);
  }
}
