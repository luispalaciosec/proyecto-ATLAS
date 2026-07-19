/**
 * Conceptual layers of organizational intelligence.
 * @see KNOWLEDGE-002 §The Meta Layers
 */
export const MetaLayer = {
  Reality: 'reality',
  Statement: 'statement',
  Object: 'object',
  Graph: 'graph',
} as const;

export type MetaLayer = (typeof MetaLayer)[keyof typeof MetaLayer];

export const META_LAYER_ORDER: readonly MetaLayer[] = [
  MetaLayer.Reality,
  MetaLayer.Statement,
  MetaLayer.Object,
  MetaLayer.Graph,
] as const;
