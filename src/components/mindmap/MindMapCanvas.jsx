import { memo, useMemo } from "react";
import NodeCard from "../NodeCard";
import { FALLBACK_NODE_SIZE } from "../../lib/mindmap/constants";
import {
  getEdgePoint,
  getNodeCenter,
  getOffsetLinePoints,
  getPerpendicularOffset,
} from "../../lib/mindmap/geometry";
import { getCanonicalRelationPair, getRelationOffsets } from "../../lib/mindmap/relationLayout";

const RelationEdge = memo(function RelationEdge({
  relation,
  meta,
  relationOffset,
  fromPos,
  toPos,
  fromSize,
  toSize,
  canonicalFromPos,
  canonicalToPos,
  canonicalFromSize,
  canonicalToSize,
  isRelated,
  isSelected,
  onSelectRelation,
}) {
  const pathDefinition = useMemo(() => {
    if (!fromPos || !toPos || !canonicalFromPos || !canonicalToPos) return "";

    const fromCenter = getNodeCenter(fromPos, fromSize);
    const toCenter = getNodeCenter(toPos, toSize);
    const canonicalFromCenter = getNodeCenter(canonicalFromPos, canonicalFromSize);
    const canonicalToCenter = getNodeCenter(canonicalToPos, canonicalToSize);

    const centerOffset = getPerpendicularOffset(canonicalFromCenter, canonicalToCenter, relationOffset);
    const shiftedFromCenter = {
      x: fromCenter.x + centerOffset.x,
      y: fromCenter.y + centerOffset.y,
    };
    const shiftedToCenter = {
      x: toCenter.x + centerOffset.x,
      y: toCenter.y + centerOffset.y,
    };
    const from = getEdgePoint(shiftedFromCenter, shiftedToCenter, fromSize);
    const to = getEdgePoint(shiftedToCenter, shiftedFromCenter, toSize);

    return getOffsetLinePoints(from, to);
  }, [
    fromPos,
    toPos,
    canonicalFromPos,
    canonicalToPos,
    fromSize,
    toSize,
    canonicalFromSize,
    canonicalToSize,
    relationOffset,
  ]);

  if (!pathDefinition) return null;

  return (
    <g>
      <path
        d={pathDefinition}
        fill="none"
        stroke={meta.stroke}
        strokeWidth={isRelated ? 4 : 2.5}
        strokeDasharray={meta.dash}
        opacity={isSelected ? 1 : isRelated ? 1 : 0.45}
        markerEnd={`url(#marker-${relation.type})`}
        className="mindmap-edge"
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
          onSelectRelation(relation.id);
        }}
      />
    </g>
  );
});

function MindMapCanvas({
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
  graphNodes,
  draggingNodeId,
  hasSearch,
  matchedNodeIds,
  showCtrlHint,
  typeMeta,
  onSelect,
  onSelectRelation,
  setNodeElement,
  onBeginDrag,
  onDrag,
  onEndDrag,
  onBeginNodeDrag,
}) {
  const relationOffsets = useMemo(() => getRelationOffsets(visibleRelations), [visibleRelations]);

  return (
    <div
      ref={viewportRef}
      className={["mindmap-viewport", isFullscreen ? "mindmap-viewport-fullscreen" : ""].filter(Boolean).join(" ")}
      onPointerDown={onBeginDrag}
      onPointerMove={onDrag}
      onPointerUp={onEndDrag}
      onPointerLeave={onEndDrag}
      onPointerCancel={onEndDrag}
    >
      <div
        className={[
          "mindmap-zoom-overlay",
          showCtrlHint ? "mindmap-zoom-overlay-active" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-hidden="true"
      >
        <strong className="mindmap-zoom-overlay-title">Ctrl + scroll</strong>
        <span className="mindmap-zoom-overlay-copy">to zoom the map</span>
      </div>
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

          {visibleRelations.map((relation) => (
            <RelationEdge
              key={relation.id}
              relation={relation}
              meta={relationMeta[relation.type]}
              relationOffset={relationOffsets.get(relation.id) || 0}
              fromPos={nodePositions[relation.from]}
              toPos={nodePositions[relation.to]}
              fromSize={nodeSizes[relation.from] || FALLBACK_NODE_SIZE}
              toSize={nodeSizes[relation.to] || FALLBACK_NODE_SIZE}
              canonicalFromPos={nodePositions[getCanonicalRelationPair(relation.from, relation.to)[0]]}
              canonicalToPos={nodePositions[getCanonicalRelationPair(relation.from, relation.to)[1]]}
              canonicalFromSize={nodeSizes[getCanonicalRelationPair(relation.from, relation.to)[0]] || FALLBACK_NODE_SIZE}
              canonicalToSize={nodeSizes[getCanonicalRelationPair(relation.from, relation.to)[1]] || FALLBACK_NODE_SIZE}
              isRelated={activeId === relation.from || activeId === relation.to}
              isSelected={selectedRelationKey === relation.id}
              onSelectRelation={onSelectRelation}
            />
          ))}
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

export default memo(MindMapCanvas);
