import { useMemo } from "react";

export default function HierarchyOverviewTiles({ allNodes }) {
  const levels = useMemo(
    () =>
      Array.from(
        new Map(
          allNodes.map((node) => [
            node.level || 1,
            {
              id: `level-${node.level || 1}`,
              title: `Рівень ${node.level || 1}`,
              label: `${allNodes.filter((candidate) => (candidate.level || 1) === (node.level || 1)).length} вузлів`,
              description: "Ключові об'єкти цього рівня у загальній структурі.",
            },
          ]),
        ).values(),
      ).sort((left, right) => left.id.localeCompare(right.id)),
    [allNodes],
  );

  return (
    <section className="roadmap-grid">
      {levels.map((level) => (
        <article key={level.id} className="level-card">
          <p>{level.title}</p>
          <strong>{level.label}</strong>
          <span>{level.description}</span>
        </article>
      ))}
    </section>
  );
}
