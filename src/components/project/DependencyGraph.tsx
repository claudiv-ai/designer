import { useMemo, useRef, useEffect } from 'react';
import type { ComponentDefinition } from '@claudiv/core';
import { useProject } from '../../hooks/useProject';

/**
 * SVG-based dependency graph showing components as nodes and dependencies as directed edges.
 */
export function DependencyGraph() {
  const { components, selectComponent } = useProject();
  const svgRef = useRef<SVGSVGElement>(null);

  const { nodes, edges } = useMemo(() => computeLayout(components), [components]);

  if (components.length === 0) {
    return <p className="text-gray-500 text-sm p-6">No components to visualize.</p>;
  }

  return (
    <div className="h-full overflow-auto p-4">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${Math.max(800, nodes.length * 200)} ${Math.max(400, nodes.length * 80)}`}
        className="w-full h-full min-h-[400px]"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="10"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
          </marker>
        </defs>

        {/* Edges */}
        {edges.map((edge, i) => (
          <g key={`edge-${i}`}>
            <line
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              stroke="#4b5563"
              strokeWidth="1.5"
              markerEnd="url(#arrowhead)"
            />
            {edge.label && (
              <text
                x={(edge.x1 + edge.x2) / 2}
                y={(edge.y1 + edge.y2) / 2 - 6}
                textAnchor="middle"
                className="fill-gray-500 text-[10px]"
              >
                {edge.label}
              </text>
            )}
          </g>
        ))}

        {/* Nodes */}
        {nodes.map((node) => (
          <g
            key={node.fqn}
            className="cursor-pointer"
            onClick={() => selectComponent(node.fqn)}
          >
            <rect
              x={node.x}
              y={node.y}
              width={node.w}
              height={node.h}
              rx="6"
              fill="#1f2937"
              stroke={node.hasDeps ? '#3b82f6' : '#374151'}
              strokeWidth="1.5"
              className="hover:stroke-blue-400 transition-colors"
            />
            <text
              x={node.x + node.w / 2}
              y={node.y + 20}
              textAnchor="middle"
              className="fill-gray-200 text-xs font-medium"
            >
              {node.name}
            </text>
            <text
              x={node.x + node.w / 2}
              y={node.y + 34}
              textAnchor="middle"
              className="fill-gray-500 text-[10px] font-mono"
            >
              {node.fqn}
            </text>
            {node.facetCount > 0 && (
              <text
                x={node.x + node.w / 2}
                y={node.y + 48}
                textAnchor="middle"
                className="fill-blue-400 text-[10px]"
              >
                {node.facetCount} facet(s)
              </text>
            )}
          </g>
        ))}
      </svg>
    </div>
  );
}

interface GraphNode {
  fqn: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  facetCount: number;
  hasDeps: boolean;
}

interface GraphEdge {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
}

function computeLayout(components: ComponentDefinition[]): { nodes: GraphNode[]; edges: GraphEdge[] } {
  if (components.length === 0) return { nodes: [], edges: [] };

  const nodeWidth = 160;
  const nodeHeight = 54;
  const gapX = 60;
  const gapY = 80;
  const cols = Math.max(1, Math.ceil(Math.sqrt(components.length)));

  // Build FQN index
  const fqnIndex = new Map<string, number>();
  components.forEach((c, i) => fqnIndex.set(c.fqn.raw, i));

  // Layout nodes in grid
  const nodes: GraphNode[] = components.map((comp, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    return {
      fqn: comp.fqn.raw,
      name: comp.name,
      x: 40 + col * (nodeWidth + gapX),
      y: 40 + row * (nodeHeight + gapY),
      w: nodeWidth,
      h: nodeHeight,
      facetCount: comp.interface?.facets.length || 0,
      hasDeps: (comp.requires?.length || 0) > 0,
    };
  });

  // Build edges from dependencies
  const edges: GraphEdge[] = [];
  components.forEach((comp, srcIdx) => {
    if (!comp.requires) return;
    for (const dep of comp.requires) {
      // Try to match dep FQN to a known component (strip fragment)
      const depBase = dep.fqn.raw.split('#')[0];
      const targetIdx = fqnIndex.get(depBase);
      if (targetIdx === undefined) continue;

      const src = nodes[srcIdx];
      const tgt = nodes[targetIdx];

      edges.push({
        x1: src.x + src.w / 2,
        y1: src.y + src.h,
        x2: tgt.x + tgt.w / 2,
        y2: tgt.y,
        label: dep.usage || dep.facets?.join(', '),
      });
    }
  });

  return { nodes, edges };
}
