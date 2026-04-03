import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import {
  INITIAL_DRAG,
  INITIAL_NODE_DRAG,
  INITIAL_PAN,
  NODE_DRAG_THRESHOLD,
} from "./constants";
import { clampPan, getContentBounds } from "./geometry";
import useFullscreenState from "./useFullscreenState";
import useMindMapViewport from "./useMindMapViewport";
import useNodeSizeRegistry from "./useNodeSizeRegistry";
import useViewportSize from "./useViewportSize";
import { getNodeSearchText } from "../mapUtils";

export default function useMindMapInteractions({
  query,
  activeId,
  selectedRelationId,
  nodesById,
  relations,
  onSelect,
}) {
  const fullscreenRef = useRef(null);
  const viewportRef = useRef(null);
  const dragRef = useRef(INITIAL_DRAG);
  const nodeDragRef = useRef(INITIAL_NODE_DRAG);
  const initialFitDoneRef = useRef(false);
  const ctrlHintTimeoutRef = useRef(null);

  const [pan, setPan] = useState(INITIAL_PAN);
  const [zoom, setZoom] = useState(1);
  const [nodeOverrides, setNodeOverrides] = useState({});
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [showCtrlHint, setShowCtrlHint] = useState(false);
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

  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLowerCase();
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
  const highlightedNodeId = selectedRelationId ? null : activeId;

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
    return () => {
      if (ctrlHintTimeoutRef.current) {
        clearTimeout(ctrlHintTimeoutRef.current);
      }
    };
  }, []);

  const handleViewportWheel = useCallback((event) => {
    if (!event.ctrlKey) {
      if (ctrlHintTimeoutRef.current) {
        clearTimeout(ctrlHintTimeoutRef.current);
      }

      setShowCtrlHint(true);
      ctrlHintTimeoutRef.current = setTimeout(() => {
        setShowCtrlHint(false);
        ctrlHintTimeoutRef.current = null;
      }, 1200);
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const zoomFactor = event.deltaY < 0 ? 1.12 : 0.9;
    setZoomState(Number((zoom * zoomFactor).toFixed(3)), cursorX, cursorY);
  }, [setZoomState, zoom]);

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

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const nativeWheelHandler = (event) => {
      handleViewportWheel(event);
    };

    viewport.addEventListener("wheel", nativeWheelHandler, { passive: false });

    return () => {
      viewport.removeEventListener("wheel", nativeWheelHandler);
    };
  }, [handleViewportWheel]);

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

  return {
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
  };
}
