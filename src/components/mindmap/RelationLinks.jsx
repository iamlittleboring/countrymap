import useUi from "../app/useUi";
import { formatVerifyLabel } from "../../lib/mindmap/resourceUtils";

export default function RelationLinks({ node, resources }) {
  const { copy } = useUi();

  return (
    <div className="relation-links-card">
      <h3>{node.title}</h3>
      {resources?.site && (
        <a href={resources.site} target="_blank" rel="noreferrer">
          {copy.officialSite}
        </a>
      )}
      {(resources?.socials || []).map((item) => (
        <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
          {item.label}
        </a>
      ))}
      {(resources?.verify || []).map((item, index) => (
        <a key={item} href={item} target="_blank" rel="noreferrer">
          {formatVerifyLabel(item, index, copy)}
        </a>
      ))}
    </div>
  );
}
