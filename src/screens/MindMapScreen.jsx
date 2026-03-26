import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import NodeCard from "../components/NodeCard";
import { getNodeSearchText } from "../lib/mapUtils";
import minusIcon from "../assets/img/minus-outline.svg?raw";
import plusIcon from "../assets/img/plus-outline.svg?raw";
import fitToScreenIcon from "../assets/img/fit-to-screen.svg?raw";
import focusTargetIcon from "../assets/img/focus-target.svg?raw";

const FALLBACK_NODE_SIZE = {
  width: 220,
  height: 140,
};

const VIEWPORT_PADDING = 80;
const MIN_ZOOM = 0.45;
const MAX_ZOOM = 1.9;
const NODE_DRAG_THRESHOLD = 6;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getNodeCenter(position, size = FALLBACK_NODE_SIZE) {
  return {
    x: position.x + size.width / 2,
    y: position.y + size.height / 2,
  };
}

function getEdgePoint(center, target, size = FALLBACK_NODE_SIZE) {
  const dx = target.x - center.x;
  const dy = target.y - center.y;

  if (dx === 0 && dy === 0) return center;

  const halfWidth = size.width / 2;
  const halfHeight = size.height / 2;
  const scaleX = dx === 0 ? Number.POSITIVE_INFINITY : halfWidth / Math.abs(dx);
  const scaleY = dy === 0 ? Number.POSITIVE_INFINITY : halfHeight / Math.abs(dy);
  const scale = Math.min(scaleX, scaleY);

  return {
    x: center.x + dx * scale,
    y: center.y + dy * scale,
  };
}

function getLinePoints(from, to) {
  const startX = from.x;
  const startY = from.y;
  const endX = to.x;
  const endY = to.y;
  const dx = endX - startX;
  const dy = endY - startY;
  const c1x = startX + dx * 0.25;
  const c1y = startY + dy * 0.25;
  const c2x = startX + dx * 0.75;
  const c2y = endY - dy * 0.25;
  return `M ${startX} ${startY} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${endY}`;
}

function getContentBounds(graphNodes, nodeSizes) {
  if (!graphNodes.length) {
    return { minX: 0, minY: 0, maxX: FALLBACK_NODE_SIZE.width, maxY: FALLBACK_NODE_SIZE.height };
  }

  return graphNodes.reduce(
    (accumulator, { id, position }) => {
      const size = nodeSizes[id] || FALLBACK_NODE_SIZE;
      return {
        minX: Math.min(accumulator.minX, position.x),
        minY: Math.min(accumulator.minY, position.y),
        maxX: Math.max(accumulator.maxX, position.x + size.width),
        maxY: Math.max(accumulator.maxY, position.y + size.height),
      };
    },
    {
      minX: Number.POSITIVE_INFINITY,
      minY: Number.POSITIVE_INFINITY,
      maxX: Number.NEGATIVE_INFINITY,
      maxY: Number.NEGATIVE_INFINITY,
    },
  );
}

function getPanBounds(viewportWidth, viewportHeight, bounds, zoom) {
  const scaledWidth = (bounds.maxX - bounds.minX) * zoom;
  const scaledHeight = (bounds.maxY - bounds.minY) * zoom;
  const widthFits = scaledWidth + VIEWPORT_PADDING * 2 <= viewportWidth;
  const heightFits = scaledHeight + VIEWPORT_PADDING * 2 <= viewportHeight;

  return {
    minX: widthFits
      ? (viewportWidth - scaledWidth) / 2 - bounds.minX * zoom
      : viewportWidth - bounds.maxX * zoom - VIEWPORT_PADDING,
    maxX: widthFits
      ? (viewportWidth - scaledWidth) / 2 - bounds.minX * zoom
      : VIEWPORT_PADDING - bounds.minX * zoom,
    minY: heightFits
      ? (viewportHeight - scaledHeight) / 2 - bounds.minY * zoom
      : viewportHeight - bounds.maxY * zoom - VIEWPORT_PADDING,
    maxY: heightFits
      ? (viewportHeight - scaledHeight) / 2 - bounds.minY * zoom
      : VIEWPORT_PADDING - bounds.minY * zoom,
  };
}

