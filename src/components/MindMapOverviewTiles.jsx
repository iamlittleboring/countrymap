import OverviewTile from "./OverviewTile";

export default function MindMapOverviewTiles({ graphNodeCount, visibleRelationCount, activeNodeTitle }) {
  return (
    <section className="mindmap-overview-grid">
      <OverviewTile
        title="Вузли"
        subtitle={graphNodeCount}
        text="Елементи, які відображені на мапі."
      />
      <OverviewTile
        title="Зв&apos;язки"
        subtitle={visibleRelationCount}
        text="Стрілки між вузлами на полотні."
      />
      <OverviewTile
        title="Активний вузол"
        subtitle={activeNodeTitle}
        text="Поточний вибраний елемент."
      />
    </section>
  );
}
