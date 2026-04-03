import useUi from "../app/useUi";
import RelationLinks from "./RelationLinks";

export default function MindMapRelationsPanel({
  relationInfo,
  relationMeta,
  className = "mindmap-relations",
  onClearSelection,
}) {
  const { copy } = useUi();

  return (
    <section className={className}>
      <header className="panel-header panel-header-compact">
        <div>
          <p className="eyebrow">{copy.relationDetailsEyebrow}</p>
          <h2>{relationInfo.relation.title}</h2>
        </div>
        <div className="details-badges">
          <span className={`link-chip link-${relationInfo.relation.type}`}>
            {relationMeta[relationInfo.relation.type].label}
          </span>
          {onClearSelection ? (
            <button type="button" className="ghost-button" onClick={onClearSelection}>
              {copy.backToNode || (copy.lightTheme === "Light" ? "Back to node" : "Назад до вузла")}
            </button>
          ) : null}
        </div>
      </header>

      <div className="relation-detail-grid">
        <section className="relation-detail-section">
          <h3>{copy.relationDescription}</h3>
          <p>{relationInfo.relation.text || copy.relationDescriptionFallback}</p>
        </section>

        <section className="relation-detail-section">
          <h3>{copy.whatToCheck}</h3>
          <ul className="detail-bullet-list">
            {(relationInfo.relation.actions || [copy.defaultCheckAction]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="relation-link-columns">
          <RelationLinks node={relationInfo.fromNode} resources={relationInfo.fromResources} />
          <RelationLinks node={relationInfo.toNode} resources={relationInfo.toResources} />
        </section>

        <section className="relation-detail-section">
          <h3>{copy.officialSources}</h3>
          {(relationInfo.relation.checks || []).length ? (
            <div className="relation-check-list">
              {relationInfo.relation.checks.map((item) => (
                <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
                  {item.label}
                </a>
              ))}
            </div>
          ) : (
            <div className="empty-state">{copy.noSpecificSources}</div>
          )}
        </section>
      </div>
    </section>
  );
}
