import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { loadCountryMapData } from "../../data/mapData";
import {
  buildBreadcrumb,
  flattenTree,
  getNodeSearchText,
  getSearchExpansionIds,
  getSearchSuggestions,
} from "../mapUtils";
import { UI_COPY } from "../uiCopy";
import { STORAGE_KEYS, persistPreference, readPreference } from "./preferences";

const EMPTY_SET = new Set();
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];

function getExpandedSetWithNodePath(previous, nodeId, nodesById) {
  const node = nodesById[nodeId];
  if (!node) return previous;

  const next = new Set(previous);
  next.add(nodeId);
  node.path.forEach((parentId) => next.add(parentId));
  return next;
}

function getRelationInfo(selectedRelation, nodesById) {
  if (!selectedRelation) return null;

  const fromNode = nodesById[selectedRelation.from];
  const toNode = nodesById[selectedRelation.to];

  return {
    relation: selectedRelation,
    fromNode,
    toNode,
    fromResources: fromNode?.resources,
    toResources: toNode?.resources,
  };
}

export default function useAppState() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [screen, setScreen] = useState("list");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("");
  const [selectedRelationId, setSelectedRelationId] = useState(null);
  const [expanded, setExpanded] = useState(new Set());
  const [theme, setTheme] = useState(() => readPreference(STORAGE_KEYS.theme, "light"));
  const [language, setLanguage] = useState(() => readPreference(STORAGE_KEYS.language, "uk"));

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const nextData = await loadCountryMapData();
        if (cancelled) return;
        setData(nextData);
        setActiveId(nextData.defaultActiveId);
        setSelectedRelationId(null);
        setExpanded(new Set(nextData.defaultExpandedIds));
        setError("");
      } catch (nextError) {
        if (cancelled) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load data");
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    persistPreference(STORAGE_KEYS.theme, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language === "uk" ? "uk" : "en";
    persistPreference(STORAGE_KEYS.language, language);
  }, [language]);

  const hierarchyData = data?.hierarchyData;
  const relationMeta = data?.relationMeta || EMPTY_OBJECT;
  const relations = data?.relations || EMPTY_ARRAY;
  const typeMeta = data?.typeMeta || EMPTY_OBJECT;
  const world = data?.world;
  const copy = UI_COPY[language] || UI_COPY.uk;

  const allNodes = useMemo(() => (hierarchyData ? flattenTree(hierarchyData) : EMPTY_ARRAY), [hierarchyData]);
  const nodesById = useMemo(() => Object.fromEntries(allNodes.map((node) => [node.id, node])), [allNodes]);
  const mindMapNodes = useMemo(() => allNodes.filter((node) => node.position), [allNodes]);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!normalizedQuery) return EMPTY_SET;
    return new Set(allNodes.filter((node) => getNodeSearchText(node).includes(normalizedQuery)).map((node) => node.id));
  }, [allNodes, normalizedQuery]);

  const autoExpanded = useMemo(() => getSearchExpansionIds(matches, nodesById), [matches, nodesById]);
  const listSuggestions = useMemo(() => getSearchSuggestions(allNodes, normalizedQuery), [allNodes, normalizedQuery]);
  const activeNode = nodesById[activeId] || allNodes[0];
  const selectedRelation = useMemo(
    () => relations.find((relation) => relation.id === selectedRelationId) || null,
    [relations, selectedRelationId],
  );
  const relationInfo = useMemo(() => getRelationInfo(selectedRelation, nodesById), [nodesById, selectedRelation]);
  const breadcrumb = useMemo(
    () => (hierarchyData && activeNode ? buildBreadcrumb(hierarchyData, activeNode) : EMPTY_ARRAY),
    [activeNode, hierarchyData],
  );
  const uiValue = useMemo(
    () => ({ theme, setTheme, language, setLanguage, copy }),
    [theme, language, copy],
  );

  const handleToggle = (id) => {
    setExpanded((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpanded(new Set(allNodes.map((node) => node.id)));
  };

  const handleCollapseAll = () => {
    if (!hierarchyData) return;
    setExpanded(new Set([hierarchyData.id]));
  };

  const handleRevealNode = (nodeId) => {
    if (!nodesById[nodeId]) return;

    setSelectedRelationId(null);
    setActiveId(nodeId);
    setExpanded((previous) => getExpandedSetWithNodePath(previous, nodeId, nodesById));
    setQuery("");
  };

  const handleSelectNode = (nodeId) => {
    setSelectedRelationId(null);
    setActiveId(nodeId);
  };

  const handleSelectRelation = (relationId) => {
    setSelectedRelationId(relationId);
  };

  const clearSelectedRelation = () => {
    setSelectedRelationId(null);
  };

  return {
    data,
    error,
    screen,
    setScreen,
    query,
    setQuery,
    activeId,
    selectedRelationId,
    expanded,
    autoExpanded,
    matches,
    hierarchyData,
    relationMeta,
    relations,
    typeMeta,
    world,
    copy,
    allNodes,
    nodesById,
    mindMapNodes,
    listSuggestions,
    activeNode,
    relationInfo,
    breadcrumb,
    uiValue,
    handleToggle,
    handleExpandAll,
    handleCollapseAll,
    handleRevealNode,
    handleSelectNode,
    handleSelectRelation,
    clearSelectedRelation,
  };
}
