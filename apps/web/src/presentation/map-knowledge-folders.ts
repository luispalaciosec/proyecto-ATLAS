export interface KnowledgeFoldersResponseProduct {
  readonly workspace: string;
  readonly folders: readonly string[];
}

export function mapKnowledgeFoldersToProduct(
  workspaceKey: string | undefined,
  folders: readonly string[],
): KnowledgeFoldersResponseProduct {
  return Object.freeze({
    workspace: workspaceKey?.trim() || 'default',
    folders: Object.freeze([...folders]),
  });
}
