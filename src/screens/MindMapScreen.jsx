import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import fitToScreenIcon from "../assets/img/fit-to-screen.svg?raw";
import focusTargetIcon from "../assets/img/focus-target.svg?raw";
import minusIcon from "../assets/img/minus-outline.svg?raw";
import plusIcon from "../assets/img/plus-outline.svg?raw";
import MindMapCanvas from "../components/mindmap/MindMapCanvas";
import MindMapRelationsPanel from "../components/mindmap/MindMapRelationsPanel";
import MindMapToolbar from "../components/mindmap/MindMapToolbar";
import {
  INITIAL_DRAG,
  INITIAL_NODE_DRAG,
  INITIAL_PAN,
  NODE_DRAG_THRESHOLD,
} from "../lib/mindmap/constants";
import { clampPan, getContentBounds } from "../lib/mindmap/geometry";
import useFullscreenState from "../lib/mindmap/useFullscreenState";
import useMindMapViewport from "../lib/mindmap/useMindMapViewport";
import useNodeSizeRegistry from "../lib/mindmap/useNodeSizeRegistry";
import useViewportSize from "../lib/mindmap/useViewportSize";
import { getNodeSearchText } from "../lib/mapUtils";

export default function MindMapScreen({
  query,
  activeId,
  nodesById,
  relations,
  typeMeta,
  relationMeta,
  world,
  onSelect,
}) {
  const fullscreenRef = useRef(null);
  const viewportRef = useRef(null);
  const dragRef = useRef(INITIAL_DRAG);
  const nodeDragRef = useRef(INITIAL_NODE_DRAG);
  const initialFitDoneRef = useRef(false);

  const [pan, setPan] = useState(INITIAL_PAN);
  const [zoom, setZoom] = useState(1);
  const [selectedRelationKey, setSelectedRelationKey] = useState(null);
  const [nodeOverrides, setNodeOverrides] = useState({});
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const { nodeSizes, setNodeElement } = useNodeSizeRegistry();
  const [viewportSize, setViewportSize] = useViewportSize(viewportRef);

  const nodePositions = useMemo(
    () =>
      Object.fromEntries(
        Object.values(nodesById)
          .filter((node) => node.position)
          .map((node) => [node.id, nodeOverrides[node.id] || node.position]),
      ),
    [nodeOverrides, nodesById],
  );

  const graphNodes = useMemo(
    () =>
      Object.values(nodesById)
        .filter((node) => nodePositions[node.id])
        .map((node) => ({
          id: node.id,
          node,
          position: nodePositions[node.id],
        })),
    [nodePositions, nodesById],
  );

  const normalizedQuery = query.trim().toLowerCase();
  const matchedNodeIds = useMemo(() => {
    if (!normalizedQuery) return new Set();

    return new Set(
      graphNodes
        .filter(({ node }) => getNodeSearchText(node).includes(normalizedQuery))
        .map(({ id }) => id),
    );
  }, [graphNodes, normalizedQuery]);

  const hasSearch = normalizedQuery.length > 0;
  const hasSearchResults = matchedNodeIds.size > 0;

  const visibleRelations = useMemo(
    () =>
      relations.filter((item) => {
        const from = nodePositions[item.from];
        const to = nodePositions[item.to];
        if (!from || !to) return false;
        if (!hasSearch) return true;
        return matchedNodeIds.has(item.from) || matchedNodeIds.has(item.to);
      }),
    [hasSearch, matchedNodeIds, nodePositions, relations],
  );

  const relatedRelations = useMemo(
    () => visibleRelations.filter((relation) => relation.from === activeId || relation.to === activeId),
    [activeId, visibleRelations],
  );

  const relationInfo = useMemo(() => {
    const relation = visibleRelations.find((item) => item.id === selectedRelationKey);
    if (!relation) return null;

    const fromNode = nodesById[relation.from];
    const toNode = nodesById[relation.to];

    return {
      relation,
      fromNode,
      toNode,
      fromResources: fromNode?.resources,
      toResources: toNode?.resources,
    };
  }, [nodesById, selectedRelationKey, visibleRelations]);

  const contentBounds = useMemo(() => getContentBounds(graphNodes, nodeSizes), [graphNodes, nodeSizes]);
  const { applyZoom, fitGraph, focusNode, setZoomState } = useMindMapViewport({
    viewportRef,
    graphNodes,
    contentBounds,
    nodePositions,
    nodeSizes,
    pan,
    zoom,
    setPan,
    setZoom,
  });
  const { isFullscreen, toggleFullscreen } = useFullscreenState({
    fullscreenRef,
    viewportRef,
    fitGraph,
    setViewportSize,
  });

  useEffect(() => {
    if (!viewportSize.width || !viewportSize.height || !graphNodes.length) return;
    if (Object.keys(nodeSizes).length < graphNodes.length) return;
    if (initialFitDoneRef.current) return;

    fitGraph();
    initialFitDoneRef.current = true;
  }, [fitGraph, graphNodes.length, nodeSizes, viewportSize.height, viewportSize.width]);

  useEffect(() => {
    if (!hasSearch || !hasSearchResults) return;

    let frameId = 0;

    if (matchedNodeIds.has(activeId)) {
      frameId = requestAnimationFrame(() => {
        focusNode(activeId, 1);
      });
      return () => cancelAnimationFrame(frameId);
    }

    const [firstMatchId] = [...matchedNodeIds];
    if (!firstMatchId) return undefined;

    frameId = requestAnimationFrame(() => {
      onSelect(firstMatchId);
      focusNode(firstMatchId, 1);
    });

    return () => cancelAnimationFrame(frameId);
  }, [activeId, focusNode, hasSearch, hasSearchResults, matchedNodeIds, onSelect]);

  const beginDrag = useCallback((event) => {
    if (nodeDragRef.current.dragging) return;
    if (event.target.closest(".map-node-card")) return;

    dragRef.current = {
      ...INITIAL_DRAG,
      dragging: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };

    viewportRef.current?.setPointerCapture(event.pointerId);
  }, [pan.x, pan.y]);

  const onDrag = useCallback((event) => {
    if (nodeDragRef.current.dragging && nodeDragRef.current.pointerId === event.pointerId) {
      const { nodeId, startNodeX, startNodeY, startX, startY } = nodeDragRef.current;
      const rawDeltaX = event.clientX - startX;
      const rawDeltaY = event.clientY - startY;

      if (Math.hypot(rawDeltaX, rawDeltaY) < NODE_DRAG_THRESHOLD) return;

      nodeDragRef.current.moved = true;
      const deltaX = rawDeltaX / zoom;
      const deltaY = rawDeltaY / zoom;

      setNodeOverrides((previous) => ({
        ...previous,
        [nodeId]: {
          x: Math.round(startNodeX + deltaX),
          y: Math.round(startNodeY + deltaY),
        },
      }));
      return;
    }

    if (!dragRef.current.dragging || dragRef.current.pointerId !== event.pointerId) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    const nextPan = clampPan(
      {
        x: dragRef.current.startPanX + (event.clientX - dragRef.current.startX),
        y: dragRef.current.startPanY + (event.clientY - dragRef.current.startY),
      },
      viewport.clientWidth,
      viewport.clientHeight,
      contentBounds,
      zoom,
    );

    setPan(nextPan);
  }, [contentBounds, zoom]);

  const endDrag = useCallback((event) => {
    if (nodeDragRef.current.pointerId === event.pointerId) {
      if (!nodeDragRef.current.moved && nodeDragRef.current.nodeId) {
        onSelect(nodeDragRef.current.nodeId);
      }

      setDraggingNodeId(null);
      nodeDragRef.current = INITIAL_NODE_DRAG;

      if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }

    if (dragRef.current.pointerId === event.pointerId) {
      dragRef.current.dragging = false;
      dragRef.current.pointerId = null;
      viewportRef.current?.releasePointerCapture(event.pointerId);
    }
  }, [onSelect]);

  const beginNodeDrag = useCallback((nodeId, event) => {
    const position = nodePositions[nodeId];
    if (!position) return;

    event.stopPropagation();
    nodeDragRef.current = {
      ...INITIAL_NODE_DRAG,
      dragging: true,
      pointerId: event.pointerId,
      nodeId,
      startX: event.clientX,
      startY: event.clientY,
      startNodeX: position.x,
      startNodeY: position.y,
      moved: false,
    };

    setDraggingNodeId(nodeId);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [nodePositions]);

  const handleWheel = useCallback((event) => {
    event.preventDefault();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const zoomFactor = event.deltaY < 0 ? 1.12 : 0.9;
    setZoomState(Number((zoom * zoomFactor).toFixed(3)), cursorX, cursorY);
  }, [setZoomState, zoom]);

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
          activeId={activeId}
          selectedRelationKey={selectedRelationKey}
          setSelectedRelationKey={setSelectedRelationKey}
          graphNodes={graphNodes}
          draggingNodeId={draggingNodeId}
          hasSearch={hasSearch}
          matchedNodeIds={matchedNodeIds}
          typeMeta={typeMeta}
          onSelect={onSelect}
          setNodeElement={setNodeElement}
          onBeginDrag={beginDrag}
          onDrag={onDrag}
          onEndDrag={endDrag}
          onWheel={handleWheel}
          onBeginNodeDrag={beginNodeDrag}
        />
      </section>

      <MindMapRelationsPanel
        activeId={activeId}
        nodesById={nodesById}
        relationInfo={relationInfo}
        relationMeta={relationMeta}
        relatedRelations={relatedRelations}
        selectedRelationKey={selectedRelationKey}
        setSelectedRelationKey={setSelectedRelationKey}
      />
    </article>
  );
}
