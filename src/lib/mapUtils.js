export function flattenTree(node, path = []) {
  const current = { ...node, path };
  return [current, ...getChildren(node).flatMap((child) => flattenTree(child, [...path, node.id]))];
}

export function findNodeById(node, id) {
  if (node.id === id) return node;
  for (const child of getChildren(node)) {
    const found = findNodeById(child, id);
    if (found) return found;
  }
  return null;
}

export function getChildren(node) {
  return node?.children || [];
}

export function getNodeSearchText(node) {
  const details = node.details || {};
  return [
    node.id,
    node.type,
    node.title,
    node.description,
    details.what,
    ...(details.reportsTo || []),
    ...(details.manages || []),
    ...(details.functions || []),
    ...(details.includes || []),
    ...(details.interactions || []),
    ...(details.regulations || []),
    ...(details.citizenQuestions || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getSearchExpansionIds(matches, nodesById) {
  const ids = new Set();

  matches.forEach((id) => {
    const node = nodesById[id];
    if (!node) return;

    ids.add(id);
    node.path.forEach((parentId) => ids.add(parentId));
  });

  return ids;
}

export function getSearchSuggestions(nodes, query, limit = 6) {
  if (!query) return [];
  const normalizedQuery = query.toLowerCase();

  return nodes
    .map((node) => {
      const title = (node.title || "").toLowerCase();
      const description = (node.description || "").toLowerCase();
      const type = (node.type || "").toLowerCase();
      const id = (node.id || "").toLowerCase();
      let score = 0;

      if (title.startsWith(normalizedQuery)) score += 6;
      else if (title.includes(normalizedQuery)) score += 4;

      if (description.includes(normalizedQuery)) score += 2;
      if (type.includes(normalizedQuery) || id.includes(normalizedQuery)) score += 1;

      if (!score && !getNodeSearchText(node).includes(normalizedQuery)) return null;

      return { node, score };
    })
    .filter(Boolean)
    .sort((left, right) => right.score - left.score || left.node.title.localeCompare(right.node.title))
    .slice(0, limit)
    .map(({ node }) => node);
}

export function buildBreadcrumb(root, activeNode) {
  return [root, ...activeNode.path.map((id) => findNodeById(root, id)).filter(Boolean), activeNode].filter(
    (item, index, array) => array.findIndex((candidate) => candidate.id === item.id) === index,
  );
}
