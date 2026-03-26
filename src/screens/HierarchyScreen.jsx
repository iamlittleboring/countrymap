import TreeNode from "../components/TreeNode";
import NodeDetailsPanel from "../components/NodeDetailsPanel";

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
  const hasQuery = query.trim().length > 0;

  return (
    <section className="content-grid">
      <article className="panel panel-hierarchy">
        <header className="panel-header">
          <div>
            <p className="eyebrow">Структура</p>
            <h2>Ієрархія</h2>
          </div>
          <div className="header-actions">
            <button type="button" className="ghost-button" onClick={onExpandAll}>
              Розгорнути все
            </button>
            <button type="button" className="ghost-button" onClick={onCollapseAll}>
              Згорнути
            </button>
          </div>
        </header>

        <div className="tree-list">
          {hasQuery && matches.size === 0 ? (
            <div className="empty-state">Нічого не знайдено. Спробуйте інший запит.</div>
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
