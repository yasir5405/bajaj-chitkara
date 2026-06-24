import {
  Edge,
  DuplicateResult,
  ParentResolutionResult,
  GraphBuildResult,
} from "./types";

export function removeDuplicates(edges: Edge[]): DuplicateResult {
  const seen = new Set<string>();

  const duplicateSet = new Set<string>();
  const uniqueEdges: Edge[] = [];

  for (const edge of edges) {
    if (seen.has(edge.raw)) {
      duplicateSet.add(edge.raw);
      continue;
    }

    seen.add(edge.raw);
    uniqueEdges.push(edge);
  }

  return {
    uniqueEdges,
    duplicateEdges: [...duplicateSet],
  };
}

export function resolveMultiParents(edges: Edge[]): ParentResolutionResult {
  const childToParent = new Map<string, string>();

  const resolvedEdges: Edge[] = [];

  for (const edge of edges) {
    if (childToParent.has(edge.child)) {
      continue;
    }

    childToParent.set(edge.child, edge.parent);
    resolvedEdges.push(edge);
  }

  return {
    edges: resolvedEdges,
  };
}

export function findRoots(
  allNodes: Set<string>,
  childNodes: Set<string>,
): string[] {
  return [...allNodes].filter((node) => !childNodes.has(node)).sort();
}

export function buildGraph(edges: Edge[]): GraphBuildResult {
  const graph = new Map<string, string[]>();

  const allNodes = new Set<string>();
  const childNodes = new Set<string>();

  for (const edge of edges) {
    allNodes.add(edge.parent);
    allNodes.add(edge.child);

    childNodes.add(edge.child);

    if (!graph.has(edge.parent)) {
      graph.set(edge.parent, []);
    }

    graph.get(edge.parent)!.push(edge.child);
  }

  // Ensure every node exists in graph
  for (const node of allNodes) {
    if (!graph.has(node)) {
      graph.set(node, []);
    }
  }

  return {
    graph,
    allNodes,
    childNodes,
  };
}

export function buildUndirectedGraph(edges: Edge[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const edge of edges) {
    if (!graph.has(edge.parent)) {
      graph.set(edge.parent, []);
    }

    if (!graph.has(edge.child)) {
      graph.set(edge.child, []);
    }

    graph.get(edge.parent)!.push(edge.child);
    graph.get(edge.child)!.push(edge.parent);
  }

  return graph;
}

export function findConnectedComponents(
  graph: Map<string, string[]>,
): string[][] {
  const visited = new Set<string>();

  const components: string[][] = [];

  for (const node of graph.keys()) {
    if (visited.has(node)) continue;

    const component: string[] = [];

    const stack = [node];

    visited.add(node);

    while (stack.length) {
      const current = stack.pop()!;

      component.push(current);

      for (const neighbor of graph.get(current) ?? []) {
        if (visited.has(neighbor)) continue;

        visited.add(neighbor);
        stack.push(neighbor);
      }
    }

    components.push(component.sort());
  }

  return components;
}

interface TreeInfo {
  root: string;
  depth: number;
}

export function generateSummary(
  hierarchies: Array<{
    root: string;
    depth?: number;
    has_cycle?: boolean;
  }>,
) {
  const trees = hierarchies.filter((h) => !h.has_cycle);
  const cycles = hierarchies.filter((h) => h.has_cycle);

  let largestTreeRoot = "";

  if (trees.length > 0) {
    const sorted = [...trees].sort((a, b) => {
      const depthA = a.depth ?? 0;
      const depthB = b.depth ?? 0;

      if (depthA !== depthB) {
        return depthB - depthA;
      }

      return a.root.localeCompare(b.root);
    });

    largestTreeRoot = sorted[0].root;
  }

  return {
    total_trees: trees.length,
    total_cycles: cycles.length,
    largest_tree_root: largestTreeRoot,
  };
}
