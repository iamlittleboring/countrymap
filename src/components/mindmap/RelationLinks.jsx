import { formatVerifyLabel } from "../../lib/mindmap/resourceUtils";

export default function RelationLinks({ node, resources }) {
  return (
    <div className="relation-links-card">
      <h3>{node.title}</h3>
      {resources?.site && (
        <a href={resources.site} target="_blank" rel="noreferrer">
          Офіційний сайт
        </a>
      )}
      {(resources?.socials || []).map((item) => (
        <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
          {item.label}
        </a>
      ))}
      {(resources?.verify || []).map((item, index) => (
        <a key={item} href={item} target="_blank" rel="noreferrer">
          {formatVerifyLabel(item, index)}
        </a>
      ))}
    </div>
  );
}
