import { MetaConceptId } from '../../metamodel/meta-concept-id.js';

export interface BehaviorIntention {
  readonly name: string;
  readonly description?: string;
}

export class ObjectBehavior {
  readonly metaConcept = MetaConceptId.Object;

  readonly intentions: readonly BehaviorIntention[];

  private constructor(intentions: readonly BehaviorIntention[]) {
    this.intentions = Object.freeze([...intentions]);
  }

  static create(intentions: readonly BehaviorIntention[] = []): ObjectBehavior {
    return new ObjectBehavior(intentions);
  }

  equals(other: ObjectBehavior): boolean {
    return (
      this.intentions.length === other.intentions.length &&
      this.intentions.every(
        (intention, index) =>
          intention.name === other.intentions[index]?.name &&
          intention.description === other.intentions[index]?.description,
      )
    );
  }
}
