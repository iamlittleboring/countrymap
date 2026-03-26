import OverviewTile from "./OverviewTile";
import { getHierarchyLevels } from "../lib/overviewUtils";

export default function HierarchyOverviewTiles({ allNodes }) {
  const levels = getHierarchyLevels(allNodes);

  return (
    <section className="roadmap-grid">
      {levels.map((level) => (
        <OverviewTile
          key={level.id}
          title={level.title}
          subtitle={level.subtitle}
          text={level.text}
        />
      ))}
    </section>
  );
}
