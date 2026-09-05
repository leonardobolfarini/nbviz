import Graph from "graphology";
import { useEffect, useRef, useState } from "react";
import { Sigma } from "sigma";
import FA2Layout from "graphology-layout-forceatlas2/worker";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { GraphEdgesFormat, GraphNodesFormat } from "@/src/pages/types";

interface SigmaRenderProps {
  graphNodes: GraphNodesFormat[];
  graphEdges: GraphEdgesFormat[];
  isFullSize: boolean;
}

export function SigmaRender({
  graphEdges,
  graphNodes,
  isFullSize,
}: SigmaRenderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sigmaInstanceRef = useRef<Sigma | null>(null);
  const layoutRef = useRef<FA2Layout | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const containerHeight = isFullSize ? "100vh" : "400px";

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsLoading(true);

    let timeoutId: NodeJS.Timeout;

    const initSigma = async () => {
      const { Sigma } = await import("sigma");
      const graph = new Graph();

      graphNodes.forEach((node) => {
        graph.addNode(node.data.id, {
          label: node.data.label,
          x: Math.random() * 3000,
          y: Math.random() * 3000,
          size: 3,
          color: "#999",
        });
      });

      graphEdges.forEach((edge) => {
        graph.addEdge(edge.data.source, edge.data.target, {
          color: "#ccc",
          size: 2,
          weight: edge.data.weight,
          label: "",
          originalLabel: String(edge.data.weight),
        });
      });

      const sensibleSettings = forceAtlas2.inferSettings(graph);
      const fa2Layout = new FA2Layout(graph, {
        settings: {
          gravity: 1,
          ...sensibleSettings,
          barnesHutOptimize: true,
          barnesHutTheta: 0.5,
        },
      });

      layoutRef.current = fa2Layout;

      fa2Layout.start();

      timeoutId = setTimeout(() => {
        fa2Layout.stop();

        setIsLoading(false);

        if (containerRef.current && !sigmaInstanceRef.current) {
          const sigma = new Sigma(graph, containerRef.current, {
            allowInvalidContainer: true,
            renderEdgeLabels: true,
            edgeLabelSize: 18,
            edgeLabelColor: { color: "#000" },

            enableEdgeEvents: true,

            labelRenderedSizeThreshold: 0,
          });

          let hoveredNode: string | null = null;

          sigma.on("enterNode", ({ node }) => {
            const neighbors = graph.neighbors(node);
            hoveredNode = node;

            graph.forEachNode((n) => {
              const isNeighbor = neighbors.includes(n) || n === hoveredNode;
              if (isNeighbor) {
                graph.setNodeAttribute(n, "color", "#E41A1C");
                graph.setNodeAttribute(n, "size", 5);
              } else {
                graph.setNodeAttribute(n, "color", "#999");
                graph.setNodeAttribute(n, "size", 3);
              }
            });

            graph.forEachEdge((edge) => {
              const isConnected = graph.hasExtremity(edge, node);

              if (isConnected) {
                graph.setEdgeAttribute(edge, "color", "#E41A1C");
                graph.setEdgeAttribute(
                  edge,
                  "label",
                  graph.getEdgeAttribute(edge, "originalLabel"),
                );
                graph.setEdgeAttribute(edge, "size", 4);
                graph.setEdgeAttribute(edge, "zIndex", 1);
              } else {
                graph.setEdgeAttribute(edge, "color", "#ccc");
                graph.setEdgeAttribute(edge, "label", "");
                graph.setEdgeAttribute(edge, "size", 2);
                graph.setEdgeAttribute(edge, "zIndex", 0);
              }
            });
          });

          sigma.on("leaveNode", () => {
            graph.forEachNode((node) => {
              graph.setNodeAttribute(node, "color", "#999");
              graph.setNodeAttribute(node, "size", 3);
            });
            graph.forEachEdge((edge) => {
              graph.setEdgeAttribute(edge, "color", "#ccc");
              graph.setEdgeAttribute(edge, "label", "");
              graph.setEdgeAttribute(edge, "size", 2);
              graph.setEdgeAttribute(edge, "zIndex", 0);
            });
          });

          sigma.on("enterEdge", ({ edge }) => {
            graph.forEachNode((node) => {
              const isConnected = graph.hasExtremity(edge, node);

              if (isConnected) {
                graph.setNodeAttribute(node, "color", "#E41A1C");
                graph.setNodeAttribute(node, "size", 5);
              } else {
                graph.setNodeAttribute(node, "color", "#999");
                graph.setNodeAttribute(node, "size", 3);
              }
            });

            graph.setEdgeAttribute(edge, "color", "#E41A1C");
            graph.setEdgeAttribute(
              edge,
              "label",
              graph.getEdgeAttribute(edge, "originalLabel"),
            );
            graph.setEdgeAttribute(edge, "size", 4);
            graph.setEdgeAttribute(edge, "zIndex", 1);
          });

          sigma.on("leaveEdge", ({ edge }) => {
            graph.setEdgeAttribute(edge, "color", "#ccc");
            graph.setEdgeAttribute(edge, "label", "");
            graph.setEdgeAttribute(edge, "size", 2);
            graph.setEdgeAttribute(edge, "zIndex", 0);

            graph.forEachNode((node) => {
              graph.setNodeAttribute(node, "color", "#999");
              graph.setNodeAttribute(node, "size", 3);
            });
          });

          sigmaInstanceRef.current = sigma;
          sigma.refresh();
        }
      }, 10000);
    };

    initSigma();

    return () => {
      clearTimeout(timeoutId);
      if (layoutRef.current) {
        layoutRef.current.kill();
      }
      if (sigmaInstanceRef.current) {
        sigmaInstanceRef.current.kill();
        sigmaInstanceRef.current = null;
      }
    };
  }, [graphNodes, graphEdges]);

  useEffect(() => {
    if (sigmaInstanceRef.current && !isLoading) {
      requestAnimationFrame(() => {
        sigmaInstanceRef.current?.resize();
        sigmaInstanceRef.current?.refresh();
      });
    }
  }, [isFullSize, isLoading]);

  return (
    <div
      style={{ position: "relative", width: "100%", height: containerHeight }}
    >
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            color: "#666",
            fontFamily: "sans-serif",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #ddd",
              borderTop: "4px solid #333",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px",
            }}
          >
            <style>
              {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
        </div>
      )}

      <div
        id="sigmaContainer"
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
