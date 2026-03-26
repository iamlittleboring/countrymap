export default function RelationLegend({ relationMeta }) {
  return (
    <div className="legend-grid">
      {Object.entries(relationMeta).map(([key, meta]) => (
        <div key={key} className="legend-item">
          <span
            className="legend-line"
            style={{
              "--legend-color": meta.stroke,
              borderTopStyle: meta.dash === "0" ? "solid" : "dashed",
            }}
          />
          <span>{meta.label}</span>
        </div>
      ))}
    </div>
  );
}
