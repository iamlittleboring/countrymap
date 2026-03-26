export default function MindMapOverviewTiles({ graphNodeCount, visibleRelationCount, activeNodeTitle }) {
  return (
    <section className="mindmap-overview-grid">
      <article className="level-card">
        <p>Вузли</p>
        <strong>{graphNodeCount}</strong>
        <span>Елементи, які відображені на мапі.</span>
      </article>
      <article className="level-card">
        <p>Зв&apos;язки</p>
        <strong>{visibleRelationCount}</strong>
        <span>Стрілки між вузлами на полотні.</span>
      </article>
      <article className="level-card">
        <p>Активний вузол</p>
        <strong>{activeNodeTitle}</strong>
        <span>Поточний вибраний елемент.</span>
      </article>
    </section>
  );
}
