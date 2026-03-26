import React, { memo } from "react";
import DetailSection from "./DetailSection";
import { getChildren } from "../lib/mapUtils";

function NodeDetailsPanel({ activeNode, breadcrumb, typeMeta, onSelect }) {
  const meta = typeMeta[activeNode.type] || { label: activeNode.type };
  const details = activeNode.details || {};

  return (
    <aside className="panel panel-details">
      <nav className="breadcrumb" aria-label="Навігаційний ланцюжок">
        {breadcrumb.map((item, index) => (
          <React.Fragment key={item.title}>
            <button type="button" className="breadcrumb-link" onClick={() => onSelect(item.id)}>
              {item.title}
            </button>
            {index < breadcrumb.length - 1 && <span>/</span>}
          </React.Fragment>
        ))}
      </nav>

      <div className="details-top">
        <div>
          <p className="eyebrow">Картка вузла</p>
          <h2>{activeNode.title}</h2>
        </div>
        <div className="details-badges">
          <span className="type-badge">{meta.label}</span>
          <span className="type-badge type-badge-muted">Рівень {activeNode.level || 1}</span>
        </div>
      </div>

      <section className="details-section">
        <h3>Що це</h3>
        <p>{details.what || activeNode.description}</p>
      </section>

      <DetailSection title="Кому підпорядковується" items={details.reportsTo} />
      <DetailSection title="Ким керує" items={details.manages} />
      <DetailSection title="Основні функції" items={details.functions} />
      <DetailSection title="Які органи входять" items={details.includes} />
      <DetailSection title="Як взаємодіє з іншими структурами" items={details.interactions} />
      <DetailSection title="Які документи регулюють роботу" items={details.regulations} />
      <DetailSection title="Типові питання громадянина" items={details.citizenQuestions} />

      <section className="details-section">
        <h3>Прямі нижчі вузли</h3>
        {getChildren(activeNode).length ? (
          <div className="child-grid">
            {getChildren(activeNode).map((child) => (
              <button
                key={child.id}
                type="button"
                className="child-card"
                onClick={() => onSelect(child.id)}
              >
                <strong>{child.title}</strong>
                <span>{child.description}</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="empty-state">На цьому вузлі нижчих елементів зараз немає.</div>
        )}
      </section>
    </aside>
  );
}

export default memo(NodeDetailsPanel);
