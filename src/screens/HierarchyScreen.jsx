import NodeDetailsPanel from "../components/NodeDetailsPanel";
import TreeNode from "../components/TreeNode";
import useUi from "../components/app/useUi";

export default function HierarchyScreen({
  query,
  activeId,
  expanded,
  autoExpanded,
  matches,
  hierarchyData,
  typeMeta,
  activeNode,
  breadcrumb,
  onSelect,
  onToggle,
  onExpandAll,
  onCollapseAll,
}) {
  const { copy } = useUi();
  const hasQuery = query.trim().length > 0;

  return (
    <section className="content-grid">
      <article className="panel panel-hierarchy">
        <header className="panel-header">
          <div>
            <p className="eyebrow">{copy.structureEyebrow}</p>
            <h2>{copy.hierarchyTitle}</h2>
          </div>
          <div className="header-actions">
            <button type="button" className="ghost-button" onClick={onExpandAll}>
              {copy.expandAll}
            </button>
            <button type="button" className="ghost-button" onClick={onCollapseAll}>
              {copy.collapseAll}
            </button>
          </div>
        </header>

        <div className="tree-list">
          {hasQuery && matches.size === 0 ? (
            <div className="empty-state">{copy.tryAnotherQuery}</div>
          ) : (
            <TreeNode
              node={hierarchyData}
              activeId={activeId}
              expanded={expanded}
              autoExpanded={autoExpanded}
              matches={matches}
              typeMeta={typeMeta}
              onSelect={onSelect}
              onToggle={onToggle}
            />
          )}
        </div>
      </article>

      <NodeDetailsPanel
        activeNode={activeNode}
        breadcrumb={breadcrumb}
        typeMeta={typeMeta}
        onSelect={onSelect}
      />
    </section>
  );
}
