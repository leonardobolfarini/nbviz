import Graph from "graphology";
import { useEffect, useRef, useState } from "react";
import type { Sigma } from "sigma";
import type FA2Layout from "graphology-layout-forceatlas2/worker";
import { GraphEdgesFormat, GraphNodesFormat } from "@/src/pages/types";

interface SigmaRenderProps {
  graphNodes: GraphNodesFormat[];
  graphEdges: GraphEdgesFormat[];
  isFullSize: boolean;
}

const FORCE_ATLAS_NODE_LIMIT = 2_500;
const FORCE_ATLAS_EDGE_LIMIT = 8_000;

function initialPosition(index: number, total: number) {
  const angle = index * 2.39;
  const radius = Math.sqrt(index / Math.max(total, 1));
  return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
}

export function SigmaRender({
  graphEdges,
  graphNodes,
  isFullSize,
}: SigmaRenderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaRef = useRef<Sigma | null>(null);
  const layoutRef = useRef<FA2Layout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const canUseForceAtlas =
    graphNodes.length <= FORCE_ATLAS_NODE_LIMIT &&
    graphEdges.length <= FORCE_ATLAS_EDGE_LIMIT;

  useEffect(() => {
    if (typeof window === "undefined" || !containerRef.current) return;

    let cancelled = false;
    let stopTimer: ReturnType<typeof setTimeout> | undefined;
    let renderer: Sigma | null = null;
    setIsLoading(true);

    const initialize = async () => {
      const [sigmaModule, layoutModule, forceAtlasModule] = await Promise.all([
        import("sigma"),
        import("graphology-layout-forceatlas2/worker"),
        import("graphology-layout-forceatlas2"),
      ]);
      if (cancelled || !containerRef.current) return;

      const graph = new Graph({ multi: true, allowSelfLoops: false });
      const ids = new Set<string>();
      graphNodes.forEach((node, index) => {
        const id = String(node.data.id);
        if (ids.has(id)) return;
        ids.add(id);
        graph.addNode(id, {
          label: node.data.label,
          ...initialPosition(index, graphNodes.length),
          size: 3,
          color: "#64748b",
        });
      });
      graphEdges.forEach((edge) => {
        const source = String(edge.data.source);
        const target = String(edge.data.target);
        if (!ids.has(source) || !ids.has(target) || source === target) return;
        graph.addEdge(source, target, {
          color: "#cbd5e1",
          size: 1,
          weight: edge.data.weight,
        });
      });

      renderer = new sigmaModule.Sigma(graph, containerRef.current, {
        allowInvalidContainer: true,
        renderLabels: graph.order <= 600,
        renderEdgeLabels: false,
        enableEdgeEvents: false,
        hideEdgesOnMove: graph.size > 3_000,
        hideLabelsOnMove: true,
        labelRenderedSizeThreshold: 9,
        zIndex: false,
      });
      sigmaRef.current = renderer;
      setIsLoading(false);

      if (!canUseForceAtlas || graph.order < 2 || graph.size === 0) return;

      const layout = new layoutModule.default(graph, {
        settings: {
          ...forceAtlasModule.default.inferSettings(graph),
          barnesHutOptimize: true,
          barnesHutTheta: 0.8,
          gravity: 1,
          slowDown: Math.max(2, Math.sqrt(graph.order) / 3),
        },
      });
      layoutRef.current = layout;
      layout.start();
      stopTimer = setTimeout(
        () => layout.stop(),
        graph.order > 1_000 ? 900 : 2_000,
      );
    };
    void initialize();

    return () => {
      cancelled = true;
      if (stopTimer) clearTimeout(stopTimer);
      layoutRef.current?.kill();
      layoutRef.current = null;
      renderer?.kill();
      sigmaRef.current = null;
    };
  }, [graphEdges, graphNodes, canUseForceAtlas]);

  useEffect(() => {
    if (!isLoading) requestAnimationFrame(() => sigmaRef.current?.resize());
  }, [isFullSize, isLoading]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: isFullSize ? "100vh" : "400px",
      }}
    >
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50 text-slate-500">
          Preparando a visualização…
        </div>
      )}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          visibility: isLoading ? "hidden" : "visible",
        }}
      />
    </div>
  );
}
