import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import "./styles/app.css";
import AppHeader from "./components/AppHeader";
import HeroSearchPanel from "./components/HeroSearchPanel";
import HierarchyOverviewTiles from "./components/HierarchyOverviewTiles";
import MindMapOverviewTiles from "./components/MindMapOverviewTiles";
import NodeDetailsPanel from "./components/NodeDetailsPanel";
import RelationLegend from "./components/RelationLegend";
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

function MindMapHelpPanel() {
  return (
    <article className="panel">
      <header className="panel-header panel-header-compact">
        <div>
          <p className="eyebrow">Пояснення</p>
          <h2>Як читати стрілочки</h2>
        </div>
      </header>
      <div className="mindmap-help">
        <p>Стрілка показує напрямок взаємодії між двома вузлами.</p>
        <p>Колір і стиль лінії підказують тип зв&apos;язку: підпорядкування, координація, нагляд, сервіс або правова основа.</p>
        <p>Натисніть на стрілку, щоб побачити її пояснення та джерела для перевірки.</p>
      </div>
    </article>
  );
}

function LoadingState({ title, description }) {
  return (
    <section className="panel loading-panel">
      <p className="eyebrow">Проєкт</p>
      <h1>{title}</h1>
      <p className="hero-text">{description}</p>
    </section>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [loadingState, setLoadingState] = useState({ loading: true, error: "" });
  const [screen, setScreen] = useState("list");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState("");
  const [expanded, setExpanded] = useState(new Set());
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoadingState({ loading: true, error: "" });
        const nextData = await loadCountryMapData();
        if (cancelled) return;
        setData(nextData);
        setActiveId(nextData.defaultActiveId);
        setExpanded(new Set(nextData.defaultExpandedIds));
        setLoadingState({ loading: false, error: "" });
      } catch (error) {
        if (cancelled) return;
        setLoadingState({
          loading: false,
          error: error instanceof Error ? error.message : "Failed to load data",
        });
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const hierarchyData = data?.hierarchyData;
  const relationMeta = data?.relationMeta || {};
  const relations = data?.relations || [];
  const typeMeta = data?.typeMeta || {};
  const world = data?.world;

  const allNodes = useMemo(() => (hierarchyData ? flattenTree(hierarchyData) : []), [hierarchyData]);
  const nodesById = useMemo(
    () => Object.fromEntries(allNodes.map((node) => [node.id, node])),
    [allNodes],
  );
  const mindMapNodes = useMemo(() => allNodes.filter((node) => node.position), [allNodes]);

  const matches = useMemo(() => {
    if (!deferredQuery.trim()) return new Set();
    const normalizedQuery = deferredQuery.toLowerCase();
    return new Set(
      allNodes
        .filter((node) => getNodeSearchText(node).includes(normalizedQuery))
        .map((node) => node.id),
    );
  }, [allNodes, deferredQuery]);

  const autoExpanded = useMemo(() => getSearchExpansionIds(matches, nodesById), [matches, nodesById]);
  const listSuggestions = useMemo(() => getSearchSuggestions(allNodes, query), [allNodes, query]);
  const mapSuggestions = useMemo(() => getSearchSuggestions(mindMapNodes, query), [mindMapNodes, query]);

  const activeNode = nodesById[activeId] || allNodes[0];
  const breadcrumb = useMemo(
    () => (hierarchyData && activeNode ? buildBreadcrumb(hierarchyData, activeNode) : []),
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
    if (!hierarchyData) return;
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

  const handlePickMindMapSuggestion = (node) => {
    setQuery(node.title);
    setActiveId(node.id);
  };

  const header = <AppHeader screen={screen} onScreenChange={setScreen} />;

  if (loadingState.loading) {
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
        panelId={screen === "list" ? "list-panel" : "mindmap-panel"}
        tabId={screen === "list" ? "list-tab" : "mindmap-tab"}
      />
    );
  }

  if (loadingState.error || !hierarchyData || !activeNode) {
    return (
      <RoutePageLayout
        header={header}
        top={null}
        tiles={
          <LoadingState
            title="Не вдалося відкрити карту"
            description={loadingState.error || "Дані не знайдено."}
          />
        }
        panelId={screen === "list" ? "list-panel" : "mindmap-panel"}
        tabId={screen === "list" ? "list-tab" : "mindmap-tab"}
      />
    );
  }

  const sharedTop =
    screen === "list" ? (
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
          searchId: "hierarchy-search",
          searchControlsId: "hierarchy-search-results",
          query,
          setQuery: (value) => startTransition(() => setQuery(value)),
          placeholder: "Пошук",
          activeId,
          typeMeta,
          suggestions: listSuggestions,
          onPick: (node) => handleRevealNode(node.id),
        }}
      />
    ) : (
      <HeroSearchPanel
        className="hero-grid hero-grid-wide"
        content={
          <>
            <p className="eyebrow">Вид мапи</p>
            <h1>Мапа елементів і зв&apos;язків</h1>
            <p className="hero-text">
              Тут той самий зміст показаний як мережа взаємодій між ключовими вузлами системи.
            </p>
          </>
        }
        search={{
          searchId: "mindmap-search",
          searchControlsId: "mindmap-search-results",
          query,
          setQuery: (value) => startTransition(() => setQuery(value)),
          placeholder: "Пошук вузлів на мапі...",
          activeId,
          typeMeta,
          suggestions: mapSuggestions,
          onPick: handlePickMindMapSuggestion,
          note: "Можна тягнути полотно, масштабувати колесом миші та вибирати зв'язки зі списку нижче.",
          statusMessage: query.trim()
            ? mapSuggestions.length
              ? `Знайдено ${mapSuggestions.length} вузлів. Мапа сфокусована на результатах.`
              : "Нічого не знайдено. Спробуйте інший запит."
            : "",
          extra: <RelationLegend relationMeta={relationMeta} />,
        }}
      />
    );

  return screen === "list" ? (
    <RoutePageLayout
      header={header}
      top={sharedTop}
      tiles={<HierarchyOverviewTiles allNodes={allNodes} />}
      panelId="list-panel"
      tabId="list-tab"
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
      panelId="mindmap-panel"
      tabId="mindmap-tab"
      className="mindmap-page"
    >
      <MindMapScreen
        query={query}
        activeNode={activeNode}
        activeId={activeId}
        nodesById={nodesById}
        relations={relations}
        typeMeta={typeMeta}
        relationMeta={relationMeta}
        world={world}
        onSelect={setActiveId}
      />

      <section className="mindmap-details-wrap">
        <NodeDetailsPanel
          activeNode={activeNode}
          breadcrumb={breadcrumb}
          typeMeta={typeMeta}
          onSelect={setActiveId}
        />
        <MindMapHelpPanel />
      </section>
    </RoutePageLayout>
  );
}
