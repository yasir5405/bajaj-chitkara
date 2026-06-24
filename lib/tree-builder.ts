export function buildTree(
  graph: Map<string, string[]>,
  root: string,
): Record<string, unknown> {
  function dfs(node: string): Record<string, unknown> {
    const children = graph.get(node) ?? [];

    const result: Record<string, unknown> = {};

    for (const child of children) {
      result[child] = dfs(child);
    }

    return result;
  }

  return {
    [root]: dfs(root),
  };
}

export function calculateDepth(
  graph: Map<string, string[]>,
  root: string,
): number {
  function dfs(node: string): number {
    const children = graph.get(node) ?? [];

    if (children.length === 0) {
      return 1;
    }

    return 1 + Math.max(...children.map((child) => dfs(child)));
  }

  return dfs(root);
}

export function buildHierarchy(graph: Map<string, string[]>, root: string) {
  return {
    root,
    tree: buildTree(graph, root),
    depth: calculateDepth(graph, root),
  };
}
