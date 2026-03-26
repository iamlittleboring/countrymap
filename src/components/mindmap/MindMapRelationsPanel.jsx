import RelationLinks from "./RelationLinks";

export default function MindMapRelationsPanel({
  activeId,
  nodesById,
  relationInfo,
  relationMeta,
  relatedRelations,
  selectedRelationKey,
  setSelectedRelationKey,
}) {
  return (
    <section className="mindmap-relations">
      <header className="panel-header panel-header-compact">
        <div>
          <p className="eyebrow">Деталі зв&apos;язку</p>
          <h2>{relationInfo ? relationInfo.relation.title : "Оберіть зв&apos;язок"}</h2>
        </div>
        {relationInfo && (
          <span className={`link-chip link-${relationInfo.relation.type}`}>
            {relationMeta[relationInfo.relation.type].label}
          </span>
        )}
      </header>

      <section className="relation-detail-section">
        <h3>Зв&apos;язки активного вузла</h3>
        {relatedRelations.length ? (
          <div className="relation-picker-grid">
            {relatedRelations.map((relation) => {
              const otherNodeId = relation.from === activeId ? relation.to : relation.from;
              const otherNode = nodesById[otherNodeId];

              return (
                <button
                  key={relation.id}
                  type="button"
                  className={[
                    "relation-picker-card",
                    selectedRelationKey === relation.id ? "relation-picker-card-active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => setSelectedRelationKey(relation.id)}
                >
                  <span className={`link-chip link-${relation.type}`}>{relationMeta[relation.type].label}</span>
                  <strong>{otherNode?.title || relation.title}</strong>
                  <span>{relation.title}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">Для активного вузла поки немає видимих зв&apos;язків на мапі.</div>
        )}
      </section>

      {relationInfo ? (
        <div className="relation-detail-grid">
          <section className="relation-detail-section">
            <h3>Опис зв&apos;язку</h3>
            <p>{relationInfo.relation.text || "Для цього зв&apos;язку ще не додано опис."}</p>
          </section>

          <section className="relation-detail-section">
            <h3>Що перевіряти</h3>
            <ul className="detail-bullet-list">
              {(relationInfo.relation.actions || ["Перевірити офіційні сторінки обох інституцій."]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="relation-link-columns">
            <RelationLinks node={relationInfo.fromNode} resources={relationInfo.fromResources} />
            <RelationLinks node={relationInfo.toNode} resources={relationInfo.toResources} />
          </section>

          <section className="relation-detail-section">
            <h3>Офіційні джерела</h3>
            {(relationInfo.relation.checks || []).length ? (
              <div className="relation-check-list">
                {relationInfo.relation.checks.map((item) => (
                  <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
                    {item.label}
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">Для цього зв&apos;язку поки не додано окремих джерел.</div>
            )}
          </section>
        </div>
      ) : (
        <div className="empty-state">
          Виберіть зв&apos;язок зі списку або натисніть на стрілку на полотні, щоб побачити пояснення.
        </div>
      )}
    </section>
  );
}
