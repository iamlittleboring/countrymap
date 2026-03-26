import { useCallback } from "react";
import { MAX_ZOOM, MIN_ZOOM, VIEWPORT_PADDING } from "./constants";
import { clamp, clampPan, getNodeCenter } from "./geometry";

export default function useMindMapViewport({
  viewportRef,
  graphNodes,
  contentBounds,
  nodePositions,
  nodeSizes,
  pan,
  zoom,
  setPan,
  setZoom,
}) {
  const setZoomState = useCallback((nextZoom, anchorX, anchorY) => {
    const viewport = viewportRef.current;
    const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);

    if (!viewport) {
      setZoom(clampedZoom);
      return;
    }

    const worldX = (anchorX - pan.x) / zoom;
    const worldY = (anchorY - pan.y) / zoom;
    const nextPan = clampPan(
      {
        x: anchorX - worldX * clampedZoom,
        y: anchorY - worldY * clampedZoom,
      },
      viewport.clientWidth,
      viewport.clientHeight,
      contentBounds,
      clampedZoom,
    );

    setZoom(clampedZoom);
    setPan(nextPan);
  }, [contentBounds, pan.x, pan.y, setPan, setZoom, viewportRef, zoom]);

  const fitGraph = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || !graphNodes.length) return;

    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    const contentWidth = contentBounds.maxX - contentBounds.minX;
    const contentHeight = contentBounds.maxY - contentBounds.minY;

    if (!contentWidth || !contentHeight) return;

    const nextZoom = clamp(
      Math.min(
        (width - VIEWPORT_PADDING * 2) / contentWidth,
        (height - VIEWPORT_PADDING * 2) / contentHeight,
      ),
      MIN_ZOOM,
      MAX_ZOOM,
    );

    const nextPan = clampPan(
      {
        x: (width - contentWidth * nextZoom) / 2 - contentBounds.minX * nextZoom,
        y: (height - contentHeight * nextZoom) / 2 - contentBounds.minY * nextZoom,
      },
      width,
      height,
      contentBounds,
      nextZoom,
    );

    setZoom(nextZoom);
    setPan(nextPan);
  }, [contentBounds, graphNodes.length, setPan, setZoom, viewportRef]);

  const focusNode = useCallback((nodeId, preferredZoom = 1) => {
    const viewport = viewportRef.current;
    const nodePosition = nodePositions[nodeId];
    if (!viewport || !nodePosition) return;

    const size = nodeSizes[nodeId];
    const center = getNodeCenter(nodePosition, size);
    const nextZoom = clamp(preferredZoom, MIN_ZOOM, MAX_ZOOM);
    const nextPan = clampPan(
      {
        x: viewport.clientWidth / 2 - center.x * nextZoom,
        y: viewport.clientHeight / 2 - center.y * nextZoom,
      },
      viewport.clientWidth,
      viewport.clientHeight,
      contentBounds,
      nextZoom,
    );

    setZoom(nextZoom);
    setPan(nextPan);
  }, [contentBounds, nodePositions, nodeSizes, setPan, setZoom, viewportRef]);

  const applyZoom = useCallback((nextZoom) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      setZoom(clamp(nextZoom, MIN_ZOOM, MAX_ZOOM));
      return;
    }

    setZoomState(nextZoom, viewport.clientWidth / 2, viewport.clientHeight / 2);
  }, [setZoom, setZoomState, viewportRef]);

  return {
    applyZoom,
    fitGraph,
    focusNode,
    setZoomState,
  };
}
