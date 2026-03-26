import NodeCard from "../NodeCard";
import { FALLBACK_NODE_SIZE } from "../../lib/mindmap/constants";
import { getEdgePoint, getLinePoints, getNodeCenter } from "../../lib/mindmap/geometry";

export default function MindMapCanvas({
  viewportRef,
  isFullscreen,
  world,
  pan,
  zoom,
  relationMeta,
  visibleRelations,
  nodePositions,
  nodeSizes,
  activeId,
  selectedRelationKey,
  setSelectedRelationKey,
  graphNodes,
  draggingNodeId,
  hasSearch,
  matchedNodeIds,
  typeMeta,
  onSelect,
  setNodeElement,
  onBeginDrag,
  onDrag,
  onEndDrag,
  onWheel,
  onBeginNodeDrag,
}) {
  return (
    <div
      ref={viewportRef}
      className={["mindmap-viewport", isFullscreen ? "mindmap-viewport-fullscreen" : ""].filter(Boolean).join(" ")}
      onPointerDown={onBeginDrag}
      onPointerMove={onDrag}
      onPointerUp={onEndDrag}
      onPointerLeave={onEndDrag}
      onPointerCancel={onEndDrag}
      onWheel={onWheel}
    >
      <div
        className="mindmap-world"
        style={{
          width: `${world.width}px`,
          height: `${world.height}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        <svg
          className="mindmap-svg-world"
          viewBox={`0 0 ${world.width} ${world.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            {Object.entries(relationMeta).map(([key, meta]) => (
              <marker
                key={key}
                id={`marker-${key}`}
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path d="M0,0 L8,4 L0,8 z" fill={meta.stroke} />
              </marker>
            ))}
          </defs>

          {visibleRelations.map((relation) => {
            const fromCenter = getNodeCenter(nodePositions[relation.from], nodeSizes[relation.from] || FALLBACK_NODE_SIZE);
            const toCenter = getNodeCenter(nodePositions[relation.to], nodeSizes[relation.to] || FALLBACK_NODE_SIZE);
            const from = getEdgePoint(fromCenter, toCenter, nodeSizes[relation.from] || FALLBACK_NODE_SIZE);
            const to = getEdgePoint(toCenter, fromCenter, nodeSizes[relation.to] || FALLBACK_NODE_SIZE);
            const meta = relationMeta[relation.type];
            const pathDefinition = getLinePoints(from, to);
            const isRelated = activeId === relation.from || activeId === relation.to;
            const isSelected = selectedRelationKey === relation.id;

            return (
              <g key={relation.id}>
                <path
                  d={pathDefinition}
                  fill="none"
                  stroke={meta.stroke}
                  strokeWidth={isRelated ? 4 : 2.5}
                  strokeDasharray={meta.dash}
                  opacity={isSelected ? 1 : isRelated ? 1 : 0.45}
                  markerEnd={`url(#marker-${relation.type})`}
                />
                <path
                  d={pathDefinition}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="24"
                  className="mindmap-edge-hitbox"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedRelationKey(relation.id);
                  }}
                />
              </g>
            );
          })}
        </svg>

        {graphNodes.map(({ id, node, position }) => (
          <div
            key={id}
            ref={(element) => setNodeElement(id, element)}
            className={[
              "mindmap-absolute-node",
              draggingNodeId === id ? "mindmap-absolute-node-dragging" : "",
              hasSearch && !matchedNodeIds.has(id) ? "mindmap-absolute-node-muted" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{
              left: `${position.x}px`,
              top: `${position.y}px`,
            }}
            onPointerDown={(event) => onBeginNodeDrag(id, event)}
          >
            <NodeCard
              node={node}
              activeId={activeId}
              onSelect={onSelect}
              typeMeta={typeMeta}
              compact
              muted={hasSearch && !matchedNodeIds.has(id)}
              highlighted={hasSearch && matchedNodeIds.has(id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
