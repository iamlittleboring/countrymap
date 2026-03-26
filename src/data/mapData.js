function normalizeItem(item) {
  return {
    ...item,
    details: item.details || {},
    children: item.children || [],
    connections: item.connections || [],
    resources: item.resources || { socials: [], verify: [] },
    position: item.position || null,
  };
}

async function loadJson(file, errorPrefix) {
  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${file}`);
  }

  return response.json();
}

function buildNodeTree(id, itemsById, path = []) {
  const item = itemsById[id];
  if (!item) return null;

  return {
    ...item,
    path,
    children: item.children
      .map((childId) => buildNodeTree(childId, itemsById, [...path, id]))
      .filter(Boolean),
  };
}

export function hydrateCountryMapData(indexData, items, connections) {
  const itemsById = Object.fromEntries(items.map((item) => [item.id, normalizeItem(item)]));
  const connectionsById = Object.fromEntries(connections.map((connection) => [connection.id, connection]));
  const hierarchyData = buildNodeTree(indexData.rootId, itemsById);

  return {
    hierarchyData,
    levels: indexData.levels || [],
    typeMeta: indexData.typeMeta || {},
    relationMeta: indexData.relationMeta || {},
    relations: connections,
    nodesById: itemsById,
    connectionsById,
    world: indexData.world || { width: 2200, height: 1500 },
    defaultActiveId: indexData.defaultActiveId || indexData.rootId,
    defaultExpandedIds: indexData.defaultExpandedIds || [indexData.rootId],
  };
}

export async function loadCountryMapData() {
  const indexData = await loadJson("/assets/countrymap/index.json", "Failed to load map index");

  const [items, connections] = await Promise.all([
    Promise.all((indexData.items || []).map(({ file }) => loadJson(file, "Failed to load item asset"))),
    Promise.all((indexData.connections || []).map(({ file }) => loadJson(file, "Failed to load connection asset"))),
  ]);

  return hydrateCountryMapData(indexData, items, connections);
}
