export function getHierarchyLevels(allNodes) {
  const levelCounts = new Map();

  for (const node of allNodes) {
    const level = node.level || 1;
    levelCounts.set(level, (levelCounts.get(level) || 0) + 1);
  }

  return [...levelCounts.entries()]
    .sort(([left], [right]) => left - right)
    .map(([level, count]) => ({
      id: `level-${level}`,
      title: `Рівень ${level}`,
      subtitle: `${count} вузлів`,
      text: "Ключові об'єкти цього рівня у загальній структурі.",
    }));
}

export function getPracticalNodes(allNodes, limit = 6) {
  return allNodes.filter((node) => (node.level || 1) === 4).slice(0, limit);
}
