import { getChildren } from "../lib/mapUtils";

function TreeNode({
  node,
  depth = 0,
  activeId,
  expanded,
  autoExpanded,
  matches,
  typeMeta,
  onSelect,
  onToggle,
}) {
  const children = getChildren(node);
  const hasChildren = children.length > 0;
  const isOpen = expanded.has(node.id) || autoExpanded.has(node.id);
  const isActive = activeId === node.id;
  const isMatch = matches.has(node.id);
  const meta = typeMeta[node.type] || { label: node.type };
  const indent = depth * 16;

  return (
    <div className="tree-node-wrap">
      <button
        type="button"
        className={[
          "tree-node",
          isActive ? "tree-node-active" : "",
          isMatch ? "tree-node-match" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          marginLeft: `${indent}px`,
          width: `calc(100% - ${indent}px)`,
        }}
        onClick={() => {
          onSelect(node.id);
          if (hasChildren) onToggle(node.id);
        }}
        aria-current={isActive ? "true" : undefined}
      >
        <span className="tree-node-copy">
          <span className="tree-node-meta-row">
            <span className="tree-node-type">{meta.label}</span>
            <span className="level-pill">Рівень {node.level || 1}</span>
          </span>
          <span className="tree-node-title">{node.title}</span>
          <span className="tree-node-description">{node.description}</span>
        </span>
        {hasChildren && (
          <span className={isOpen ? "tree-node-chevron open" : "tree-node-chevron"}>
            {isOpen ? "Згорнути" : "Розгорнути"}
          </span>
        )}
      </button>

      {hasChildren && isOpen && (
        <div className="tree-children">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              expanded={expanded}
              autoExpanded={autoExpanded}
              matches={matches}
              typeMeta={typeMeta}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TreeNode;
