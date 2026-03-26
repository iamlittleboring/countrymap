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
  const indexResponse = await fetch("/assets/countrymap/index.json");
  if (!indexResponse.ok) {
    throw new Error(`Failed to load map index: ${indexResponse.status}`);
  }

  const indexData = await indexResponse.json();

  const [items, connections] = await Promise.all([
    Promise.all(
      (indexData.items || []).map(async ({ file }) => {
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`Failed to load item asset: ${file}`);
        }
        return response.json();
      }),
    ),
    Promise.all(
      (indexData.connections || []).map(async ({ file }) => {
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`Failed to load connection asset: ${file}`);
        }
        return response.json();
      }),
    ),
  ]);

  return hydrateCountryMapData(indexData, items, connections);
}
