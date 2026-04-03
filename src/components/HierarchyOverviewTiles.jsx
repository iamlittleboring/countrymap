import useUi from "./app/useUi";
import { getHierarchyLevels } from "../lib/overviewUtils";
import OverviewTile from "./OverviewTile";

export default function HierarchyOverviewTiles({ allNodes }) {
  const { copy } = useUi();
  const levels = getHierarchyLevels(allNodes);

  return (
    <section className="roadmap-grid">
      {levels.map((level) => (
        <OverviewTile
          key={level.id}
          title={copy.levelLabel(level.level)}
          subtitle={copy.nodeCountLabel(level.count)}
          text={copy.levelOverviewText}
        />
      ))}
    </section>
  );
}
