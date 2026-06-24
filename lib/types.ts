export interface Hierarchy {
  root: string;
  tree: Record<string, unknown>;
  depth?: number;
  has_cycle?: true;
}

export interface Summary {
  total_trees: number;
  total_cycles: number;
  largest_tree_root: string;
}

export interface ApiResponse {
  user_id: string;
  email_id: string;
  college_roll_number: string;
  hierarchies: Hierarchy[];
  invalid_entries: string[];
  duplicate_edges: string[];
  summary: Summary;
}

export interface Edge {
  parent: string;
  child: string;
  raw: string;
}

export interface ValidationResult {
  validEdges: Edge[];
  invalidEntries: string[];
}

export interface DuplicateResult {
  uniqueEdges: Edge[];
  duplicateEdges: string[];
}

export interface ParentResolutionResult {
  edges: Edge[];
}

export interface GraphBuildResult {
  graph: Map<string, string[]>;
  allNodes: Set<string>;
  childNodes: Set<string>;
}

export interface Component {
  nodes: string[];
}