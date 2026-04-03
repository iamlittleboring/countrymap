import "./styles/app.css";
import AppHeader from "./components/AppHeader";
import HeroSearchPanel from "./components/HeroSearchPanel";
import HierarchyOverviewTiles from "./components/HierarchyOverviewTiles";
import MindMapOverviewTiles from "./components/MindMapOverviewTiles";
import NodeDetailsPanel from "./components/NodeDetailsPanel";
import MindMapRelationsPanel from "./components/mindmap/MindMapRelationsPanel";
import LoadingState from "./components/app/LoadingState";
import MindMapHelpPanel from "./components/app/MindMapHelpPanel";
import { UiProvider } from "./components/app/UiContext";
import RoutePageLayout from "./components/RoutePageLayout";
import useAppState from "./lib/app/useAppState";
import HierarchyScreen from "./screens/HierarchyScreen";
import MindMapScreen from "./screens/MindMapScreen";

export default function App() {
  const {
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
  } = useAppState();

  const header = <AppHeader screen={screen} onScreenChange={setScreen} />;

  const content = !data && !error ? (
    <RoutePageLayout
      header={header}
      top={null}
      tiles={
        <LoadingState
          title={copy.loadingTitle}
          description={copy.loadingDescription}
        />
      }
    />
  ) : error || !hierarchyData || !activeNode ? (
    <RoutePageLayout
      header={header}
      top={null}
      tiles={
        <LoadingState
          title={copy.errorTitle}
          description={error || copy.errorDescription}
        />
      }
    />
  ) : (
    (() => {
      const sharedTop = (
        <HeroSearchPanel
          className="hero-grid"
          content={
            <>
              <p className="eyebrow">{copy.aboutProject}</p>
              <h1>{copy.heroTitle}</h1>
              <p className="hero-text">{copy.heroText}</p>
            </>
          }
          search={{
            searchId: "global-search",
            searchControlsId: "global-search-results",
            query,
            setQuery,
            placeholder: copy.searchPlaceholder,
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
            onSelect={handleSelectNode}
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
          <section className="mindmap-page">
            <MindMapScreen
              query={query}
              activeId={activeId}
              selectedRelationId={selectedRelationId}
              nodesById={nodesById}
              relations={relations}
              typeMeta={typeMeta}
              relationMeta={relationMeta}
              world={world}
              onSelect={handleSelectNode}
              onSelectRelation={handleSelectRelation}
            />

            <div className="mindmap-sidebar-stack">
              {relationInfo ? (
                <MindMapRelationsPanel
                  relationInfo={relationInfo}
                  relationMeta={relationMeta}
                  className="panel panel-details mindmap-relations-panel"
                  onClearSelection={clearSelectedRelation}
                />
              ) : (
                <NodeDetailsPanel
                  activeNode={activeNode}
                  breadcrumb={breadcrumb}
                  typeMeta={typeMeta}
                  onSelect={handleSelectNode}
                />
              )}
              <MindMapHelpPanel />
            </div>
          </section>
        </RoutePageLayout>
      );
    })()
  );

  return <UiProvider value={uiValue}>{content}</UiProvider>;
}