function clampPan(pan, viewportWidth, viewportHeight, bounds, zoom) {
  const limits = getPanBounds(viewportWidth, viewportHeight, bounds, zoom);

  return {
    x: clamp(pan.x, limits.minX, limits.maxX),
    y: clamp(pan.y, limits.minY, limits.maxY),
  };
}

function formatVerifyLabel(url, index) {
  try {
    const { hostname } = new URL(url);
    return `Перевірити: ${hostname.replace(/^www\./, "")}`;
  } catch {
    return `Перевірити джерело ${index + 1}`;
  }
}

function RelationLinks({ node, resources }) {
  return (
    <div className="relation-links-card">
      <h3>{node.title}</h3>
      {resources?.site && (
        <a href={resources.site} target="_blank" rel="noreferrer">
          Офіційний сайт
        </a>
      )}
      {(resources?.socials || []).map((item) => (
        <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
          {item.label}
        </a>
      ))}
      {(resources?.verify || []).map((item, index) => (
        <a key={item} href={item} target="_blank" rel="noreferrer">
          {formatVerifyLabel(item, index)}
        </a>
      ))}
    </div>
  );
}

function IconButton({ label, icon, onClick }) {
  return (
    <button
      type="button"
      className="ghost-button icon-button"
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      <span className="icon-button-glyph" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} />
    </button>
  );
}

