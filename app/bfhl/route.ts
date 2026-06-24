import { ApiResponse } from "@/lib/types";

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

export async function POST() {
  const response: ApiResponse = {
    user_id: "yasir_naseem_03112004",
    email_id: "yasir0393.be23@chitkara.edu.in",
    college_roll_number: "2310990393",
    hierarchies: [],
    invalid_entries: [],
    duplicate_edges: [],
    summary: {
      total_trees: 0,
      total_cycles: 0,
      largest_tree_root: "",
    },
  };

  return Response.json(response, {
    headers: corsHeaders,
  });
}
