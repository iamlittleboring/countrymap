const RELATION_OFFSET_STEP = 18;

function getRelationGroupKey(from, to) {
  return [from, to].sort().join("::");
}

export function getCanonicalRelationPair(from, to) {
  return from.localeCompare(to) <= 0 ? [from, to] : [to, from];
}

export function getRelationOffsets(visibleRelations) {
  const groupedRelations = visibleRelations.reduce((groups, relation) => {
    const key = getRelationGroupKey(relation.from, relation.to);
    const currentGroup = groups.get(key) || [];
    currentGroup.push(relation);
    groups.set(key, currentGroup);
    return groups;
  }, new Map());

  return visibleRelations.reduce((offsets, relation) => {
    const group = groupedRelations.get(getRelationGroupKey(relation.from, relation.to)) || [relation];
    const sortedGroup = [...group].sort((first, second) => {
      if (first.from !== second.from) return first.from.localeCompare(second.from);
      if (first.to !== second.to) return first.to.localeCompare(second.to);
      return first.id.localeCompare(second.id);
    });
    const index = sortedGroup.findIndex((item) => item.id === relation.id);
    const centeredIndex = index - (sortedGroup.length - 1) / 2;
    offsets.set(relation.id, centeredIndex * RELATION_OFFSET_STEP);
    return offsets;
  }, new Map());
}
