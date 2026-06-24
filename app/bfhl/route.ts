import { hasCycle } from "@/lib/cycle-detector";
import {
  buildGraph,
  buildUndirectedGraph,
  findConnectedComponents,
  generateSummary,
  removeDuplicates,
  resolveMultiParents,
} from "@/lib/graph";
import { buildHierarchy } from "@/lib/tree-builder";
import { ApiResponse, Hierarchy } from "@/lib/types";
import { validateEntries } from "@/lib/validator";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const data = Array.isArray(body.data) ? body.data : [];

    // Step 1: Validation
    const validation = validateEntries(data);

    // Step 2: Duplicate Removal
    const duplicates = removeDuplicates(validation.validEdges);

    // Step 3: Multi-Parent Resolution
    const resolved = resolveMultiParents(duplicates.uniqueEdges);

    // Step 4: Graph Construction
    const graphResult = buildGraph(resolved.edges);

    // Step 5: Connected Components
    const undirectedGraph = buildUndirectedGraph(resolved.edges);
    const components = findConnectedComponents(undirectedGraph);

    // Step 6: Hierarchy Generation
    const hierarchies: Hierarchy[] = [];

    for (const component of components) {
      const cycle = hasCycle(graphResult.graph, component);

      // Cycle component
      if (cycle) {
        hierarchies.push({
          root: [...component].sort()[0],
          tree: {},
          has_cycle: true,
        });

        continue;
      }

      // Normal tree component
      const componentRoots = component.filter(
        (node) => !graphResult.childNodes.has(node),
      );

      const root = componentRoots.sort()[0];

      hierarchies.push(buildHierarchy(graphResult.graph, root) as Hierarchy);
    }

    // Step 7: Summary
    const summary = generateSummary(hierarchies);

    const response: ApiResponse = {
      user_id: "yasirnaseem_03112004",
      email_id: "yasir0393.be23@chitkara.edu.in",
      college_roll_number: "2310990393",

      hierarchies,

      invalid_entries: validation.invalidEntries,

      duplicate_edges: duplicates.duplicateEdges,

      summary,
    };

    return Response.json(response, {
      headers: corsHeaders,
    });
  } catch {
    return Response.json(
      {
        error: "Invalid request body",
      },
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  }
}
