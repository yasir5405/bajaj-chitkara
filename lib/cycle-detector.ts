export function hasCycle(
  graph: Map<string, string[]>,
  component: string[],
): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const componentSet = new Set(component);

  function dfs(node: string): boolean {
    visited.add(node);
    recursionStack.add(node);

    for (const neighbor of graph.get(node) ?? []) {
      if (!componentSet.has(neighbor)) continue;

      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          return true;
        }
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(node);
    return false;
  }

  for (const node of component) {
    if (!visited.has(node)) {
      if (dfs(node)) {
        return true;
      }
    }
  }

  return false;
}
