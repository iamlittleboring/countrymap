import { Fragment } from "react";
import DetailSection from "./DetailSection";
import useUi from "./app/useUi";
import { DETAIL_SECTION_FIELDS } from "../lib/nodeDetails";
import { getChildren } from "../lib/mapUtils";

export default function NodeDetailsPanel({ activeNode, breadcrumb, typeMeta, onSelect }) {
  const { copy } = useUi();
  const meta = typeMeta[activeNode.type] || { label: activeNode.type };
  const details = activeNode.details || {};
  const children = getChildren(activeNode);

  return (
    <aside className="panel panel-details">
      <nav className="breadcrumb" aria-label={copy.breadcrumbAria}>
        {breadcrumb.map((item, index) => (
          <Fragment key={item.title}>
            <button type="button" className="breadcrumb-link" onClick={() => onSelect(item.id)}>
              {item.title}
            </button>
            {index < breadcrumb.length - 1 && <span>/</span>}
          </Fragment>
        ))}
      </nav>

      <div className="details-top">
        <div>
          <p className="eyebrow">{copy.nodeCardEyebrow}</p>
          <h2>{activeNode.title}</h2>
        </div>
        <div className="details-badges">
          <span className="type-badge">{meta.label}</span>
          <span className="type-badge type-badge-muted">{copy.levelLabel(activeNode.level || 1)}</span>
        </div>
      </div>

      <section className="details-section">
        <h3>{copy.whatIsThis}</h3>
        <p>{details.what || activeNode.description}</p>
      </section>

      {DETAIL_SECTION_FIELDS.map(([title, field]) => (
        <DetailSection key={field} title={title} items={details[field]} />
      ))}

      <section className="details-section">
        <h3>{copy.directChildren}</h3>
        {children.length ? (
          <div className="child-grid">
            {children.map((child) => (
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
          <div className="empty-state">{copy.noChildren}</div>
        )}
      </section>
    </aside>
  );
}
