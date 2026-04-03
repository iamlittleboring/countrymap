import fitToScreenIcon from "../assets/img/fit-to-screen.svg?raw";
import focusTargetIcon from "../assets/img/focus-target.svg?raw";
import minusIcon from "../assets/img/minus-outline.svg?raw";
import plusIcon from "../assets/img/plus-outline.svg?raw";
import MindMapCanvas from "../components/mindmap/MindMapCanvas";
import MindMapToolbar from "../components/mindmap/MindMapToolbar";
import useMindMapInteractions from "../lib/mindmap/useMindMapInteractions";

export default function MindMapScreen({
  query,
  activeId,
  selectedRelationId,
  nodesById,
  relations,
  typeMeta,
  relationMeta,
  world,
  onSelect,
  onSelectRelation,
}) {
  const {
    fullscreenRef,
    viewportRef,
    pan,
    zoom,
    draggingNodeId,
    showCtrlHint,
    nodeSizes,
    setNodeElement,
    graphNodes,
    visibleRelations,
    nodePositions,
    matchedNodeIds,
    hasSearch,
    highlightedNodeId,
    isFullscreen,
    toggleFullscreen,
    applyZoom,
    focusNode,
    beginDrag,
    onDrag,
    endDrag,
    beginNodeDrag,
  } = useMindMapInteractions({
    query,
    activeId,
    selectedRelationId,
    nodesById,
    relations,
    onSelect,
  });

  return (
    <article className="panel panel-mindmap">
      <section
        ref={fullscreenRef}
        className={["mindmap-canvas-panel", isFullscreen ? "mindmap-canvas-panel-fullscreen" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <MindMapToolbar
          isFullscreen={isFullscreen}
          graphNodeCount={graphNodes.length}
          visibleRelationCount={visibleRelations.length}
          zoom={zoom}
          minusIcon={minusIcon}
          plusIcon={plusIcon}
          fitToScreenIcon={fitToScreenIcon}
          focusTargetIcon={focusTargetIcon}
          onZoomOut={() => applyZoom(Number((zoom - 0.15).toFixed(2)))}
          onZoomIn={() => applyZoom(Number((zoom + 0.15).toFixed(2)))}
          onToggleFullscreen={toggleFullscreen}
          onFocusActive={() => focusNode(activeId, Math.max(zoom, 1))}
        />

        <MindMapCanvas
          viewportRef={viewportRef}
          isFullscreen={isFullscreen}
          world={world}
          pan={pan}
          zoom={zoom}
          relationMeta={relationMeta}
          visibleRelations={visibleRelations}
          nodePositions={nodePositions}
          nodeSizes={nodeSizes}
          activeId={highlightedNodeId}
          selectedRelationKey={selectedRelationId}
          graphNodes={graphNodes}
          draggingNodeId={draggingNodeId}
          hasSearch={hasSearch}
          matchedNodeIds={matchedNodeIds}
          showCtrlHint={showCtrlHint}
          typeMeta={typeMeta}
          onSelect={onSelect}
          onSelectRelation={onSelectRelation}
          setNodeElement={setNodeElement}
          onBeginDrag={beginDrag}
          onDrag={onDrag}
          onEndDrag={endDrag}
          onBeginNodeDrag={beginNodeDrag}
        />
      </section>

    </article>
  );
}
