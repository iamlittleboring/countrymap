import { memo } from "react";

function NodeCard({
  node,
  activeId,
  onSelect,
  typeMeta,
  center = false,
  compact = false,
  muted = false,
  highlighted = false,
}) {
  const meta = typeMeta[node.type] || { label: node.type };

  return (
    <button
      type="button"
      className={[
        "map-node-card",
        center ? "map-node-center" : "",
        compact ? "map-node-compact" : "",
        muted ? "map-node-muted" : "",
        highlighted ? "map-node-highlighted" : "",
        activeId === node.id ? "map-node-active" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelect(node.id)}
      aria-pressed={activeId === node.id}
      aria-label={`${node.title}, ${meta.label}, рівень ${node.level || 1}`}
    >
      <span className="map-node-topline">
        <span>{meta.label}</span>
        <span className="level-pill">Рівень {node.level || 1}</span>
      </span>
      <strong>{node.title}</strong>
      <span>{node.description}</span>
    </button>
  );
}

export default memo(NodeCard);
