"use client";

import { useState, useRef } from "react";

type ApiResponse = {
  user_id: string;
  email_id: string;
  college_roll_number: string;
  hierarchies: any[];
  invalid_entries: string[];
  duplicate_edges: string[];
  summary: {
    total_trees: number;
    total_cycles: number;
    largest_tree_root: string;
  };
};

type Node = { id: string; x: number; y: number; children: string[] };

function buildLayoutNodes(tree: any, root: string): Node[] {
  const nodes: Node[] = [];
  const nodeMap = new Map<string, Node>();
  const levelMap = new Map<number, string[]>();

  function traverse(obj: any, nodeId: string, depth: number) {
    if (!levelMap.has(depth)) levelMap.set(depth, []);
    levelMap.get(depth)!.push(nodeId);
    const children = obj && typeof obj === "object" ? Object.keys(obj) : [];
    const node: Node = { id: nodeId, x: 0, y: depth * 80 + 40, children };
    nodeMap.set(nodeId, node);
    nodes.push(node);
    for (const child of children) traverse(obj[child], child, depth + 1);
  }

  traverse(tree[root] ?? {}, root, 0);

  levelMap.forEach((ids, depth) => {
    const total = ids.length;
    ids.forEach((id, i) => {
      const node = nodeMap.get(id);
      if (node) node.x = ((i + 1) / (total + 1)) * 560 + 20;
    });
  });

  return nodes;
}

function TreeCanvas({ hierarchy }: { hierarchy: any }) {
  const canvasRef = useRef<SVGSVGElement>(null);
  const root = hierarchy.root;
  const nodes = buildLayoutNodes(hierarchy.tree ?? {}, root);
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  const maxY = Math.max(...nodes.map((n) => n.y), 0) + 80;
  const hasCycle = hierarchy.has_cycle;

  return (
    <svg
      ref={canvasRef}
      width="100%"
      viewBox={`0 0 600 ${maxY}`}
      className="w-full"
      style={{ minHeight: 120 }}
    >
      <defs>
        <marker
          id={`arrow-${root}`}
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </marker>
      </defs>

      {nodes.map((node) =>
        node.children.map((childId) => {
          const child = nodeMap.get(childId);
          if (!child) return null;
          return (
            <line
              key={`${node.id}-${childId}`}
              x1={node.x}
              y1={node.y + 18}
              x2={child.x}
              y2={child.y - 18}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeOpacity="0.5"
              markerEnd={`url(#arrow-${root})`}
            />
          );
        }),
      )}

      {nodes.map((node) => (
        <g key={node.id}>
          <circle
            cx={node.x}
            cy={node.y}
            r={18}
            fill={
              node.id === root ? (hasCycle ? "#fee2e2" : "#ede9fe") : "#f1f5f9"
            }
            stroke={
              node.id === root ? (hasCycle ? "#ef4444" : "#6366f1") : "#cbd5e1"
            }
            strokeWidth={node.id === root ? 2 : 1}
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="12"
            fontWeight={node.id === root ? "600" : "400"}
            fill={
              node.id === root ? (hasCycle ? "#dc2626" : "#4f46e5") : "#475569"
            }
          >
            {node.id}
          </text>
        </g>
      ))}

      {hasCycle && (
        <text
          x="300"
          y={maxY - 10}
          textAnchor="middle"
          fontSize="11"
          fill="#ef4444"
        >
          ⚠ Cycle detected in this tree
        </text>
      )}
    </svg>
  );
}

export default function Home() {
  const [input, setInput] = useState(`A->B
A->C
B->D`);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit() {
    try {
      setLoading(true);
      setError("");

      const data = input
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const res = await fetch("/bfhl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      const json = await res.json();
      setResponse(json);
    } catch {
      setError("Failed to call API");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-scree">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-extrabold text-slate-900">
            Graph Hierarchy Analyzer
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Chitkara Full Stack Engineering Challenge
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
          <label className="mb-3 block text-lg font-semibold text-slate-800">
            Enter Relationships
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`A->B
A->C
B->D`}
            className="h-44 w-full rounded-2xl border border-slate-300 p-4 font-mono text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Processing..." : "Analyze Graph"}
          </button>

          {error && (
            <p className="mt-4 rounded-lg bg-red-100 p-3 text-red-600">
              {error}
            </p>
          )}
        </div>

        {response && (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Total Trees
                </h3>
                <p className="mt-2 text-4xl font-bold text-green-600">
                  {response.summary?.total_trees}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Total Cycles
                </h3>
                <p className="mt-2 text-4xl font-bold text-red-600">
                  {response.summary?.total_cycles}
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Largest Tree Root
                </h3>
                <p className="mt-2 text-4xl font-bold text-blue-600">
                  {response.summary?.largest_tree_root || "-"}
                </p>
              </div>
            </div>

            {/* Visual Tree Diagrams */}
            <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-6 text-2xl font-bold">Visual Graph</h2>
              <div className="space-y-8">
                {response.hierarchies.map((hierarchy, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700">
                        Root: {hierarchy.root}
                      </span>
                      {hierarchy.depth && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                          Depth: {hierarchy.depth}
                        </span>
                      )}
                      {hierarchy.has_cycle && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-600">
                          ⚠ Cycle
                        </span>
                      )}
                    </div>
                    <TreeCanvas hierarchy={hierarchy} />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold">Invalid Entries</h2>
                {response.invalid_entries.length === 0 ? (
                  <p className="text-slate-500">No invalid entries</p>
                ) : (
                  <ul className="space-y-2">
                    {response.invalid_entries.map((entry, index) => (
                      <li
                        key={index}
                        className="rounded-lg bg-red-50 p-2 text-red-600"
                      >
                        {entry}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold">Duplicate Edges</h2>
                {response.duplicate_edges.length === 0 ? (
                  <p className="text-slate-500">No duplicates found</p>
                ) : (
                  <ul className="space-y-2">
                    {response.duplicate_edges.map((edge, index) => (
                      <li
                        key={index}
                        className="rounded-lg bg-yellow-50 p-2 text-yellow-700"
                      >
                        {edge}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-2xl font-bold">Hierarchies</h2>
              <div className="space-y-4">
                {response.hierarchies.map((hierarchy, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap gap-4">
                      <span>
                        <strong>Root:</strong> {hierarchy.root}
                      </span>
                      {hierarchy.depth && (
                        <span>
                          <strong>Depth:</strong> {hierarchy.depth}
                        </span>
                      )}
                      {hierarchy.has_cycle && (
                        <span className="font-semibold text-red-600">
                          Cycle Detected
                        </span>
                      )}
                    </div>
                    <pre className="mt-4 overflow-auto rounded-lg bg-slate-900 p-4 text-sm text-green-400">
                      {JSON.stringify(hierarchy.tree, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
              <h2 className="mb-4 text-2xl font-bold">Raw API Response</h2>
              <pre className="overflow-auto rounded-xl bg-slate-950 p-4 text-sm text-green-400">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
