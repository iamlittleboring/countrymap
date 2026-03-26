import { useEffect, useMemo, useState } from "react";
import "./styles/app.css";
import AppHeader from "./components/AppHeader";
import LoadingState from "./components/app/LoadingState";
import MindMapHelpPanel from "./components/app/MindMapHelpPanel";
import HeroSearchPanel from "./components/HeroSearchPanel";
import HierarchyOverviewTiles from "./components/HierarchyOverviewTiles";
import MindMapOverviewTiles from "./components/MindMapOverviewTiles";
import NodeDetailsPanel from "./components/NodeDetailsPanel";
import RoutePageLayout from "./components/RoutePageLayout";
import { loadCountryMapData } from "./data/mapData";
import {
  buildBreadcrumb,
  flattenTree,
  getNodeSearchText,
  getSearchExpansionIds,
  getSearchSuggestions,
} from "./lib/mapUtils";
import HierarchyScreen from "./screens/HierarchyScreen";
import MindMapScreen from "./screens/MindMapScreen";

const EMPTY_SET = new Set();
const EMPTY_OBJECT = {};
const EMPTY_ARRAY = [];

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [screen, setScreen] = useState("list");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("");
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        const nextData = await loadCountryMapData();
        if (cancelled) return;
        setData(nextData);
        setActiveId(nextData.defaultActiveId);
        setExpanded(new Set(nextData.defaultExpandedIds));
        setError("");
      } catch (error) {
        if (cancelled) return;
        setError(error instanceof Error ? error.message : "Failed to load data");
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const hierarchyData = data?.hierarchyData;
  const relationMeta = data?.relationMeta || EMPTY_OBJECT;
  const relations = data?.relations || EMPTY_ARRAY;
  const typeMeta = data?.typeMeta || EMPTY_OBJECT;
  const world = data?.world;

  const allNodes = useMemo(() => (hierarchyData ? flattenTree(hierarchyData) : EMPTY_ARRAY), [hierarchyData]);
  const nodesById = useMemo(() => Object.fromEntries(allNodes.map((node) => [node.id, node])), [allNodes]);
  const mindMapNodes = allNodes.filter((node) => node.position);
  const normalizedQuery = query.trim().toLowerCase();

  const matches = useMemo(() => {
    if (!normalizedQuery) return EMPTY_SET;
    return new Set(allNodes.filter((node) => getNodeSearchText(node).includes(normalizedQuery)).map((node) => node.id));
  }, [allNodes, normalizedQuery]);

  const autoExpanded = useMemo(() => getSearchExpansionIds(matches, nodesById), [matches, nodesById]);
  const listSuggestions = useMemo(() => getSearchSuggestions(allNodes, normalizedQuery), [allNodes, normalizedQuery]);
  const activeNode = nodesById[activeId] || allNodes[0];
  const breadcrumb = useMemo(
    () => (hierarchyData && activeNode ? buildBreadcrumb(hierarchyData, activeNode) : EMPTY_ARRAY),
    [activeNode, hierarchyData],
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
    setExpanded(new Set([hierarchyData.id]));
  };

  const handleRevealNode = (nodeId) => {
    const node = nodesById[nodeId];
    if (!node) return;

    setActiveId(nodeId);
    setExpanded((previous) => {
      const next = new Set(previous);
      next.add(nodeId);
      node.path.forEach((parentId) => next.add(parentId));
      return next;
    });
    setQuery("");
  };

  const header = <AppHeader screen={screen} onScreenChange={setScreen} />;

  if (!data && !error) {
    return (
      <RoutePageLayout
        header={header}
        top={null}
        tiles={
          <LoadingState
            title="Завантажуємо карту"
            description="Готуємо структуру, щоб можна було перейти до списку та візуальної карти."
          />
        }
      />
    );
  }

  if (error || !hierarchyData || !activeNode) {
    return (
      <RoutePageLayout
        header={header}
        top={null}
        tiles={
          <LoadingState
            title="Не вдалося відкрити карту"
            description={error || "Дані не знайдено."}
          />
        }
      />
    );
  }

  const sharedTop = (
    <HeroSearchPanel
      className="hero-grid"
      content={
        <>
          <p className="eyebrow">Про проєкт</p>
          <h1>Карта структури країни</h1>
          <p className="hero-text">
            Цей проєкт допомагає швидко орієнтуватися в установах, їхніх ролях і зв&apos;язках між собою. Тут можна знайти потрібний вузол, подивитися його місце в ієрархії та перейти до візуальної карти взаємодій.
          </p>
        </>
      }
      search={{
        searchId: "global-search",
        searchControlsId: "global-search-results",
        query,
        setQuery,
        placeholder: "Пошук",
        activeId,
        typeMeta,
        suggestions: listSuggestions,
        onPick: (node) => handleRevealNode(node.id),
      }}
    />
  );

  return screen === "list" ? (
    <RoutePageLayout
      header={header}
      top={sharedTop}
      tiles={<HierarchyOverviewTiles allNodes={allNodes} />}
    >
      <HierarchyScreen
        query={query}
        activeId={activeId}
        expanded={expanded}
        autoExpanded={autoExpanded}
        matches={matches}
        hierarchyData={hierarchyData}
        typeMeta={typeMeta}
        activeNode={activeNode}
        breadcrumb={breadcrumb}
        onSelect={setActiveId}
        onToggle={handleToggle}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
      />
    </RoutePageLayout>
  ) : (
    <RoutePageLayout
      header={header}
      top={sharedTop}
      tiles={
        <MindMapOverviewTiles
          graphNodeCount={mindMapNodes.length}
          visibleRelationCount={relations.length}
          activeNodeTitle={activeNode.title}
        />
      }
    >
      <section>
        <MindMapScreen
          query={query}
          activeId={activeId}
          nodesById={nodesById}
          relations={relations}
          typeMeta={typeMeta}
          relationMeta={relationMeta}
          world={world}
          onSelect={setActiveId}
        />

        <div className="mindmap-sidebar-stack">
          <NodeDetailsPanel
            activeNode={activeNode}
            breadcrumb={breadcrumb}
            typeMeta={typeMeta}
            onSelect={setActiveId}
          />
          <MindMapHelpPanel />
        </div>
      </section>
    </RoutePageLayout>
  );
}
