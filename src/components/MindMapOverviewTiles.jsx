import useUi from "./app/useUi";
import OverviewTile from "./OverviewTile";

export default function MindMapOverviewTiles({ graphNodeCount, visibleRelationCount, activeNodeTitle }) {
  const { copy } = useUi();

  return (
    <section className="mindmap-overview-grid">
      <OverviewTile
        title={copy.nodesTitle}
        subtitle={graphNodeCount}
        text={copy.nodesText}
      />
      <OverviewTile
        title={copy.relationsTitle}
        subtitle={visibleRelationCount}
        text={copy.relationsText}
      />
      <OverviewTile
        title={copy.activeNodeTitle}
        subtitle={activeNodeTitle}
        text={copy.activeNodeText}
      />
    </section>
  );
}