export default function MindMapScreen({
  query,
  activeNode,
  activeId,
  nodesById,
  relations,
  typeMeta,
  relationMeta,
  world,
  onSelect,
}) {
  const viewportRef = useRef(null);
  const dragRef = useRef({
    dragging: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startPanX: 0,
    startPanY: 0,
  });
  const nodeDragRef = useRef({
    dragging: false,
    pointerId: null,
    nodeId: null,
    startX: 0,
    startY: 0,
    startNodeX: 0,
    startNodeY: 0,
    moved: false,
  });
  const initialFitDoneRef = useRef(false);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedRelationKey, setSelectedRelationKey] = useState(null);
  const [nodeSizes, setNodeSizes] = useState({});
  const [nodePositions, setNodePositions] = useState({});
  const [draggingNodeId, setDraggingNodeId] = useState(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const resizeObserversRef = useRef({});

  useEffect(() => {
    setNodePositions((previous) => {
      const next = Object.values(nodesById).reduce((accumulator, node) => {
        if (node.position) {
          accumulator[node.id] = previous[node.id] || node.position;
        }
        return accumulator;
      }, {});

      const prevKeys = Object.keys(previous);
      const nextKeys = Object.keys(next);
      const changed =
        prevKeys.length !== nextKeys.length ||
        nextKeys.some((key) => {
          const prev = previous[key];
          const current = next[key];
          return !prev || prev.x !== current.x || prev.y !== current.y;
        });

      return changed ? next : previous;
    });
  }, [nodesById]);

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

  const selectedRelation = useMemo(() => {
    if (!selectedRelationKey) return null;
    return visibleRelations.find((relation) => relation.id === selectedRelationKey) || null;
  }, [selectedRelationKey, visibleRelations]);

  const relationInfo = useMemo(() => {
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
  }, [nodesById, selectedRelation]);

  const contentBounds = useMemo(() => getContentBounds(graphNodes, nodeSizes), [graphNodes, nodeSizes]);

  const setNodeElement = (id, element) => {
    const previousObserver = resizeObserversRef.current[id];
    if (previousObserver) {
      previousObserver.disconnect();
      delete resizeObserversRef.current[id];
    }

    if (!element) return;

    const updateSize = () => {
      setNodeSizes((previous) => {
        const nextWidth = Math.round(element.offsetWidth || FALLBACK_NODE_SIZE.width);
        const nextHeight = Math.round(element.offsetHeight || FALLBACK_NODE_SIZE.height);
        const current = previous[id];

        if (current?.width === nextWidth && current?.height === nextHeight) {
          return previous;
        }

        return {
          ...previous,
          [id]: {
            width: nextWidth,
            height: nextHeight,
          },
        };
      });
    };

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });
    observer.observe(element);
    resizeObserversRef.current[id] = observer;
  };

  useEffect(() => {
    const observers = resizeObserversRef.current;
    return () => {
      Object.values(observers).forEach((observer) => observer.disconnect());
    };
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const observer = new ResizeObserver(() => {
      setViewportSize({
        width: viewport.clientWidth,
        height: viewport.clientHeight,
      });
    });

    observer.observe(viewport);
    setViewportSize({
      width: viewport.clientWidth,
      height: viewport.clientHeight,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const input = document.getElementById("mindmap-search");
    if (!input) return;

    input.setAttribute("placeholder", "Пошук");
  }, []);

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
  }, [contentBounds, graphNodes.length]);

  const focusNode = useCallback((nodeId, preferredZoom = 1) => {
    const viewport = viewportRef.current;
    const nodePosition = nodePositions[nodeId];
    if (!viewport || !nodePosition) return;

    const width = viewport.clientWidth;
    const height = viewport.clientHeight;
    const size = nodeSizes[nodeId] || FALLBACK_NODE_SIZE;
    const center = getNodeCenter(nodePosition, size);
    const nextZoom = clamp(preferredZoom, MIN_ZOOM, MAX_ZOOM);
    const nextPan = clampPan(
      {
        x: width / 2 - center.x * nextZoom,
        y: height / 2 - center.y * nextZoom,
      },
      width,
      height,
      contentBounds,
      nextZoom,
    );

    setZoom(nextZoom);
    setPan(nextPan);
  }, [contentBounds, nodePositions, nodeSizes]);

  useEffect(() => {
    if (!viewportSize.width || !viewportSize.height || !graphNodes.length) return;
    if (Object.keys(nodeSizes).length < graphNodes.length) return;
    if (initialFitDoneRef.current) return;

    fitGraph();
    initialFitDoneRef.current = true;
  }, [fitGraph, graphNodes.length, nodeSizes, viewportSize.height, viewportSize.width]);

  useEffect(() => {
    if (!hasSearch) return;
    if (!hasSearchResults) return;

    let frameId = 0;

    if (matchedNodeIds.has(activeId)) {
      frameId = requestAnimationFrame(() => {
        focusNode(activeId, 1);
      });
      return () => cancelAnimationFrame(frameId);
    }

    const [firstMatchId] = [...matchedNodeIds];
    if (!firstMatchId) return;

    frameId = requestAnimationFrame(() => {
      onSelect(firstMatchId);
      focusNode(firstMatchId, 1);
    });

    return () => cancelAnimationFrame(frameId);
  }, [activeId, focusNode, hasSearch, hasSearchResults, matchedNodeIds, onSelect]);

  const beginDrag = (event) => {
    if (nodeDragRef.current.dragging) return;
    if (event.target.closest(".map-node-card")) return;
    dragRef.current = {
      dragging: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
    };
    viewportRef.current?.setPointerCapture(event.pointerId);
  };

  const onDrag = (event) => {
    if (nodeDragRef.current.dragging && nodeDragRef.current.pointerId === event.pointerId) {
      const { nodeId, startNodeX, startNodeY, startX, startY } = nodeDragRef.current;
      const rawDeltaX = event.clientX - startX;
      const rawDeltaY = event.clientY - startY;
      const hasMoved = Math.hypot(rawDeltaX, rawDeltaY) >= NODE_DRAG_THRESHOLD;

      if (!hasMoved) return;

      nodeDragRef.current.moved = true;
      const deltaX = rawDeltaX / zoom;
      const deltaY = rawDeltaY / zoom;

      setNodePositions((previous) => ({
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
  };

  const endDrag = (event) => {
    if (nodeDragRef.current.pointerId === event.pointerId) {
      if (!nodeDragRef.current.moved && nodeDragRef.current.nodeId) {
        onSelect(nodeDragRef.current.nodeId);
      }
      setDraggingNodeId(null);
      nodeDragRef.current = {
        dragging: false,
        pointerId: null,
        nodeId: null,
        startX: 0,
        startY: 0,
        startNodeX: 0,
        startNodeY: 0,
        moved: false,
      };
      if (event.currentTarget?.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }

    if (dragRef.current.pointerId === event.pointerId) {
      dragRef.current.dragging = false;
      dragRef.current.pointerId = null;
      viewportRef.current?.releasePointerCapture(event.pointerId);
    }
  };

  const beginNodeDrag = (nodeId, event) => {
    const position = nodePositions[nodeId];
    if (!position) return;

    event.stopPropagation();
    nodeDragRef.current = {
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
  };

  const handleWheel = useEffectEvent((event) => {
    event.preventDefault();
    const viewport = viewportRef.current;
    if (!viewport) return;

    const rect = viewport.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;
    const zoomFactor = event.deltaY < 0 ? 1.12 : 0.9;
    const nextZoom = clamp(Number((zoom * zoomFactor).toFixed(3)), MIN_ZOOM, MAX_ZOOM);
    const nextPan = clampPan(
      {
        x: cursorX - worldX * nextZoom,
        y: cursorY - worldY * nextZoom,
      },
      viewport.clientWidth,
      viewport.clientHeight,
      contentBounds,
      nextZoom,
    );

    setZoom(nextZoom);
    setPan(nextPan);
  });

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    viewport.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      viewport.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const applyZoom = (nextZoom) => {
    const viewport = viewportRef.current;
    if (!viewport) {
      setZoom(nextZoom);
      return;
    }

    const cursorX = viewport.clientWidth / 2;
    const cursorY = viewport.clientHeight / 2;
    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;
    const clampedZoom = clamp(nextZoom, MIN_ZOOM, MAX_ZOOM);
    const nextPan = clampPan(
      {
        x: cursorX - worldX * clampedZoom,
        y: cursorY - worldY * clampedZoom,
      },
      viewport.clientWidth,
      viewport.clientHeight,
      contentBounds,
      clampedZoom,
    );

    setZoom(clampedZoom);
    setPan(nextPan);
  };

  return (
    <>
      <section className="mindmap-canvas-panel panel">
        <header className="panel-header">
          <div>
            <h2>Глобальна мапа</h2>
          </div>
          <div className="mindmap-stats">
            <span>{graphNodes.length} вузлів</span>
            <span>{visibleRelations.length} зв&apos;язків</span>
            <span>Масштаб {Math.round(zoom * 100)}%</span>
          </div>
          <div className="mindmap-controls">
            <IconButton
              label="Зменшити масштаб"
              icon={minusIcon}
              onClick={() => applyZoom(Number((zoom - 0.15).toFixed(2)))}
            />
            <IconButton
              label="Збільшити масштаб"
              icon={plusIcon}
              onClick={() => applyZoom(Number((zoom + 0.15).toFixed(2)))}
            />
            <IconButton label="Уписати все" icon={fitToScreenIcon} onClick={fitGraph} />
            <IconButton
              label="До активного вузла"
              icon={focusTargetIcon}
              onClick={() => focusNode(activeId, Math.max(zoom, 1))}
            />
          </div>
        </header>

        <div
          ref={viewportRef}
          className="mindmap-viewport"
          onPointerDown={beginDrag}
          onPointerMove={onDrag}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
          onPointerCancel={endDrag}
        >
          <div
            className="mindmap-world"
            style={{
              width: `${world.width}px`,
              height: `${world.height}px`,
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
          >
            <svg
              className="mindmap-svg-world"
              viewBox={`0 0 ${world.width} ${world.height}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                {Object.entries(relationMeta).map(([key, meta]) => (
                  <marker
                    key={key}
                    id={`marker-${key}`}
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="4"
                    orient="auto"
                    markerUnits="strokeWidth"
                  >
                    <path d="M0,0 L8,4 L0,8 z" fill={meta.stroke} />
                  </marker>
                ))}
              </defs>

              {visibleRelations.map((relation) => {
                const fromCenter = getNodeCenter(nodePositions[relation.from], nodeSizes[relation.from] || FALLBACK_NODE_SIZE);
                const toCenter = getNodeCenter(nodePositions[relation.to], nodeSizes[relation.to] || FALLBACK_NODE_SIZE);
                const from = getEdgePoint(
                  fromCenter,
                  toCenter,
                  nodeSizes[relation.from] || FALLBACK_NODE_SIZE,
                );
                const to = getEdgePoint(
                  toCenter,
                  fromCenter,
                  nodeSizes[relation.to] || FALLBACK_NODE_SIZE,
                );
                const meta = relationMeta[relation.type];
                const pathDefinition = getLinePoints(from, to);
                const isRelated = activeId === relation.from || activeId === relation.to;
                const isSelected = selectedRelationKey === relation.id;

                return (
                  <g key={relation.id}>
                    <path
                      d={pathDefinition}
                      fill="none"
                      stroke={meta.stroke}
                      strokeWidth={isRelated ? 4 : 2.5}
                      strokeDasharray={meta.dash}
                      opacity={isSelected ? 1 : isRelated ? 1 : 0.45}
                      markerEnd={`url(#marker-${relation.type})`}
                    />
                    <path
                      d={pathDefinition}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="24"
                      className="mindmap-edge-hitbox"
                      onPointerDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedRelationKey(relation.id);
                      }}
                    />
                  </g>
                );
              })}
            </svg>

            {graphNodes.map(({ id, node, position }) => (
              <div
                key={id}
                ref={(element) => setNodeElement(id, element)}
                className={[
                  "mindmap-absolute-node",
                  draggingNodeId === id ? "mindmap-absolute-node-dragging" : "",
                  hasSearch && !matchedNodeIds.has(id) ? "mindmap-absolute-node-muted" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                }}
                onPointerDown={(event) => beginNodeDrag(id, event)}
              >
                <NodeCard
                  node={node}
                  activeId={activeId}
                  onSelect={onSelect}
                  typeMeta={typeMeta}
                  compact
                  muted={hasSearch && !matchedNodeIds.has(id)}
                  highlighted={hasSearch && matchedNodeIds.has(id)}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relation-detail-wrap">
        <article className="panel relation-detail-panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Деталі зв&apos;язку</p>
              <h2>{relationInfo ? relationInfo.relation.title : "Оберіть зв&apos;язок"}</h2>
            </div>
            {relationInfo && (
              <span className={`link-chip link-${relationInfo.relation.type}`}>
                {relationMeta[relationInfo.relation.type].label}
              </span>
            )}
          </header>

          <section className="relation-detail-section">
            <h3>Зв&apos;язки активного вузла</h3>
            {relatedRelations.length ? (
              <div className="relation-picker-grid">
                {relatedRelations.map((relation) => {
                  const otherNodeId = relation.from === activeId ? relation.to : relation.from;
                  const otherNode = nodesById[otherNodeId];

                  return (
                    <button
                      key={relation.id}
                      type="button"
                      className={[
                        "relation-picker-card",
                        selectedRelationKey === relation.id ? "relation-picker-card-active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onClick={() => setSelectedRelationKey(relation.id)}
                    >
                      <span className={`link-chip link-${relation.type}`}>{relationMeta[relation.type].label}</span>
                      <strong>{otherNode?.title || relation.title}</strong>
                      <span>{relation.title}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">Для активного вузла поки немає видимих зв&apos;язків на мапі.</div>
            )}
          </section>

          {relationInfo ? (
            <div className="relation-detail-grid">
              <section className="relation-detail-section">
                <h3>Опис зв&apos;язку</h3>
                <p>{relationInfo.relation.text || "Для цього зв&apos;язку ще не додано опис."}</p>
              </section>

              <section className="relation-detail-section">
                <h3>Що перевіряти</h3>
                <ul className="detail-bullet-list">
                  {(relationInfo.relation.actions || [
                    "Перевірити офіційні сторінки обох інституцій.",
                  ]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>

              <section className="relation-link-columns">
                <RelationLinks node={relationInfo.fromNode} resources={relationInfo.fromResources} />
                <RelationLinks node={relationInfo.toNode} resources={relationInfo.toResources} />
              </section>

              <section className="relation-detail-section">
                <h3>Офіційні джерела</h3>
                {(relationInfo.relation.checks || []).length ? (
                  <div className="relation-check-list">
                    {relationInfo.relation.checks.map((item) => (
                      <a key={item.url} href={item.url} target="_blank" rel="noreferrer">
                        {item.label}
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">Для цього зв&apos;язку поки не додано окремих джерел.</div>
                )}
              </section>
            </div>
          ) : (
            <div className="empty-state">
              Виберіть зв&apos;язок зі списку або натисніть на стрілку на полотні, щоб побачити пояснення.
            </div>
          )}
        </article>
      </section>
    </>
  );
}
