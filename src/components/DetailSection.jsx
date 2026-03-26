import { memo } from "react";

function DetailSection({ title, items }) {
  return (
    <section className="details-section">
      <h3>{title}</h3>
      {items?.length ? (
        <ul className="detail-bullet-list">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : <div className="empty-state">У цьому блоці поки немає даних.</div>}
    </section>
  );
}

export default memo(DetailSection);
