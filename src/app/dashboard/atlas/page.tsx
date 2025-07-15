"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "react-toastify";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
  loading: () => <p className="text-center">Loading graph lib…</p>,
});

interface NodeX {
  id: string;
  name: string;
  apis: string[];
  x?: number;
  y?: number;
}
interface LinkX { source: string; target: string; type: string }
interface GraphX { nodes: NodeX[]; links: LinkX[] }

export default function AtlasPage() {
  const [repo, setRepo] = useState("dantewins/expounder");
  const [loading, setLoading] = useState(false);
  const [graph, setGraph] = useState<GraphX | null>(null);
  const [selected, setSelected] = useState<NodeX | null>(null);
  const fg = useRef<any>(null);

  async function handleVisualize() {
    if (!repo.includes("/")) return toast.error("owner/repo please");
    setLoading(true);
    setSelected(null);
    try {
      const res = await fetch("/api/core/atlas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const deg: Record<string, number> = {};
      data.edges.forEach((e: any) => {
        deg[e.from] = (deg[e.from] || 0) + 1;
        deg[e.to] = (deg[e.to] || 0) + 1;
      });

      setGraph({
        nodes: data.nodes.map((n: any) => ({
          id: n.id,
          name: n.file,
          apis: n.apis,
          value: Math.min(5 + (deg[n.id] || 1) * 2, 30),
        })),
        links: data.edges.map((e: any) => ({ source: e.from, target: e.to, type: e.type })),
      });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Select a repository</CardTitle>
          <CardDescription>Pick a repo, then visualize it. [Still in construction]</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-3 items-end">
          <Input value={repo} onChange={(e) => setRepo(e.target.value)} disabled={true} />
        </CardContent>
      </Card>

      <div className="grid w-full md:inline-flex">
        <Button onClick={handleVisualize} disabled={true}>
          Visualize {loading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
        </Button>
      </div>
      {graph && (
        <div className="flex flex-1 overflow-hidden rounded-lg border">
          <ForceGraph2D
            ref={fg as any}
            graphData={graph}
            nodeId="id"
            nodeVal="value"
            nodeAutoColorBy={(n: any) => n.name.split("/")[0]}
            linkColor={() => "#cbd5e1"}
            linkWidth={1.2}
            linkCurvature={0.25}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={0.006}
            nodeCanvasObject={(node, ctx, scale) => {
              const n = node as any;
              const r = Math.sqrt(n.value) + 2;
              ctx.beginPath();
              ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
              ctx.fillStyle = selected?.id === n.id ? "#2563eb" : n.color;
              ctx.fill();
              const lbl = n.name.split("/").pop();
              ctx.font = `${10 / scale}px Sans-Serif`;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillStyle = "#fff";
              ctx.fillText(lbl, n.x, n.y);
            }}
            width={typeof window !== "undefined" ? window.innerWidth : 900}
            height={typeof window !== "undefined" ? window.innerHeight - 250 : 600}
            onNodeClick={(n) => setSelected(n as any)}
            cooldownTicks={100}
          />
          {selected && (
            <Card className="w-72 border-l flex-shrink-0 h-full">
              <CardHeader>
                <CardTitle className="font-mono text-xs break-words">{selected.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs p-4">
                <p className="mb-1 font-medium">APIs</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {selected.apis.length ? selected.apis.map((a) => <li key={a}>{a || "—"}</li>) : <li>—</li>}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
